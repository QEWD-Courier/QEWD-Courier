/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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

const { BadRequestError } = require('../errors');
const { isHeadingValid, isEmpty, isPatientIdValid } = require('../shared/validation');
const { Role } = require('../shared/enums');
const debug = require('debug')('helm:openehr:commands:put-patient-heading');

class PutPatientHeadingCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} heading
   * @param  {string} sourceId
   * @param  {Object} payload
   * @return {Object}
   */
  async execute(patientId, heading, sourceId, payload) {
    debug('patientId: %s, heading: %s, sourceId: %s, payload: %j', patientId, heading, sourceId, payload);
    debug('role: %s', this.session.role);

    // override patientId for PHR Users - only allowed to see their own data
    if (this.session.role === Role.PHR_USER) {
      patientId = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    const headingValid = isHeadingValid(this.ctx.headingsConfig, heading);
    if (!headingValid.ok) {
      throw new BadRequestError(headingValid.error);
    }

    if (isEmpty(payload)) {
      throw new BadRequestError(`No body content was sent for heading ${heading}`);
    }

    const host = this.ctx.defaultHost;
    const { headingService, cacheService } = this.ctx.services;

    const responseObj = await headingService.put(host, patientId, heading, sourceId, payload);
    debug('response: %j', responseObj);

    await cacheService.delete(host, patientId, heading);

    return responseObj;
  }
}

module.exports = PutPatientHeadingCommand;
