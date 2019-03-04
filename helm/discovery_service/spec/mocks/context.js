/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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

const { ExecutionContext, QewdCacheAdapter } = require('../../lib/core');
const WorkerMock = require('./worker');
const CacheRegistryMock = require('./cache');
const DbRegistryMock = require('./db');
const ServiceRegistryMock = require('./services');

class ExecutionContextMock extends ExecutionContext {
  constructor(q) {
    q = q || new WorkerMock();
    const qewdSession = q.sessions.create('mock');

    super(q, { qewdSession });

    this.adapter = new QewdCacheAdapter(qewdSession);
    this.cache = CacheRegistryMock.create();
    this.db = DbRegistryMock.create();
    this.services = ServiceRegistryMock.create();
  }

  freeze() {
    this.cache.freeze();
    this.db.freeze();
    this.services.freeze();
  }
}

module.exports = ExecutionContextMock;
