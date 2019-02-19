/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
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

  20 February 2019

*/

'use strict'

const { PostPatientHeadingCommand } = require('../../commands/patients');
const { getResponseError } = require('../../errors');

/**
 * POST /api/my/heading/:heading
 *
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function postMyHeading(args, finished) {
  try {
    const query = args.req.query || {};
    const payload = args.req.body;
    const command = new PostPatientHeadingCommand(args.req.ctx, args.session);
    const responseObj = await command.execute(args.session.nhsNumber, args.heading, query, payload);

    finished(responseObj);
  } catch (err) {
    const responseError = getResponseError(err);

    finished(responseError);
  }
};
