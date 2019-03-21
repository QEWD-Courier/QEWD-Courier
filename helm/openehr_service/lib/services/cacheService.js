/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
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

const { ExecutionContext, logger } = require('../core');

class CacheService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new CacheService(ctx);
  }

  /**
   * Deletes heading cache by host in all active sessions
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @return {Promise}
   */
  async delete(host, patientId, heading) {
    logger.info('cache/cacheService|delete', { host, patientId, heading });

    const sessions = this.ctx.activeSessions;

    sessions.forEach((session) => {
      const ctx = ExecutionContext.fromQewdSession(this.ctx.worker, session);
      const { headingCache } = ctx.cache;

      headingCache.deleteAll(host, patientId, heading);
      headingCache.byHeading.deleteAll(heading);
    });
  }
}

module.exports = CacheService;
