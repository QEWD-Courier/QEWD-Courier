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

module.exports = (adapter) => {
  return {

    /**
     * Gets all patients uuids by NHS number
     *
     * @param  {int|string} nhsNumber
     * @return {string[]|}
     */
    getAllPatientUuids: (nhsNumber) => {
      logger.info('mixins/bundle|byNhsNumber|getAllPatientUuids', { nhsNumber });

      const patientUuids = [];
      const key = ['Discovery', 'PatientBundle', 'by_nhsNumber', nhsNumber, 'Patient'];

      adapter.qewdSession.data.$(key).forEachChild((patientUuid) => {
        patientUuids.push(patientUuid);
      });

      return patientUuids;
    }
  };
};
