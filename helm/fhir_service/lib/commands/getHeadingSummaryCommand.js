/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

  13 February 2018

*/

'use strict';

const { BadRequestError } = require('../errors');
const { logger } = require('../core');
const { isHeadingValid, isPatientIdValid } = require('../shared/validation');
const { Role } = require('../shared/enums');
const BaseCommand = require('./baseCommand');
const debug = require('debug')('ripple-cdr-discovery:commands:get-heading-detail');

class GetHeadingSummaryCommand extends BaseCommand {
  constructor(ctx, session) {
    super();

    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} heading
   * @return {Promise.<Object[]>}
   */
  async execute(patientId, heading) {
    logger.info('commands/getHeadingSummary|execute', { patientId, heading });

    debug('role: %s', this.session.role);

    // override patientId for PHR Users - only allowed to see their own data
    if (this.session.role === Role.PHR_USER) {
      patientId = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    // patientId = mapToDiscoveryNHSNo.call(this, patientId); // @TODO think about this method

    const headingValid = isHeadingValid(this.ctx.headingsConfig, heading);
    if (!headingValid.ok) {
      return this.respond([]);
    }

    const { resourceService, headingService } = this.ctx.services;
    const resourceName = this.ctx.headingsConfig[heading];

    await resourceService.fetchPatients(patientId);
    await resourceService.fetchPatientResources(patientId, resourceName);
    const resultObj = headingService.getSummary(patientId, heading);

    debug('result: %j', resultObj);

    return this.respond(resultObj);
  }
}

module.exports = GetHeadingSummaryCommand;
