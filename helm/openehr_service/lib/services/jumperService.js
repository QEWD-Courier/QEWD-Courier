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

  16 March 2019

*/

'use strict';

const { logger, OpenEhrAdapter } = require('../core');
const jumper = require('../jumper');

class JumperService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new JumperService(ctx);
  }

  /**
   * Checks and returns jumper config
   *
   * @param  {string} heading
   * @param  {string} method
   * @return {Object}
   */
  check(heading, method) {
    logger.info('services/jumperService|check', { heading, method });

    const headingConfig = this.ctx.getHeadingConfig(heading);
    const result = Boolean(jumper[method] && headingConfig && headingConfig.template && headingConfig.template.name);
    const jumperObj = {
      ok: result
    };

    if (headingConfig && headingConfig.synopsisField) {
      jumperObj.synopsisField = headingConfig.synopsisField;
    }

    if (headingConfig && headingConfig.summaryTableFields) {
      jumperObj.summaryTableFields = headingConfig.summaryTableFields.slice(0);
    }

    return jumperObj;
  }

  /**
   * Gets data by source id
   *
   * @param  {string} sourceId
   * @return {Promise.<Object>}
   */
  async getBySourceId(sourceId) {
    logger.info('services/jumperService|getBySourceId', { sourceId });

    const format = 'pulsetile';

    return jumper.getBySourceId.call(this.ctx.worker, sourceId, format, this.ctx.qewdSession);
  }

  /**
   * Gets heading records
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @return {Promise.<Object>}
   */
  async query(host, patientId, heading) {
    logger.info('services/jumperService|query', { host, patientId, heading });

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, patientId);
    const adapter = new OpenEhrAdapter(this.ctx);

    return new Promise((resolve, reject) => {
      const params = {
        host,
        patientId,
        heading,
        ehrId,
        openEHR: adapter,
        openEHRSession: {
          id: sessionId
        },
        qewdSession: this.ctx.qewdSession
      };

      jumper.query.call(this.ctx.worker, params, (responseObj) => {
        if (responseObj && responseObj.error) return reject(responseObj);

        return resolve(responseObj);
      });
    });
  }

  /**
   * Creates a new heading record
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async post(host, patientId, heading, data) {
    logger.info('services/jumperService|post', { host, patientId, heading, data: typeof data});

    return new Promise((resolve, reject) => {
      const params = {
        defaultHost: host,
        patientId,
        heading,
        data,
        method: 'post',
        qewdSession: this.ctx.qewdSession
      };

      jumper.post.call(this.ctx.worker, params, (responseObj) => {
        if (responseObj.error) return reject(responseObj);

        return resolve(responseObj);
      });
    });
  }

  /**
   * Updates an existing heading record
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {string} compositionId
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async put(host, patientId, heading, compositionId, data) {
    logger.info('services/jumperService|put', { host, patientId, heading, compositionId, data: typeof data});

    return new Promise((resolve, reject) => {
      const params = {
        defaultHost: host,
        patientId,
        heading,
        compositionId,
        data,
        method: 'put',
        qewdSession: this.ctx.qewdSession
      };

      jumper.post.call(this.ctx.worker, params, (responseObj) => {
        if (responseObj.error) return reject(responseObj);

        return resolve(responseObj);
      });
    });
  }
}

module.exports = JumperService;
