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

  18 April 2019

*/

'use strict';

const P = require('bluebird');
const template = require('qewd-template');
const { transform } = require('qewd-transform-json');
const { logger } = require('../core');
const { NotFoundError, UnprocessableEntityError } = require('../errors');
const { Heading, QueryFormat, ResponseFormat } = require('../shared/enums');
const { headingHelpers, getHeadingDefinition, getHeadingMap, getHeadingQuery } = require('../shared/headings');
const { buildCompositionId, buildSourceId, flatMap, parseCompositionId, flatten, unflatten } = require('../shared/utils');

const ok = () => ({ ok: true });
const fail = (err) => ({ ok: false, error: err });

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
   * @param  {int} version
   * @param  {string} format
   * @return {Promise.<Object>}
   */
  async getBySourceId(sourceId, version, format = ResponseFormat.DETAIL) {
    logger.info('services/respectFormsService|getBySourceId', { sourceId, version, format });

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
      headingCache.byVersion.set(sourceId, version, dbData);
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
   * Creates a new form version
   *
   * @param  {string} host
   * @param  {string} heading
   * @param  {string} sourceId
   * @param  {string} version
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async put(host, heading, sourceId, version, data) {
    logger.info('services/respectFormsService|put', { host, heading, sourceId, version, data });

    const { headingCache } = this.ctx.cache;
    const dbData = headingCache.byVersion.get(sourceId, version);
    if (!dbData) {
      throw new NotFoundError(`No existing ${heading} record found for sourceId: ${sourceId} and version: ${version}`);
    }

    const compositionId = dbData.uid;
    if (!compositionId) {
      throw new NotFoundError(`Composition Id not found for sourceId: ${sourceId} and version: ${version}`);
    }

    const headingMap = getHeadingMap(heading, 'post');
    if (!headingMap) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no POST definition available`);
    }

    const { ehrSessionService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);

    const helpers = headingHelpers(host, heading, 'post');
    const output = transform(headingMap.transformTemplate, data, helpers);
    const postData = flatten(output);

    Object.keys(postData).forEach(x => {
    if (Array.isArray(postData[x])) {
      if (postData[x].length === 0) {
        delete postData[x];
      }
    }
  });

    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.putComposition(sessionId, compositionId, headingMap.templateId, postData);
    logger.debug('response: %j', responseObj);

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.compositionUid
      ? {
        ok: true,
        host: host,
        heading: heading,
        compositionUid: responseObj.compositionUid,
        action: responseObj.action
      }
      : {
        ok: false
      };
  }

  /**
   * Fetch records from OpenEHR servers
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
    const { headingService, patientService, queryService } = this.ctx.services;

    const exists = headingCache.byHost.exists(patientId, heading, host);
    if (exists) return null;

    try {
      await patientService.check(host, patientId);
      const data = await headingService.query(host, patientId, heading);

      await P.each(data || [], async (result) => {
        if (result.uid) {
          const sourceId = buildSourceId(host, result.uid);
          const { uuid, host: compositionHost } = parseCompositionId(result.uid);
          const dateCreated = result.date_created || result.dateCreated;
          const date = new Date(dateCreated).getTime();

          const format = QueryFormat.SQL;
          const templateId = 'respectforms_versions';
          const headingQuery = getHeadingQuery(heading, { format, templateId });
          const subs = {
            uuid
          };
          const query = template.replace(headingQuery, subs);
          logger.debug('query: %s', query);

          const versionsData = await queryService.postQuery(host, query, { format });

          const dbData = await P.mapSeries(versionsData, async (x) => {
            const compositionId = buildCompositionId(x.id, compositionHost, x.version);
            const compositionObj = await headingService.get(host, compositionId);

            return {
              heading: heading,
              host: host,
              patientId: patientId,
              version: x.version,
              date: date,
              data: compositionObj,
              uid: compositionId
            };
          });

          if (dbData && dbData.length > 0) {
            headingCache.byHost.set(patientId, heading, host, sourceId);
            headingCache.byDate.set(patientId, heading, date, sourceId);

            dbData.forEach(y => {
              headingCache.byVersion.set(sourceId, y.version, y);
            });
          }
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
   * @return {Promise.<Object[]>}
   */
  async getSummary(patientId) {
    logger.info('services/respectFormsService|getSummary', { patientId });

    const { headingCache } = this.ctx.cache;

    const heading = Heading.RESPECT_FORMS;
    const sourceIds = headingCache.byHost.getAllSourceIds(patientId, heading);
    const data = flatMap(sourceIds, (sourceId) => {
      const versions = headingCache.byVersion.getAllVersions(sourceId);

      return versions.map(version =>
        ({
          sourceId,
          version
        })
      );
    });

    const results = await P.mapSeries(data, (x) => this.getBySourceId(x.sourceId, x.version, ResponseFormat.SUMMARY));
    const fetchCount = headingCache.fetchCount.increment(patientId, heading);

    return {
      results,
      fetchCount
    };
  }
}

module.exports = RespectFormsService;
