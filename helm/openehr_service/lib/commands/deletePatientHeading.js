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

const { BadRequestError, ForbiddenError } = require('../errors');
const { Heading, UserMode } = require('../shared/enums');
const { isHeadingValid, isPatientIdValid } = require('../shared/validation');
const debug = require('debug')('helm:openehr:commands:delete-patient-heading');

class DeletePatientHeadingCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  get blacklistHeadings() {
    return [
      Heading.FEEDS,
      Heading.TOP_3_THINGS
    ];
  }

  /**
   * @param  {string} patientId
   * @param  {string} heading
   * @param  {string} sourceId
   * @return {Object}
   */
  async execute(patientId, heading, sourceId) {
    debug('patientId: %s, heading: %s, sourceId: %s', patientId, heading, sourceId);
    debug('user mode: %s', this.session.userMode);

    if (this.session.userMode !== UserMode.ADMIN) {
      throw new ForbiddenError('Invalid request');
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    if (heading && this.blacklistHeadings.includes(heading)) {
      throw new BadRequestError(`Cannot delete ${heading} records`);
    }

    const headingValid = isHeadingValid(this.ctx.headingsConfig, heading);
    if (!headingValid.ok) {
      throw new BadRequestError(headingValid.error);
    }

    const { headingService, discoveryService } = this.ctx.services;
    await headingService.fetchOne(patientId, heading);

    const responseObj = await headingService.delete(patientId, heading, sourceId);
    await discoveryService.delete(sourceId);

    return responseObj;
  }
}

module.exports = DeletePatientHeadingCommand;
