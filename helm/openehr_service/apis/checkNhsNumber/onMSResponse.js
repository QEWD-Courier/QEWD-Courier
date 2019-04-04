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

  27 March 2019

*/

'use strict';

const { logger } = require('../../lib/core');
const DiscoveryDispatcher = require('../../lib/dispatchers/discovery');
const { ExtraHeading, Heading, RecordStatus } = require('../../lib/shared/enums');

/**
 * @param  {Object} message
 * @param  {string} jwt
 * @param  {Function} forward
 * @param  {Function} sendBack
 * @return {bool}
 */
module.exports = function (message, jwt, forward, sendBack) { // eslint-disable-line no-unused-vars
  const globalConfig = this.userDefined.globalConfig;

  // is DDS configured for use?
  if (!globalConfig.DDS || !globalConfig.DDS.enabled) {
    return false;
  }

  /*

    Handling the response from /api/openehr/check  (ie response from index.js in this folder)

    So at this point, during the /api/initialise process before login,
    we know the NHS Number exists on OpenEHR

    We'll now retrieve the latest Discovery data for the headings
    we're interested in, and write any new records into EtherCIS

    This is managed by a QEWD-stored mapping document which maps
    Discovery Uids to EtherCIS Uids.  If a mapping doesn't exist,
    then the Discovery record is POSTed to EtherCIS

    Note that the looping through the headings is serialised to
    prevent flooding EtherCIS with simultaneous requests


    The next step in processing the response from this event hook
    is in the "onOrchResponse.js" handler for the "initialise" handler
    in the "auth_service" MicroService - see the callback function
    for the "forwardToMS()" function which forwarded the /api/openehr/check
    request to the OpenEHR MicroService

  */

  logger.debug('message:', { message: JSON.stringify(message) });
  /*
    {
      "status": "loading_data" | "ready",
      "new_patient": true | false,
      "nhsNumber": {patientId},
      "path": "/api/openehr/check",
      "ewd_application": "openehr_service",
      "token": {jwt}
    }
  */

  if (message.status === RecordStatus.READY) {
    // Write-back of DDS data to EtherCIS has been completed, so return the
    // "ready" response back to PulseTile
    return false;
  }

  if (message.responseNo > 1) {
    // this will be another /api/initialise poll attempt by PulseTile
    // to determine if DDS Data write-back status, but it's still working
    // so return the "loading data" signal back to PulseTile
    return false;
  }

  const synopsisConfig = globalConfig.openehr.synopsis;
  logger.debug('synopsis headings:', { headings: synopsisConfig.headings });

  // this is the first poll request using /api/initialise by the user, so
  //  commence the DDS write-back to EtherCIS

  // add a special extra one to signal the end of processing
  // so the worker can switch the session record status to 'ready'
  const headings = [
    ...synopsisConfig.headings.filter(x => x !== Heading.TOP_3_THINGS),
    ExtraHeading.FINISHED
  ];

   /*
    we're going to let all this stuff kick off in the background
    and meanwhile we'll implicitly return the /api/openehr/check response back to the
    conductor microservice.  If new_patient is true, it will return a
    {status: 'loading_data'} response

    As explained at the start above, the next step in processing the response from this event hook
    is in the "onOrchResponse.js" handler for the "initialise" handler
    in the "auth_service" MicroService - see the callback function
    for the "forwardToMS()" function which forwarded the /api/openehr/check
    request to the OpenEHR MicroService

  */

  const discoveryDispatcher = new DiscoveryDispatcher(this);
  discoveryDispatcher.syncAll(message.nhsNumber, headings, jwt, forward);

  return false;
};
