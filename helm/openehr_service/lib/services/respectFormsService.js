/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Alexey Kucherenko <alexei.kucherenko@gmail.com>                  |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  15 April 2019

*/

'use strict';

const P = require('bluebird');
const { transform } = require('qewd-transform-json');
const { logger } = require('../core');
const { UnprocessableEntityError } = require('../errors');
const { Heading, ResponseFormat } = require('../shared/enums');
const { headingHelpers, getHeadingDefinition, getHeadingMap } = require('../shared/headings');
const { buildSourceId, getCompositionVersions, flatMap, parseVersion, unflatten } = require('../shared/utils');

const ok = () => ({ ok: true });
const fail = (err) => ({ ok: false, error: err });

// fix status

class RespectFormsService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new RespectFormsService(ctx);
  }

  /**
   * Gets formatted data by source id and version
   *
   * @param  {string} sourceId
   * @param  {int} number
   * @param  {string} format
   * @return {Object}
   */
  getBySourceIdAndVersion(sourceId, version, format = ResponseFormat.DETAIL) {
    logger.info('services/respectFormsService|getBySourceIdAndVersion', { sourceId, version, format });

    let responseObj = {};

    const { headingCache } = this.ctx.cache;
    const dbData = headingCache.byVersion.get(sourceId, version);
    if (!dbData) return responseObj;

    const heading = dbData.heading;

    const headingDef = getHeadingDefinition(heading);
    if (!headingDef) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised`);
    }

    const headingMap = getHeadingMap(heading, 'get');
    if (!headingMap) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no GET definition available`);
    }

    const synopsisField = headingDef.textFieldName;
    const summaryFields = headingDef.headingTableFields.slice(0);

    if (dbData.pulsetile) {
      responseObj = dbData.pulsetile;
    }
    else {
      const host = dbData.host;
      const helpers = headingHelpers(host, heading, 'get');
      const data = unflatten(dbData.data);

      responseObj = transform(headingMap.transformTemplate, data, helpers);
      responseObj.source = dbData.host;
      responseObj.sourceId = sourceId;
      responseObj.version = version;

      dbData.pulsetile = responseObj;
      headingCache.bySourceId.set(sourceId, dbData);
    }

    // only return the synopsis
    if (format === ResponseFormat.SYNOPSIS) {
      return {
        sourceId: sourceId,
        version: version,
        source: responseObj.source,
        text: responseObj[synopsisField] || ''
      };
    }

    // only return the summary
    if (format === ResponseFormat.SUMMARY) {
      const resultObj = {};
      const commonSummaryFields = ['source', 'sourceId', 'version'];

      [
        ...commonSummaryFields,
        ...summaryFields
      ].forEach(x => resultObj[x] = responseObj[x] || '');

      return resultObj;
    }

    return responseObj;
  }

  /**
   * Fetch records from OpenEHR servers for respect forms heading
   *
   * @param  {string|int} patientId
   * @return {Promise.<Object>}
   */
  async fetchOne(patientId) {
    logger.info('services/respectFormsService|fetchOne', { patientId });

    const hosts = Object.keys(this.ctx.serversConfig);
    await P.each(hosts, async (host) => await this.fetch(host, patientId));

    return ok();
  }

  /**
   * Sends a request to OpenEHR server to gets records and caches results.
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @return {Promise.<Object>}
   */
  async fetch(host, patientId) {
    logger.info('services/respectFormsService|fetch', { host, patientId });

    const heading = Heading.RESPECT_FORMS;
    const { headingCache } = this.ctx.cache;
    const { headingService } = this.ctx.services;

    const exists = headingCache.byHost.exists(patientId, heading, host);
    if (exists) return null;

    try {
      const data = await headingService.query(host, patientId, heading);

      // data can be empty when query handled by jumper module
      await P.each(data || [], async (result) => {
        if (result.uid) {
          const sourceId = buildSourceId(host, result.uid);
          const compositionIds = getCompositionVersions(result.uid);
          const dateCreated = result.date_created || result.dateCreated;
          const date = new Date(dateCreated).getTime();

          await P.each(compositionIds, async (compositionId) =>  {
            const version = parseVersion(compositionId);
            const compositionObj = await headingService.get(host, compositionId);

            const dbData = {
              heading: heading,
              host: host,
              patientId: patientId,
              date: date,
              data: compositionObj,
              uid: result.uid
            };

            headingCache.byHost.set(patientId, heading, host, sourceId);
            headingCache.byDate.set(patientId, heading, date, sourceId);
            headingCache.byVersion.set(sourceId, version, dbData);
          });
        }
      });

      return ok();
    } catch (err) {
      logger.error('services/respectFormsService|fetch|err:', err);

      return fail(err);
    }
  }

  /**
   * Gets summary data
   *
   * @param  {string|int} patientId
   * @return {Object[]}
   */
  getSummary(patientId) {
    logger.info('services/respectFormsService|getSummary', { patientId });

    const { headingCache } = this.ctx.cache;

    const heading = Heading.RESPECT_FORMS;
    const sourceIds = headingCache.byDate.getAllSourceIds(patientId, heading);

    const mappedVersions = flatMap(sourceIds, (sourceId) => {
      const versions = headingCache.byVersion.getAllVersions(sourceId);

      return versions.map(version =>
        ({
          sourceId,
          version
        })
      );
    });

    return mappedVersions.map(x => this.getBySourceIdAndVersion(x.sourceId, x.version, ResponseFormat.SUMMARY));
  }
}

module.exports = RespectFormsService;
