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

  16 April 2019

*/

'use strict';

const P = require('bluebird');
const template = require('qewd-template');
const { transform } = require('qewd-transform-json');
const { logger } = require('../core');
const { NotFoundError, UnprocessableEntityError } = require('../errors');
const { Heading, ResponseFormat } = require('../shared/enums');
const { headingHelpers, getHeadingDefinition, getHeadingMap, getHeadingQuery } = require('../shared/headings');
const { buildSourceId, flatten } = require('../shared/utils');
const debug = require('debug')('helm:openehr:services:heading');

const ok = () => ({ ok: true });
const fail = (err) => ({ ok: false, error: err });

class HeadingService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new HeadingService(ctx);
  }

  /**
   * Gets a composition record
   *
   * @param  {string} host
   * @param  {string} sourceId
   * @return {Promise.<Object>}
   */
  async get(host, compositionId) {
    logger.info('services/headingService|get', { host, compositionId });

    const { ehrSessionService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);

    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.getComposition(sessionId, compositionId);
    logger.debug('responseObj:', { responseObj });

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.composition
      ? responseObj.composition
      : null;
  }

  /**
   * Creates heading record
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async post(host, patientId, heading, data) {
    logger.info('services/headingService|post', { host, patientId, heading, data });

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, 'post');
    logger.debug('jumper post status: j', jumper);

    if (jumper.ok) {
      return jumperService.post(host, patientId, heading, data);
    }

    const headingMap = getHeadingMap(heading, 'post');
    if (!headingMap) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no POST definition available`);
    }

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, patientId);

    const helpers = headingHelpers(host, heading, 'post');
    const output = transform(headingMap.transformTemplate, data.data, helpers);
    const postData = flatten(output);

    // TODO: fix me (hack)
    Object.keys(postData).forEach(x => {
      if (Array.isArray(postData[x])) {
        if (postData[x].length === 0) {
          delete postData[x];
        }
      }
    });

    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.postComposition(sessionId, ehrId, headingMap.templateId, postData);
    debug('response: %j', responseObj);

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.compositionUid
      ? {
        ok: true,
        host: host,
        heading: heading,
        compositionUid: responseObj.compositionUid
      }
      : {
        ok: false
      };
  }

  /**
   * Updates heading record
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {string} sourceId
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async put(host, patientId, heading, sourceId, data) {
    logger.info('services/headingService|put', { host, patientId, heading, sourceId, data });

    const { headingCache } = this.ctx.cache;
    const dbData = headingCache.bySourceId.get(sourceId);
    if (!dbData) {
      throw new NotFoundError(`No existing ${heading} record found for sourceId: ${sourceId}`);
    }

    const compositionId = dbData.uid;
    if (!compositionId) {
      throw new NotFoundError(`Composition Id not found for sourceId: ${sourceId}`);
    }

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, 'put');
    logger.debug('jumper put status:', { jumper });

    if (jumper.ok) {
      return jumperService.put(host, patientId, heading, compositionId, data);
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
    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.putComposition(sessionId, compositionId, headingMap.templateId, postData);
    debug('response: %j', responseObj);

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
   * Sends a query request to OpenEHR server to get data for a heading
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @return {Promise.<Object[]>}
   */
  async query(host, patientId, heading) {
    logger.info('services/headingService|query', { host, patientId, heading });

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, 'query');
    logger.debug('jumper query status:', { jumper });

    if (jumper.ok) {
      return jumperService.query(host, patientId, heading);
    }

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, patientId);

    const headingQuery = getHeadingQuery(heading);
    const subs = {
      ehrId
    };
    const query = template.replace(headingQuery, subs);
    logger.debug('query:', { query });

    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.query(sessionId, query);
    logger.debug('responseObj:', { responseObj });

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.resultSet
      ? responseObj.resultSet
      : [];
  }

  /**
   * Gets formatted data by source id
   *
   * @param  {string} sourceId
   * @param  {string} format
   * @return {Promise.<Object>}
   */
  async getBySourceId(sourceId, format = ResponseFormat.DETAIL) {
    logger.info('services/headingService|getBySourceId', { sourceId, format });

    let responseObj = {};

    const { headingCache } = this.ctx.cache;
    const dbData = headingCache.bySourceId.get(sourceId);
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

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, 'getBySourceId');
    logger.debug('jumper getBySourceId status:', { jumper });

    const synopsisField = jumper.ok && jumper.synopsisField
      ? jumper.synopsisField
      : headingDef.textFieldName;
    const summaryFields  = jumper.ok && jumper.summaryFields
      ? jumper.summaryFields
      : headingDef.headingTableFields.slice(0);

    if (dbData.pulsetile) {
      responseObj = dbData.pulsetile;
    }
    else if (jumper.ok && dbData.jumperFormatData) {
      // fetch PulseTile-format data from cache if it hasn't been converted to PulseTile format
      // this will do so and cache it in that format
      responseObj = await jumperService.getBySourceId(sourceId);
    }
    else {
      const host = dbData.host;
      const helpers = headingHelpers(host, heading, 'get');

      responseObj = transform(headingMap.transformTemplate, dbData.data, helpers);

      responseObj.source = dbData.host;
      responseObj.sourceId = sourceId;

      dbData.pulsetile = responseObj;
      headingCache.bySourceId.set(sourceId, dbData);
    }

    // check if this is a mapped record from discovery
    const { discoveryDb } = this.ctx.db;
    const found = discoveryDb.checkBySourceId(sourceId);
    if (found) {
      responseObj.source = 'GP';
    }

    // only return the synopsis headings
    if (format === ResponseFormat.SYNOPSIS) {
      return {
        sourceId: sourceId,
        source: responseObj.source,
        text: responseObj[synopsisField] || ''
      };
    }

    // only return the summary headings
    if (format === ResponseFormat.SUMMARY) {
      const resultObj = {};
      const commonSummaryFields = ['source', 'sourceId'];

      [
        ...commonSummaryFields,
        ...summaryFields
      ].forEach(x => resultObj[x] = responseObj[x] || '');

      return resultObj;
    }

    return responseObj;
  }

  /**
   * Gets summary data for a single heading
   *
   * @param  {string|int} patientId
   * @param  {string} headings
   * @return {Promise.<Object>}
   */
  async getSummary(patientId, heading) {
    logger.info('services/headingService|getSummary', { patientId, heading });

    const { headingCache } = this.ctx.cache;
    const sourceIds = headingCache.byHost.getAllSourceIds(patientId, heading);

    const results = await P.mapSeries(sourceIds, x => this.getBySourceId(x, ResponseFormat.SUMMARY));
    const fetchCount = headingCache.fetchCount.increment(patientId, heading);

    return {
      results,
      fetchCount
    };
  }

  /**
   * Gets synopsis data for a multiple headings
   *
   * @param  {string|int} patientId
   * @param  {string[]} headings
   * @param  {int} limit
   * @return {Promise.<Object>}
   */
  async getSynopses(patientId, headings, limit) {
    logger.info('services/headingService|getSynopses', { patientId, headings, limit });

    const resultObj = {};

    await P.each(headings, async (heading) => {
      const { results } = await this.getSynopsis(patientId, heading, limit);
      resultObj[heading] = results;
    });

    return resultObj;
  }

  /**
   * Gets synopsis data for a single heading
   *
   * @param  {string|int} patientId
   * @param  {string} headings
   * @param  {int} limit
   * @return {Promise.<Object>}
   */
  async getSynopsis(patientId, heading, limit) {
    logger.info('services/headingService|getSynopsis', { patientId, heading, limit });

    const { headingCache } = this.ctx.cache;
    const sourceIds = headingCache.byDate.getAllSourceIds(patientId, heading, { limit });

    const results = await P.mapSeries(sourceIds, x => this.getBySourceId(x, ResponseFormat.SYNOPSIS));

    return {
      results
    };
  }

  /**
   * Fetch records from OpenEHR servers for multiple headings
   *
   * @param  {string|int} patientId
   * @param  {string[]} headings
   * @return {Promise.<Object>}
   */
  async fetchMany(patientId, headings) {
    logger.info('services/headingService|fetchMany', { patientId, headings });

    await P.each(headings, async (heading) => {
      try {
        await this.fetchOne(patientId, heading);
      } catch (err) {
        logger.error('services/headingService|fetchMany|err:', err);
      }
    });

    return ok();
  }

  /**
   * Fetch records from OpenEHR servers for single heading
   *
   * @param  {string|int} patientId
   * @param  {string} heading
   * @return {Promise.<Object>}
   */
  async fetchOne(patientId, heading) {
    logger.info('services/headingService|fetchOne', { patientId, heading });

    const hosts = Object.keys(this.ctx.serversConfig);
    await P.each(hosts, async (host) => await this.fetch(host, patientId, heading));

    return ok();
  }

  /**
   * Sends a request to OpenEHR server to gets records and caches results.
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @return {Promise.<Object>}
   */
  async fetch(host, patientId, heading) {
    logger.info('services/headingService|fetch', { host, patientId, heading });

    const { headingCache } = this.ctx.cache;

    const exists = headingCache.byHost.exists(patientId, heading, host);
    if (exists) return null;

    try {
      const data = await this.query(host, patientId, heading);
      const now = Date.now();

      // data can be empty when query handled by jumper module
      (data || []).forEach((result) => {
        if (heading === Heading.COUNTS) {
          result.uid = result.ehrId + '::';
          result.dateCreated = now;
        }

        if (result.uid) {
          const sourceId = buildSourceId(host, result.uid);
          const dateCreated = result.date_created || result.dateCreated;
          const date = new Date(dateCreated).getTime();

          const dbData = {
            heading: heading,
            host: host,
            patientId: patientId,
            date: date,
            data: result,
            uid: result.uid
          };

          headingCache.byHost.set(patientId, heading, host, sourceId);
          headingCache.byDate.set(patientId, heading, date, sourceId);
          headingCache.bySourceId.set(sourceId, dbData);
        }
      });

      return ok();
    } catch (err) {
      logger.error('services/headingService|fetch|err:', err);

      return fail(err);
    }
  }

  /**
   * Deletes heading record
   *
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {string} sourceId
   * @return {Promise<Object>}
   */
  async delete(patientId, heading, sourceId) {
    logger.info('services/headingService|delete', { patientId, heading, sourceId });

    const { headingCache } = this.ctx.cache;

    const dbData = headingCache.bySourceId.get(sourceId);
    if (!dbData) {
      throw new NotFoundError(`No existing ${heading} record found for sourceId: ${sourceId}`);
    }

    const compositionId = dbData.uid;
    const host = dbData.host;
    const date = dbData.date;

    if (!compositionId) {
      throw new NotFoundError(`Composition Id not found for sourceId: ${sourceId}`);
    }

    const { ehrSessionService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);

    const ehrRestService = this.ctx.rest[host];
    await ehrRestService.deleteComposition(sessionId, compositionId);

    headingCache.byHost.delete(patientId, heading, host, sourceId);
    headingCache.byDate.delete(patientId, heading, date, sourceId);
    headingCache.bySourceId.delete(sourceId);
    headingCache.byHeading.delete(heading, sourceId);

    await ehrSessionService.stop(host, sessionId);

    return {
      deleted: true,
      patientId: patientId,
      heading: heading,
      compositionId: compositionId,
      host: host
    };
  }
}

module.exports = HeadingService;
