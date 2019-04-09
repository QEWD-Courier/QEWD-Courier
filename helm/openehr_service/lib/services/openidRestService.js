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

  10 April 2019

*/

'use strict';

const request = require('request');
const logger = require('../core/logger');
const debug = require('debug')('helm:openehr:services:openid-rest');

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) return reject(err);

      return resolve(body);
    });
  });
}

class OpenidRestService {
  constructor(ctx, hostConfig) {
    this.ctx = ctx;
    this.hostConfig = hostConfig;
  }

  static create(ctx) {
    return new OpenidRestService(ctx, ctx.oidcServerConfig);
  }

  /**
   * Sends a request to get token introspection
   *
   * @param  {string} token
   * @param  {string} credentials
   * @return {Promise.<Object>}
   */
  async getTokenIntrospection(token, credentials) {
    logger.info('services/openidRestService|getTokenIntrospection', { token, credentials });

    const options = {
      url: `${this.hostConfig.url}${this.hostConfig.pathPrefix}/token/introspection`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`
      },
      form: {
        token: token
      },
      strictSSL: this.hostConfig.strictSSL
    };

    const results = await requestAsync(options);
    debug('results: %s', results);

    let parsed;
    try {
      parsed = JSON.parse(results);
    } catch (err) {
      parsed = {};
    }

    return parsed;
  }
}

module.exports = OpenidRestService;
