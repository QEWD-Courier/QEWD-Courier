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


module.exports = {

  logging: {

    /**
     * Default log level
     * @type {string}
     */
    defaultLevel: 'debug'
  },

  openehr: {

    /**
     * OpenEHR Session timeout is 2 minutes in ms
     * @type {int}
     */
    sessionTimeout: 3600 * 1000,

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
