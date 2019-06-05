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

  17 April 2019

*/

'use strict';

const { logger } = require('../core');
const { EhrIdNotFoundError } = require('../errors');

class PatientService {
  constructor(ctx) {
    this.ctx = ctx;
    this.ehrSessionService = this.ctx.services.ehrSessionService;
  }

  static create(ctx) {
    return new PatientService(ctx);
  }

  /**
   * Gets or create Ehr Id
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @return {Object}
   */
  async check(host, patientId) {
    logger.info('services/patientService|check', { host, patientId });

    let data = null;

    const { sessionId } = await this.ehrSessionService.start(host);

    const ehrRestService = this.ctx.rest[host];

    try {
      data = await ehrRestService.getEhr(sessionId, patientId);
      logger.debug('get ehr data: %j', data);

      return {
        data,
        created: false
      };
    } catch (err) {
      logger.error('check error: %j', err);

      data = await ehrRestService.postEhr(sessionId, patientId);
      logger.debug('post ehr data: %j', data);

      return {
        data,
        created: true
      };
    }
  }

  /**
   * Gets EHR Id
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @return {string}
   */
  async getEhrId(host, patientId) {
    logger.info('services/patientService|getEhrId', { host, patientId });

    const nhsNumberDb = this.ctx.db.nhsNumberDb;

    const ehrId = nhsNumberDb.getEhrId(host, patientId);
    if (ehrId) {
      return ehrId;
    }

    const ehrRestService = this.ctx.rest[host];
    const { sessionId } = await this.ehrSessionService.start(host);
    const data = await ehrRestService.getEhr(sessionId, patientId);

    if (!data || !data.ehrId) {
      throw new EhrIdNotFoundError();
    }

    nhsNumberDb.insert(host, patientId, data.ehrId);

    return data.ehrId;
  }
}

module.exports = PatientService;
