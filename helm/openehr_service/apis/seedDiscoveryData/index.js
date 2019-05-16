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

  11 May 2019

*/

'use strict';

const P = require('bluebird');
const { logger } = require('../../lib/core');
const { SeedDiscoveryDataCommand } = require('../../lib/commands');
const { getResponseError } = require('../../lib/errors');

/**
 * GET /api/seedData
 *
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function seedDiscoveryData(args, finished) {
  try {
    
    const nhsNumbers = JSON.parse(args.req.query.nhsNumbers);
    const command = new SeedDiscoveryDataCommand(args.req.ctx, args.session);
    const results =  await command.execute(nhsNumbers);
  
    finished(results);
  } catch (err) {
    logger.error('/apis/seedData|err:', err);

    const responseError = getResponseError(err);

    finished(responseError);
  }
};
