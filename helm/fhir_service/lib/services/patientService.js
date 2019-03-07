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

  13 February 2018

*/

'use strict';

const { logger } = require('../core');

class PatientService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new PatientService(ctx);
  }

  /**
   * Gets patient bundle by NHS number
   *
   * @param  {int|string} nhsNumber
   * @return {Object}
   */
  getPatientBundle(nhsNumber) {
    logger.info('services/patientService|getPatientBundle', { nhsNumber });

    const { patientCache, patientBundleCache } = this.ctx.cache;

    const bundleCache = patientBundleCache.exists()
      ? patientBundleCache
      : patientCache;

    const patientUuids = bundleCache.byNhsNumber.getAllPatientUuids(nhsNumber);
    const patients = bundleCache.byPatientUuid.getByPatientUuids(patientUuids);
    const entry = patients.map(x => ({
      resource: x
    }));

    return {
      resourceType: 'Bundle',
      entry,
    };
  }

  /**
   * Updates patient bundle
   *
   * @return {void}
   */
  updatePatientBundle() {
    logger.info('services/patientService|updatePatientBundle');

    const { patientCache, patientBundleCache } = this.ctx.cache;
    const data = patientCache.export();

    patientBundleCache.import(data);
  }
}

module.exports = PatientService;
