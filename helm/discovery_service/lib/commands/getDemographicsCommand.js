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
const { isPatientIdValid } = require('../shared/validation');
const { Role, ResourceName } = require('../shared/enums');
const BaseCommand = require('./baseCommand');
const debug = require('debug')('ripple-cdr-discovery:commands:get-demographics');

class GetDemographicsCommand extends BaseCommand {
  constructor(ctx, session) {
    super();

    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @return {Promise.<Object>}
   */
  async execute(patientId) {
    logger.info('commands/getDemographics|execute', { patientId });

    debug('role: %s', this.session.role);

    if (this.session.role === Role.PHR_USER) {
      patientId = this.session.nhsNumber;
    }


    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }
  
    const { cacheService } = this.ctx.services;
    const cachedObj = cacheService.getDemographics(patientId);
    debug('cached response: %j', cachedObj);
    if (cachedObj) {
      return cachedObj;
    }

    const { resourceService, demographicService } = this.ctx.services;
    await resourceService.fetchPatients(patientId);
    await resourceService.fetchPatientResources(patientId, ResourceName.PATIENT);
    const responseObj = demographicService.getByPatientId(patientId);
    debug('response: %j', responseObj);

    return responseObj;
  }
}

module.exports = GetDemographicsCommand;
