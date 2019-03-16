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

const config = require('../config');
const { logger } = require('../core');
const { EhrSessionError } = require('../errors');
const debug = require('debug')('helm:openehr:services:ehr-session');

class EhrSessionService {
  constructor(ctx) {
    this.ctx = ctx;
    this.sessionCache = this.ctx.cache.sessionCache;
  }

  static create(ctx) {
    return new EhrSessionService(ctx);
  }

  /**
   * Starts a new session
   *
   * @param  {string} host
   * @return {Promise.<Object>}
   */
  async start(host) {
    logger.info('services/ehrSessionService|start', { host });

    const now = new Date().getTime();

    // when starting a session, try to use a cached one instead if possible
    const cachedSession = this.sessionCache.get(host);
    if (cachedSession) {
      if ((now - cachedSession.creationTime) < config.openehr.sessionTimeout) {
        // should be OK to use cached session
        debug('%s using cached session for %s', process.pid, host);

        return {
          sessionId: cachedSession.id
        };
      }

      debug('deleting expired cached session for %s', host);
      await this.stop(host, cachedSession.id);

      this.sessionCache.delete(host);
    }

    const ehrRestService = this.ctx.rest[host];
    const data = await ehrRestService.startSession();
    if (!data || !data.sessionId) {
      logger.error(`start session response was unexpected: ${JSON.stringify(data)}`);
      throw new EhrSessionError(`Unable to establish a session with ${host}`);
    }

    const session = {
      creationTime: now,
      id: data.sessionId
    };
    this.sessionCache.set(host, session);
    debug('session %s for %s host has been cached', host, data.sessionId);

    return {
      sessionId: data.sessionId
    };
  }

  /**
   * Stops the session
   *
   * @param  {string} host
   * @param  {string} sessionId
   * @return {Promise.<bool>}
   */
  async stop(host, sessionId) {
    logger.info('services/ehrSessionService|stop', { host, sessionId });

    const now = new Date().getTime();
    const cachedSession = this.sessionCache.get(host);

    // only stop sessions that are over `sessionTimeout` old
    if (cachedSession) {
      if ((now - cachedSession.creationTime) < config.openehr.sessionTimeout) {
        // don't stop this session or remove it from cache
        debug('%s cached session for %s not shut down', host);

        return false;
      }

      // remove cached session id and continue to send request to shut it down on OpenEHR system
      debug('shutting down session for %s', host);
      this.sessionCache.delete(host);
    }

    const ehrRestService = this.ctx.rest[host];
    await ehrRestService.stopSession(sessionId);

    return true;
  }
}

module.exports = EhrSessionService;
