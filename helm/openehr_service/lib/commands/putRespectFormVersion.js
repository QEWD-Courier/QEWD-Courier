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

  27 March 2019

*/

'use strict';

const { BadRequestError } = require('../errors');
const debug = require('debug')('helm:openehr:commands:put-respect-form-version');

class PutRespectFormVersionCommand {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * @param  {string} patientId
   * @param  {string} sourceId
   * @param  {string} version
   * @param  {data} data
   * @return {Promise.<Object>}
   */
  async execute(patientId, sourceId, version, data) {
    debug('patientId: %s, sourceId = %s, version = %s, data = %j', patientId, sourceId, version, data);

    if (!patientId) {
      throw new BadRequestError('patientId was not defined');
    }

    if (!sourceId) {
      throw new BadRequestError('sourceId was not defined');
    }

    if (!version) {
      throw new BadRequestError('version was not defined');
    }

    const { respectFormVersionService } = this.ctx.services;

    const valid = respectFormVersionService.validateUpdate(patientId, sourceId, version);
    if (!valid.ok) {
      throw new BadRequestError(valid.error);
    }

    respectFormVersionService.update(patientId, sourceId, version, data);

    const resultObj = respectFormVersionService.getByPatientId(patientId);
    debug('resultObj = %j', resultObj);

    return {
      api: 'getRespectFormVersions',
      use: 'results',
      results: resultObj
    };
  }
}

module.exports = PutRespectFormVersionCommand;
