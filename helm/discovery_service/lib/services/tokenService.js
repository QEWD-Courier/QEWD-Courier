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

  11 February 2019

*/

'use strict';

const { logger } = require('../core');
const config = require('../config');
const debug = require('debug')('ripple-cdr-discovery:services:token');

class TokenService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new TokenService(ctx);
  }

  /**
   * Gets a token
   *
   * @returns {Promise.<string>}
   */
  async get() {
    logger.info('cache/tokenService|get');

    const { tokenCache } = this.ctx.cache;
    const now = Date.now();

    const token = tokenCache.get();
    if (token && token.jwt) {
      if ((now - token.createdAt) < config.auth.tokenTimeout) {
        return token.jwt;
      }
    }

    const { authRestService } = this.ctx.services;

    try {
      const data = await authRestService.authenticate();
      debug('data: %j', data);

      tokenCache.set({
        jwt: data.access_token,
        createdAt: now
      });

      return data.access_token;
    } catch (err) {
      logger.error('authenticate/get|err: ' + err.message);
      logger.error('authenticate/get|stack: ' + err.stack);

      tokenCache.delete();
      throw err;
    }
  }
}

module.exports = TokenService;
