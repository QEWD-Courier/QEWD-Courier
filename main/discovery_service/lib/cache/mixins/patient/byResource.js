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

  11 February 2019

*/

'use strict';

const { logger } = require('../../../core');
const { ResourceName } = require('../../../shared/enums');

module.exports = (adapter) => {
  return {

    /**
     * Checks if data exists by resource name or not
     *
     * @param  {string} patientUuid
     * @return {bool}
     */
    exists: (nhsNumber, resourceName) => {
      logger.info('mixins/patient|byResource|exists', { nhsNumber, resourceName });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'resources', resourceName];

      return adapter.exists(key);
    },

    /**
     * Sets resource uuid
     *
     * @param  {int|string} nhsNumber
     * @param  {string} patientUuid
     * @param  {string} resourceName
     * @param  {string} uuid
     * @return {void}
     */
    set: (nhsNumber, patientUuid, resourceName, uuid) => {
      logger.info('mixins/patient|byResource|setResourceUuid', { nhsNumber, patientUuid, resourceName, uuid });

      const byNhsNumberKey = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'resources', resourceName, uuid];
      adapter.put(byNhsNumberKey, uuid);

      const byUuidKey = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid, 'resources', resourceName, uuid];
      adapter.put(byUuidKey, uuid);
    },

    /**
     * Gets resource uuids by resource name
     *
     * @param  {int|string} nhsNumber
     * @param  {string} resourceName
     * @return {string[]}
     */
    getUuidsByResourceName: (nhsNumber, resourceName) => {
      logger.info('mixins/patient|byResource|getUuidsByResourceName', { nhsNumber, resourceName });

      const uuids = [];
      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'resources', resourceName];

      adapter.qewdSession.data.$(key).forEachChild((uuid) => {
        uuids.push(uuid);
      });

      return uuids;
    }
  };
};
