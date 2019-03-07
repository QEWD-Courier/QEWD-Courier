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

  13 February 2019

*/

'use strict';

const { GetDemographicsCommand } = require('../../lib/commands');
const { getResponseError } = require('../../lib/errors');

const request = require('request')

/**
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function getPatientDemographics (args, finished) {

  // console.log(args)
  // console.log(args.patientId)

  // request({
  //   url: `http://10.151.128.117:57772/dev/yhcrbus/Patient?identifier=NHS Number|${ args.patientId }`,
  //   method: 'GET'
  //   // ,
  //   // headers: {
  //   //   Authorization: `Bearer ${token}`
  //   // }
  // }, (err, response, body) => {

  //   finished(body)
  // });

  console.log(args)

  try {
    const command = new GetDemographicsCommand(args.req.ctx, args.session);
    const responseObj = await command.execute(args.patientId);
    
    finished(responseObj);
  } catch (err) {
    const responseError = getResponseError(err);
    
    finished(responseError);
  }
};

// 'use strict';

// const request = require('request')

// module.exports = function (args, finished) {
//     console.log('in handler get patient demographics')

//     console.log(args)

//     console.log(args.patientId)

//     finished({})
// }