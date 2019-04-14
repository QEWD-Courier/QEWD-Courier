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

  15 April 2019

*/

'use strict';

const { logger } = require('../core');
const { BadRequestError } = require('../errors');
const { Role, Heading } = require('../shared/enums');
const { isEmpty, isPatientIdValid, isSourceIdValid } = require('../shared/validation');

class PostRespectFormVersionCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} sourceId
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async execute(patientId, sourceId, payload) {
    logger.info('commands/postRespectForm', { patientId, sourceId, payload });

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

    if (isEmpty(payload)) {
      throw new BadRequestError('No body content was posted for heading respectforms');
    }

    const { headingService, cacheService } = this.ctx.services;

    const host = this.ctx.defaultHost;
    const heading = Heading.RESPECT_FORMS;
    const responseObj = await headingService.post(host, patientId, heading, payload);
    logger.debug('responseObj: %j', { responseObj });

    await cacheService.delete(host, patientId, heading);

    return {
      api: 'getRespectFormVersions',
      use: 'results',
      results: responseObj
    };
  }
}

module.exports = PostRespectFormVersionCommand;
