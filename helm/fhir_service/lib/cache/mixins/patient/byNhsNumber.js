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

module.exports = (adapter, ) => {
  return {

    /**
     * Checks if data exists by NHS number or not
     *
     * @param  {int|string} nhsNumber
     * @return {bool}
     */
    exists: (nhsNumber) => {
      logger.info('mixins/patient/byNhsNumber|exists', { nhsNumber });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber];

      return adapter.exists(key);
    },

    /**
     * Gets patient uuid by NHS number
     *
     * @param  {int|string} nhsNumber
     * @return {string}
     */
    getPatientUuid: (nhsNumber) => {
      logger.info('mixins/patient/byNhsNumber|getPatientUuid', { nhsNumber });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'Patient'];

      return adapter.qewdSession.data.$(key).firstChild.value;
    },

    /**
     * Gets all patient uuids by NHS number
     *
     * @param  {int|string} nhsNumber
     * @return {string[]}
     */
    getAllPatientUuids: (nhsNumber) => {
      logger.info('mixins/patient|byNhsNumber|getAllPatientUuids', { nhsNumber });

      const patientUuids = [];
      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'Patient'];

      adapter.qewdSession.data.$(key).forEachChild((patientUuid) => {
        patientUuids.push(patientUuid);
      });

      return patientUuids;
    },

    /**
     * Sets patient uuid
     *
     * @param  {int|string} nhsNumber
     * @param  {string} patientUuid
     * @return {void}
     */
    setPatientUuid: (nhsNumber, patientUuid) => {
      logger.info('mixins/patient|byNhsNumber|setPatientUuid', { nhsNumber, patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'Patient', patientUuid];
      adapter.put(key, patientUuid);
    },

    /**
     * Sets resource uuid
     *
     * @param  {int|string} nhsNumber
     * @param  {string} resourceName
     * @param  {string} uuid
     * @return {void}
     */
    setResourceUuid: (nhsNumber, resourceName, uuid) => {
      logger.info('mixins/patient|byResource|setResourceUuid', { nhsNumber, resourceName, uuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'resources', resourceName, uuid];
      adapter.put(key, uuid);
    }
  };
};
