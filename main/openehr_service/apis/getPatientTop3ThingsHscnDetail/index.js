/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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

const { ExecutionContext, logger } = require('../../lib/core');
const { GetPatientTop3ThingsHscnDetailCommand } = require('../../lib/commands');
const { getResponseError } = require('../../lib/errors');

/**
 * GET /api/hscn/:site/top3Things/:patientId
 *
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function getPatientTop3ThingsHscnDetail(args, finished) {
  try {
    const ctx = new ExecutionContext(this);
    const command = new GetPatientTop3ThingsHscnDetailCommand(ctx);
    const responseObj = await command.execute(args.site, args.patientId, args.req.headers);

    finished(responseObj);
  } catch (err) {
    logger.error('apis/getPatientTop3ThingsHscnDetail|err:', err);

    const responseError = getResponseError(err);

    finished(responseError);
  }
};
