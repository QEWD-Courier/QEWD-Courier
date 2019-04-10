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

  9 April 2019

*/

'use strict';

const { BadRequestError } = require('../errors');
const { isFeedPayloadValid } = require('../shared/validation');
const { logger } = require('../core');

class PutFeedCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} sourceId
   * @param  {Object} payload
   * @return {Promise.<Object>}
   */
  async execute(sourceId, payload) {
    logger.info('commands/putFeed', { sourceId, payload });

    if (!sourceId || sourceId === '') {
      throw new BadRequestError('Missing or empty sourceId');
    }

    const { phrFeedService } = this.ctx.services;
    const nhsNumber = this.session.nhsNumber;
    const feed = phrFeedService.getBySourceId(sourceId);

    const valid = isFeedPayloadValid(payload);
    if (!valid.ok) {
      throw new BadRequestError(valid.error);
    }

    phrFeedService.update(nhsNumber, sourceId, payload);

    return {
      sourceId: feed.sourceId
    };
  }
}

module.exports = PutFeedCommand;
