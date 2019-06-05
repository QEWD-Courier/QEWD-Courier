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

  11 May 2019

*/

'use strict';

const { logger } = require('../core');

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
   * @param  {int|string} patientId
   * @return {Object|null}
   */
  check(patientId) {
    logger.info('services/statusService|check', {patientId});

    const state = this.statusCache.get(patientId);
    logger.debug('patientId: %s, state: %j', patientId, state);

    if (!state) return null;

    state.requestNo = state.requestNo + 1;
    this.statusCache.set(patientId, state);

    return state;
  }

  /**
   * Gets status record
   * @param  {int|string} patientId
   * @return {Object}
   */
  get(patientId) {
    logger.info('services/statusService|get', {patientId});

    return this.statusCache.get(patientId);
  }

  /**
   * Creates a new status record
   *
   * @param  {int|string} patientId
   * @param  {Object} state
   * @return {void}
   */
  create(patientId, state) {
    logger.info('services/statusService|create', {patientId, state});

    this.statusCache.set(patientId, state);
  }

  /**
   * Updates existing status record
   *
   * @param  {int|string} patientId
   * @param  {Object} state
   * @return {void}
   */
  update(patientId, state) {
    logger.info('services/statusService|update', {patientId, state});

    this.statusCache.set(patientId, state);
  }
}

module.exports = StatusService;
