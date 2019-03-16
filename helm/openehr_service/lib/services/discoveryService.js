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

  7 March 2019

*/

'use strict';

const P = require('bluebird');
const { logger } = require('../core');
const { buildSourceId } = require('../shared/utils');
const debug = require('debug')('helm:openehr:services:discovery');

class DiscoveryService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new DiscoveryService(ctx);
  }

  /**
   * Merges discovery data
   *
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {Object[]} data
   * @return {Promise.<bool>}
   */
  async mergeAll(host, patientId, heading, data) {
    logger.info('services/discoveryService|mergeAll', { host, patientId, heading, data });

    // before we start the processing loop, obtain an OpenEHR session and ensure an ehrId exists
    // this ensures it's available for each iteration of the loop instead of each
    // iteration creating a new one

    const { patientService } = this.ctx.services;
    await patientService.getEhrId(host, patientId);

    // The posts are serialised - only one at a time, and the next one isn't sent till the
    // previous one gets a response from OpenEHR - so as not to flood the OpenEHR system with POSTs
    const results = await P.mapSeries(data, x => this.merge(host, patientId, heading, x));

    return results.some(x => x);
  }

  /**
   * Merges a single discovery item
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {Object} item
   * @return {Promise.<bool>}
   */
  async merge(host, patientId, heading, item) {
    logger.info('services/discoveryService|merge', { host, patientId, heading, item });

    const discoverySourceId = item.sourceId;

    const { discoveryDb } = this.ctx.db;
    const found = discoveryDb.getSourceIdByDiscoverySourceId(discoverySourceId);
    if (found) return false;

    let result = false;
    debug('discovery record %s needs to be added to %s', discoverySourceId, host);

    try {
      const data = {
        data: item,
        format: 'pulsetile',
        source: 'GP'
      };

      const { headingService } = this.ctx.services;
      const responseObj = await headingService.post(host, patientId, heading, data);
      debug('response: %j', responseObj);
      if (!responseObj.ok) return result;

      const sourceId = buildSourceId(host, responseObj.compositionUid);
      debug('openehr sourceId: %s', sourceId);

      const dbData = {
        discovery: discoverySourceId,
        openehr: responseObj.compositionUid,
        patientId: patientId,
        heading: heading
      };

      discoveryDb.insert(discoverySourceId, sourceId, dbData);

      result = true;
    } catch (err) {
      logger.error('services/discoveryService|merge|err:', err.message);
    }

    return result;
  }

  /**
   * Deletes discovery data by sourceId
   *
   * @param  {string} sourceId
   * @return {Promise}
   */
  async delete(sourceId) {
    logger.info('services/discoveryService|delete', { sourceId });

    const { discoveryDb } = this.ctx.db;
    const dbData = discoveryDb.getBySourceId(sourceId);

    if (dbData) {
      discoveryDb.delete(dbData.discovery, sourceId);
    }
  }

  /**
   * Gets all sourceIds
   *
   * @return {Promise.<string[]>}
   */
  async getAllSourceIds() {
    logger.info('services/discoveryService|getAllSourceIds');

    const { discoveryDb } = this.ctx.db;
    const sourceIds = discoveryDb.getAllSourceIds();

    return sourceIds;
  }

  /**
   * Gets sourceIds by some condition
   *
   * @param  {Function} filter
   * @return {Promise.<string[]>}
   */
  async getSourceIds(filter) {
    logger.info('services/discoveryService|getSourceIds', { filter: typeof filter });

    const { discoveryDb } = this.ctx.db;
    const sourceIds = discoveryDb.getSourceIds(filter);

    return sourceIds;
  }

  /**
   * Gets by sourceId
   *
   * @param  {string} sourceId
   * @return {Promise.<Object>}
   */
  async getBySourceId(sourceId) {
    logger.info('services/discoveryService|getBySourceId', { sourceId });

    const { discoveryDb } = this.ctx.db;
    const dbData = discoveryDb.getBySourceId(sourceId);

    return dbData;
  }
}

module.exports = DiscoveryService;
