/*

 ----------------------------------------------------------------------------
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

  1 March 2019

*/

'use strict';

const { PutFeedCommand } = require('../../lib/commands');
const { getResponseError } = require('../../lib/errors');

/**
 * PUT /api/feeds/:sourceId
 *
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function putFeed(args, finished) {
  try {
    const command = new PutFeedCommand(args.req.ctx, args.session);
    const responseObj = await command.execute(args.sourceId, args.req.body);

    finished(responseObj);
  } catch (err) {
    const responseError = getResponseError(err);

    finished(responseError);
  }
};