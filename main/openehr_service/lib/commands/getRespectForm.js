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

  17 April 2019

*/

'use strict';

const { logger } = require('../core');
const { BadRequestError } = require('../errors');
const { Role } = require('../shared/enums');
const { isPatientIdValid, isSourceIdValid } = require('../shared/validation');

class GetRespectFormCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} sourceId
   * @param  {string} version
   * @return {Promise.<Object>}
   */
  async execute(patientId, sourceId, version) {
    logger.info('commands/getRespectForm', { patientId, sourceId, version });

    if (this.session.role === Role.PHR_USER) {
      logger.debug('override patientId for PHR Users - only allowed to see their own data');
      patientId = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    const sourceIdValid = isSourceIdValid(sourceId);
    if (!sourceIdValid.ok) {
      return {};
    }

    if (!version) {
      throw new BadRequestError('version was not defined');
    }

    const { respectFormsService } = this.ctx.services;

    const result = await respectFormsService.fetchOne(patientId);
    logger.debug('result:', { result });

    if (!result.ok) {
      logger.debug('No results could be returned from the OpenEHR servers for respectforms heading');
      return {};
    }

    const resultObj = await respectFormsService.getBySourceId(sourceId, version);
    logger.debug('resultObj:', { resultObj });

    return {
      respect_form: resultObj
    };
  }
}

module.exports = GetRespectFormCommand;
