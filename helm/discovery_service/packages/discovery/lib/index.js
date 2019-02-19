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

  12 January 2019

*/

'use strict';

const router = require('qewd-router');
const { ExecutionContext, logger } = require('./core');
const routes = require('./routes');

module.exports = {
  init: function () {
    logger.info('init');
    router.addMicroServiceHandler(routes, module.exports);
  },

  beforeMicroServiceHandler: function (req, finished) {
    logger.info('beforeMicroServiceHandler');

    const authorised = this.jwt.handlers.validateRestRequest.call(this, req, finished);
    if (authorised) {
      req.ctx = ExecutionContext.fromRequest(this, req);
    }

    return authorised;
  }
};
