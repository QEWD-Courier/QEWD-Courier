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

const P = require('bluebird');
const debug = require('debug')('helm:openehr:commands:revert-all-discovery-data');

class RevertAllDiscoveryDataCommand {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * @return {Promise.<Object[]>}
   */
  async execute() {
    const { discoveryService, headingService } = this.ctx.services;
    const sourceIds = await discoveryService.getAllSourceIds();

    const results = await P.mapSeries(sourceIds, async (sourceId) => {
      debug('sourceId: %s', sourceId);
      const data = await discoveryService.getBySourceId(sourceId);
      const responseObj = await headingService.delete(data.patientId, data.heading, sourceId);
      debug('response: %j', responseObj);
      await discoveryService.delete(data.discovery);

      return responseObj;
    });

    return results;
  }
}

module.exports = RevertAllDiscoveryDataCommand;
