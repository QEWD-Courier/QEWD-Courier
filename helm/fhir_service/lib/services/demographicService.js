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

  15 February 2019

*/

'use strict';

const { logger } = require('../core');
const { ResourceName } = require('../shared/enums');
const { getOrganisationRef, parseName, parseAddress } = require('../shared/utils');
const debug = require('debug')('ripple-cdr-discovery:services:demographic');

class DemographicService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new DemographicService(ctx);
  }

  /**
   * Gets demographic data by NHS number
   *
   * @param  {int|string} nhsNumber
   * @return {Object}
   */
  getByPatientId(nhsNumber) {
    logger.info('services/demographicService|getByPatientId', { nhsNumber });

    const { patientCache, resourceCache, demographicCache, discoveryCache } = this.ctx.cache;
    const { resourceService } = this.ctx.services;

    const patientUuid = patientCache.byNhsNumber.getPatientUuid(nhsNumber);
    const patient = patientCache.byPatientUuid.get(patientUuid);
    const practitionerUuid = patientCache.byPatientUuid.getPractitionerUuid(patientUuid);
    const practitioner = resourceCache.byUuid.get(ResourceName.PRACTITIONER, practitionerUuid);

    const organisationRef = getOrganisationRef(practitioner);
    const location = resourceService.getOrganisationLocation(organisationRef);
    if (location && location.address && location.address.text) {
      practitioner.address = location.address.text;
    }

    const demographics = {};

    demographics.id = nhsNumber;
    demographics.nhsNumber = nhsNumber;
    demographics.gender = Array.isArray(patient.gender)
      ? patient.gender[0].toUpperCase() + patient.gender.slice(1)
      : patient.gender;
    demographics.phone = patient.telecom && Array.isArray(patient.telecom)
      ? patient.telecom[0].value
      : patient.telecom;
    demographics.name = parseName(patient.name[0]);
    demographics.dateOfBirth = new Date(patient.birthDate).getTime();
    demographics.gpName = parseName(practitioner.name);
    //@TODO should address be parsed too?
    demographics.gpAddress = practitioner.address || 'Not known';
    demographics.address = parseAddress(patient.address);

    debug('demographics: %j', demographics);

    const resultObj = {
      demographics
    };

    //@TODO Talk regarding this functionality
    discoveryCache.deleteAll();
    demographicCache.byNhsNumber.set(nhsNumber, resultObj);

    return resultObj;
  }
}

module.exports = DemographicService;
