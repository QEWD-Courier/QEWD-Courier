/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
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

  7 February 2019

*/

'use strict';

const router = require('qewd-router');
const { ExecutionContext, logger } = require('./core');
const DiscoveryDispatcher = require('./dispatchers/discovery');
const routes = require('./routes');
const { ExtraHeading, Heading, RecordStatus, Role } = require('./shared/enums');

module.exports = {
  init() {
    logger.info('init');
    router.addMicroServiceHandler(routes, module.exports);
  },

  beforeMicroServiceHandler(req, finished) {
    logger.info('beforeMicroServiceHandler');

    if (req.path.startsWith('/api/hscn/')) {
      req.ctx = new ExecutionContext(this);

      return true;
    }

    const authorized = this.jwt.handlers.validateRestRequest.call(this, req, finished);
    if (authorized) {
      const role = req.session.role;
      logger.debug(`role: ${role}`);

      if (req.path.startsWith('/api/my/') && role !== Role.PHR_USER) {
        logger.debug('attempt to use an /api/my/ path by a non-PHR user.');

        finished({
          error: 'Unauthorised request'
        });

        return false;
      }

      req.ctx = ExecutionContext.fromRequest(this, req);
    }

    return authorized;
  },

  workerResponseHandlers: {
    restRequest(message, send) { // eslint-disable-line no-unused-vars
      logger.info('workerResponseHandlers/restRequest');

      logger.debug('path:', { path: message.path });
      if (message.path === '/api/openehr/check') {
        /*
          So at this point, during the /api/initialise process before login,
          we know the NHS Number exists on OpenEHR

          We'll now retrieve the latest Discovery data for the headings
          we're interested in, and write any new records into EtherCIS

          This is managed by a QEWD-stored mapping document which maps
          Discovery Uids to EtherCIS Uids.  If a mapping doesn't exist,
          then the Discovery record is POSTed to EtherCIS

          Note that the looping through the headings is serialised to
          prevent flooding EtherCIS with simultaneous requests
        */

        /*
          {
            "status": "loading_data" | "ready",
            "new_patient": true | false,
            "nhsNumber": {patientId},
            "path": "/api/openehr/check",
            "ewd_application": "ripple-cdr-openehr",
            "token": {jwt}
          }
        */
        logger.debug('message:', { message });

        // Discovery data has been synced?
        if (message.status === RecordStatus.READY) return;

        // Discovery data syncing already started by request 1
        if (message.responseNo > 1) return;

        logger.debug('synopsis headings:', { headings: this.userDefined.synopsis.headings });

        // add a special extra one to signal the end of processing
        // so the worker can switch the session record status to 'ready'
        const headings = this.userDefined.synopsis.headings
          .filter(x => x !== Heading.TOP_3_THINGS)
          .concat(ExtraHeading.FINISHED);

        const discoveryDispatcher = new DiscoveryDispatcher(this);
        discoveryDispatcher.syncAll(message.nhsNumber, headings, message.token);
      }
    }
  }
};
