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

  7 February 2019

*/

'use strict';

// NOTE: ak 07/02/2019 not the best idea but should work
const globalConfig = process.env.NODE_ENV === 'test'
  ? require('../../spec/support/configuration.json')
  : require('/opt/qewd/mapped/settings/configuration.json');
const oidc = globalConfig.phr.microservices.openid_connect;

function normalizeHost(host, port) {
  if (port === 80 || port === 443) {
    return host;
  }

  return `${host}:${port}`;
}

module.exports = {

  logging: {

    /**
     * Default log level
     * @type {string}
     */
    defaultLevel: 'debug'
  },

  oidc: {
    url: normalizeHost(oidc.host, oidc.port),
    path: oidc.path_prefix,
    strictSSL: false
  },

  openehr: {

    /**
     * OpenEHR Session timeout is 2 minutes in ms
     * @type {int}
     */
    sessionTimeout: 120 * 1000,

    /**
     * Max number of OpenEHR Sessions
     * @type {int}
     */
    sessionMaxNumber: 75
  },

  /**
   * Timezone
   * @type {string}
   */
  timezone: 'Europe/London'

};
