/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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

  25 January 2019

*/

'use strict';

const { BadRequestError } = require('../../errors');
const debug = require('debug')('ripple-cdr-openehr:commands:feeds:get-detail');

class GetFeedDetailCommand {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * @param  {string} sourceId
   * @return {Promise.<Object>}
   */
  async execute(sourceId) {
    debug('sourceId: %s', sourceId);

    if (!sourceId || sourceId === '') {
      throw new BadRequestError('Missing or empty sourceId');
    }

    const { phrFeedService } = this.ctx.services;
    const responseObj = await phrFeedService.getBySourceId(sourceId);

    return {
      feed: responseObj
    };
  }
}

module.exports = GetFeedDetailCommand;
