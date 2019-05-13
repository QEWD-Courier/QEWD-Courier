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

  11 May 2019

*/

'use strict';

const { logger } = require('../core');
const { RecordStatus, ExtraHeading } = require('../shared/enums');

class MergeDiscoveryDataCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {int|string} patientId
   * @param  {string} heading
   * @param  {Object[]} data
   * @return {Promise.<Object>}
   */
  async execute(patientId, heading, data) {
    logger.info('commands/mergeDiscoveryData', { patientId, heading, data });

    const { statusService } = this.ctx.services;

    if (heading === ExtraHeading.FINISHED) {
      const state = statusService.get(patientId);
      logger.debug('record state: %j', state);

      state.status = RecordStatus.READY;
      statusService.update(patientId, state);

      return {
        refresh: true
      };
    }

    if (data.length === 0) {
      return {
        refresh: false
      };
    }

    const host = this.ctx.defaultHost;
    const { discoveryService, cacheService } = this.ctx.services;
    const result = await discoveryService.mergeAll(host, patientId, heading, data);
    if (result) {
      cacheService.delete(host, patientId, heading);
    }

    return {
      refresh: result
    };
  }
}

module.exports = MergeDiscoveryDataCommand;
