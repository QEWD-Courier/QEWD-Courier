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

const { ExecutionContext, OpenEhrAdapter } = require('../../lib/core');

const adapter = new OpenEhrAdapter();

module.exports = {
  init: function () {
    adapter.ctx = new ExecutionContext(this);

    return adapter;
  },

  request: function (params, userObj) {
    adapter.request(params, userObj);
  },

  startSession: function (host, qewdSession, callback) {
    adapter.startSession(host, qewdSession, callback);
  },

  stopSession: function (host, sessionId, qewdSession, callback = () => null) {
    adapter.stopSession(host, sessionId, qewdSession, callback);
  }
};
