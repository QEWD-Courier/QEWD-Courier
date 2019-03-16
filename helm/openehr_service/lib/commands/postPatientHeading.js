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
const { PostHeadingFormat, Role } = require('../shared/enums');
const debug = require('debug')('helm:openehr:commands:post-patient-heading');

class PostPatientHeadingCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} heading
   * @param  {Object} query
   * @param  {Object} payload
   * @return {Object}
   */
  async execute(patientId, heading, query, payload) {
    debug('patientId: %s, heading: %s, query: %j, payload: %j', patientId, heading, query, payload);
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
      throw new BadRequestError(`No body content was posted for heading ${heading}`);
    }

    const host = this.ctx.defaultHost;
    const data = {
      data: payload,
      format: query.format === PostHeadingFormat.JUMPER
        ? PostHeadingFormat.JUMPER
        : PostHeadingFormat.PULSETILE
    };

    const { headingService, cacheService } = this.ctx.services;

    const responseObj = await headingService.post(host, patientId, heading, data);
    debug('response: %j', responseObj);

    await cacheService.delete(host, patientId, heading);

    return responseObj;
  }
}

module.exports = PostPatientHeadingCommand;
