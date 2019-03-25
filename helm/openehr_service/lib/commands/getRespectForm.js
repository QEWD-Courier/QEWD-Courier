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

  25 March 2019

*/

'use strict';

const { BadRequestError } = require('../errors');
const debug = require('debug')('helm:openehr:commands:get-respect-form');

class GetRespectFormCommand {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * @param  {string} patientId
   * @param  {string} sourceId
   * @param  {string} version
   * @return {Promise.<Object>}
   */
  async execute(patientId, sourceId, version) {
    debug('patientId: %s, sourceId = %s, version = %s', patientId, sourceId, version);

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
    const resultObj = respectFormVersionService.get(patientId, sourceId, version);
    debug('resultObj = %j', resultObj);

    return {
      respect_form: resultObj
    };
  }
}

module.exports = GetRespectFormCommand;
