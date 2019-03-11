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

  12 January 2018

*/

'use strict';

const CacheRegistry = require('./cache');
const ServiceRegistry = require('./services');

class ExecutionContext {
  constructor(q, { req, qewdSession }) {
    this.worker = q;
    this.userDefined = q.userDefined;

    this.qewdSession = qewdSession || q.qewdSessionByJWT.call(q, req);

    this.cache = CacheRegistry.create(this);
    this.services = ServiceRegistry.create(this);
  }

  static fromRequest(q, req) {
    return new ExecutionContext(q, { req });
  }

  static fromQewdSession(q, qewdSession) {
    return new ExecutionContext(q, { qewdSession });
  }

  get headingsConfig() {
    return this.userDefined.globalConfig.DDS.headings;
  }

  get serversConfig() {
    return this.userDefined.globalConfig.DDS;
  }

  get transformationConfig() {
    return this.userDefined.globalConfig.DDS.transformations;
  }

  getTransformationConfig(format) {
    return this.transformationConfig[format] || this.transformationConfig.defaults;
  }
}

module.exports = ExecutionContext;
