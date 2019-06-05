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

const CacheRegistry = require('./cache');
const DbRegistry = require('./db');
const ServiceRegistry = require('./services');
const RestRegistry = require('./rest');

class ExecutionContext {
  constructor(q, { req, qewdSession } = {}) {
    this.worker = q;
    this.userDefined = q.userDefined;
    this.qewdSession = qewdSession || (req ? q.qewdSessionByJWT.call(q, req) : null);

    this.cache = CacheRegistry.create(this);
    this.db = DbRegistry.create(this);
    this.services = ServiceRegistry.create(this);
    this.rest = RestRegistry.create(this);
  }

  static fromRequest(q, req) {
    return new ExecutionContext(q, { req });
  }

  static fromQewdSession(q, qewdSession) {
    return new ExecutionContext(q, { qewdSession });
  }

  get defaultHost() {
    return this.userDefined.globalConfig.openehr.defaultPostHost || 'ethercis';
  }

  get headingsConfig() {
    return this.userDefined.globalConfig.openehr.headings;
  }

  get synopsisConfig() {
    return this.userDefined.globalConfig.openehr.synopsis;
  }

  get serversConfig() {
    return this.userDefined.globalConfig.openehr.servers;
  }

  get sitesConfig() {
    return this.userDefined.globalConfig.openehr.sites;
  }

  get oidcServerConfig() {
    return {
      host: this.userDefined.globalConfig.oidc_client.hosts.oidc_server,
      urls: this.userDefined.globalConfig.oidc_client.urls.oidc_server,
      strictSSL: false
    };
  }

  get activeSessions() {
    return this.worker.sessions.active();
  }

  getHeadingConfig(heading) {
    return this.userDefined.globalConfig.openehr.headings[heading];
  }
}

module.exports = ExecutionContext;
