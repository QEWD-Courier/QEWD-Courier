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

const { logger } = require('../core');
const debug = require('debug')('helm:openehr:services:status');

class StatusService {
  constructor(ctx) {
    this.ctx = ctx;
    this.statusCache = ctx.cache.statusCache;
  }

  static create(ctx) {
    return new StatusService(ctx);
  }

  /**
   * Checks record status and increment request number if exists
   *
   * @return {Promise.<Object|null?}
   */
  async check() {
    logger.info('services/statusService|check');

    const state = this.statusCache.get();
    debug('state: %j', state);

    if (!state) return null;

    state.requestNo = state.requestNo + 1;
    this.statusCache.set(state);

    return state;
  }

  /**
   * Gets status record
   *
   * @return {Promise.<Object>}
   */
  async get() {
    logger.info('services/statusService|get');

    return this.statusCache.get();
  }

  /**
   * Creates a new status record
   *
   * @param  {Object} state
   * @return {Promise}
   */
  async create(state) {
    logger.info('services/statusService|create', { state });

    await this.statusCache.set(state);
  }

  /**
   * Updates existing status record
   *
   * @param  {Object} state
   * @return {Promise}
   */
  async update(state) {
    logger.info('services/statusService|update', { state });

    await this.statusCache.set(state);
  }
}

module.exports = StatusService;
