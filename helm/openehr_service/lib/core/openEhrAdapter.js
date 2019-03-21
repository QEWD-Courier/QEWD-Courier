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

const request = require('request');
const ExecutionContext = require('./context');
const logger = require('./logger');

/**
 * Adapter to OpenEhr that is used in jumper
 */
class OpenEhrAdapter {
  constructor(ctx) {
    this.ctx = ctx;
  }

  request(params, userObj) {
    const servers = this.ctx.serversConfig;

    /* eslint-disable */
    const host = params.host;
    const url = servers[host].url + params.url;
    const options = {
      url: url,
      method: params.method || 'GET',
      json: true
    };

    if (params.session) {
      options.headers = {
        'Ehr-Session': params.session
      };
    }

    if (params.queryString) options.qs = params.queryString;

    if (params.options) {
      for (let param in params.options) {
        options[param] = params.options[param];
      }
    }

    if (params.headers) {
      if (!options.headers) options.headers = {};
      for (let name in params.headers) {
        options.headers[name] = params.headers[name];
      }
    }

    console.log('%s: request to %s: %j', process.pid, host, options)
    request(options, (error, response, body) => {
      if (error) {
        console.log('%s: error returned from %s: %j', process.pid, host, error);
      } else {
        if (params.logResponse === false) {
          console.log('%s: response received from %s', process.pid, host);
        } else {
          console.log('%s: response received from %s: %j', process.pid, host, body);
        }

        if (body && typeof body === 'string') {
          console.log('body returned from %s is a string:\n%s\n', host, body);
        }

        if (params.processBody) params.processBody(body, userObj);
      }

      if (params.callback) {
        console.log('%s: invoking callback', process.pid);
        params.callback(userObj);
      }
    });

    /*eslint-enable */
  }

  startSession(host, qewdSession, callback) {
    const ctx = qewdSession
      ? ExecutionContext.fromQewdSession(this.ctx.worker, qewdSession)
      : this.ctx;
    const { ehrSessionService } = ctx.services;

    ehrSessionService.start(host)
      .then(ehrSession => callback({ id: ehrSession.sessionId }))
      .catch((err) => {
        logger.error('jumper/adapter/startSession|err:', err);
        callback();
      });
  }

  stopSession(host, sessionId, qewdSession, callback) {
    const ctx = qewdSession
      ? ExecutionContext.fromQewdSession(this.ctx.worker, qewdSession)
      : this.ctx;
    const { ehrSessionService } = ctx.services;

    ehrSessionService.stop(host, sessionId)
      .then(() => callback())
      .catch((err) => {
        logger.error('jumper/adapter/stopSession|err:', err);
        callback();
      });
  }
}

module.exports = OpenEhrAdapter;
