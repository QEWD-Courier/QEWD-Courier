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

const { logger } = require('../core');

class CacheService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new CacheService(ctx);
  }

  /**
   * Gets cached demographics
   *
   * @param  {int|string} nhsNumber
   * @return {Object}
   */
  getDemographics(nhsNumber) {
    logger.info('services/cacheService|getDemographics', { nhsNumber });

    try {
      const { demographicCache } = this.ctx.cache;
      const cachedObj = demographicCache.byNhsNumber.get(nhsNumber);

      return cachedObj;
    } catch(err) {
      logger.error('services/cacheService|getDemographics|err: ' + err.message);
      logger.error('services/cacheService|getDemographics|stack: ' + err.stack);

      return null;
    }
  }
}

module.exports = CacheService;
