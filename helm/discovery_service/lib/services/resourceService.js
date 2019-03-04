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

const P = require('bluebird');
const { logger } = require('../core');
const { ResourceName } = require('../shared/enums');
const { getLocationRef, getPractitionerRef, parseRef, getPatientUuid } = require('../shared/utils');
const debug = require('debug')('ripple-cdr-discovery:services:resource');

class ResourceService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new ResourceService(ctx);
  }

  /**
   * Fetch patients
   *
   * @param {int|string} nhsNumber
   * @returns {Promise}
   */
  async fetchPatients(nhsNumber) {
    logger.info('services/resourceService|fetchPatients', { nhsNumber });

    const { patientCache } = this.ctx.cache;

    const exists = patientCache.byNhsNumber.exists(nhsNumber);
    debug('exists: %s', exists);

    if (exists) {
      return {
        ok: false,
        exists: true
      };
    }

    const { resourceRestService, tokenService } = this.ctx.services;

    const token = await tokenService.get();
    debug('token: %j', token);

    const data = await resourceRestService.getPatients(nhsNumber, token);
    debug('data: %j', data);

    if (!data || !data.entry) {
      return {
        ok: false,
        entry: false
      };
    }

    const result = {
      ok: true,
      totalCount: data.entry.length,
      processedCount: 0
    };

    data.entry.forEach((x) => {
      const patient = x.resource;
      const patientUuid = patient.id;

      const exists = patientCache.byPatientUuid.exists(patientUuid);
      if (exists) return;

      patientCache.byPatientUuid.set(patientUuid, patient);
      //@TODO check if we really need it.
      patientCache.byPatientUuid.setNhsNumber(patientUuid, nhsNumber);
      patientCache.byNhsNumber.setPatientUuid(nhsNumber, patientUuid);

      result.processedCount++;
    });

    return result;
  }

  /**
   * Fetch patient resources
   *
   * @param {int|string} nhsNumber
   * @param {string} resourceName
   * @returns {Promise}
   */
  async fetchPatientResources(nhsNumber, resourceName) {
    logger.info('services/resourceService|fetchPatientResources', { nhsNumber, resourceName });

    const { patientCache } = this.ctx.cache;
    const exists = patientCache.byResource.exists(nhsNumber, resourceName);

    if (exists) return {
      ok: false,
      exists: true
    };

    const { resourceCache, fetchCache } = this.ctx.cache;
    const { resourceRestService, patientService, tokenService } = this.ctx.services;

    const patientBundle = patientService.getPatientBundle(nhsNumber);
    const postData = {
      resources: [resourceName],
      patients: patientBundle
    };
    const token = await tokenService.get();
    debug('post data: %j', postData);

    const responseData = await resourceRestService.getPatientResources(postData, token);
    debug('response data: %j', responseData);

    if (!responseData || !responseData.entry) {
      return {
        ok: false,
        entry: false
      };
    }

    if (resourceName === ResourceName.PATIENT) {
      patientService.updatePatientBundle();
      patientCache.byPatientUuid.deleteAll();
    }

    fetchCache.deleteAll();

    const result = {
      ok: true,
      totalCount: responseData.entry.length,
      processedCount: 0
    };

    await P.each(responseData.entry, async (x) => {
      if (x.resource.resourceType !== resourceName) return;

      const resource = x.resource;
      const uuid = resource.id;
      const patientUuid = getPatientUuid(resource);

      resourceCache.byUuid.set(resourceName, uuid, resource);
      patientCache.byResource.set(nhsNumber, patientUuid, resourceName, uuid);
      patientCache.byNhsNumber.setResourceUuid(nhsNumber, resourceName, uuid);

      const practitionerRef = getPractitionerRef(resource);
      if (practitionerRef) {
        const practitionerUuid = parseRef(practitionerRef).uuid;
        resourceCache.byUuid.setPractitionerUuid(resourceName, uuid, practitionerUuid);
        await this.fetchPractitioner(resourceName, practitionerRef);
      }

      result.processedCount++;
    });

    return result;
  }

  /**
   * Fetch a resource practioner
   *
   * @param  {string} resourceName
   * @param  {string} reference
   * @return {Promise}
   */
  async fetchPractitioner(resourceName, reference) {
    logger.info('services/resourceService|fetchPractitioner', { resourceName, reference });

    // resource will be null if either:
    // - the practitioner is already cached; or
    // - the practioner is already in the process of being fetched in an earlier iteration
    const { resource } = await this.fetchResource(reference);

    debug('resource: %j', resource);
    if (!resource) return;

    // ensure organisation records for practitioner are also fetched and cached
    await P.each(resource.practitionerRole, async (role) => {
      const organisationRef = role.managingOrganisation.reference;
      const { resource } = await this.fetchResource(organisationRef);
      if (!resource) return;

      if (resourceName === ResourceName.PATIENT) {
        const locationRef = getLocationRef(resource);
        await this.fetchResource(locationRef);
      }
    });
  }

  /**
   * Fetch a resource
   *
   * @param  {string} reference
   * @return {Promise.<Object>}
   */
  async fetchResource(reference) {
    logger.info('services/resourceService|fetchResource', { reference });

    const { resourceName, uuid } = parseRef(reference);
    const { fetchCache, resourceCache } = this.ctx.cache;

    const exists  = resourceCache.byUuid.exists(resourceName, uuid);
    if (exists) {
      return {
        ok: false,
        exists: true
      };
    }

    const fetching = fetchCache.exists(reference);
    if (fetching) {
      return {
        ok: false,
        fetching: true
      };
    }

    const { tokenService, resourceRestService } = this.ctx.services;
    const token = await tokenService.get();

    fetchCache.set(reference);
    const resource = await resourceRestService.getResource(reference, token);

    debug('resource: %j', resource);

    resourceCache.byUuid.set(resourceName, uuid, resource);

    return {
      ok: true,
      resource
    };
  }

  /**
   * Gets organization location
   *
   * @param  {string} reference
   * @return {Object}
   */
  getOrganisationLocation(reference) {
    logger.info('cache/resourceService|getOrganisationLocation', { reference });

    const organisationUuid = parseRef(reference).uuid;
    if (!organisationUuid) return null;

    const { resourceCache } = this.ctx.cache;
    const organisation = resourceCache.byUuid.get(ResourceName.ORGANIZATION, organisationUuid);
    debug('organisation: %j', organisation);
    if (!organisation || !organisation.extension) return null;

    const locationRef = getLocationRef(organisation);
    const locationUuid = parseRef(locationRef).uuid;
    const location = resourceCache.byUuid.get(ResourceName.LOCATION, locationUuid);
    debug('location: %j', location);

    return location;
  }

  /**
   * Gets resource practioner
   *
   * @param  {string} resourceName
   * @param  {strijg} uuid
   * @return {Object}
   */
  getPractitioner(resourceName, uuid) {
    logger.info('cache/resourceService|getPractitioner', { resourceName, uuid });

    const { resourceCache } = this.ctx.cache;
    const practitionerUuid = resourceCache.byUuid.getPractitionerUuid(resourceName, uuid);
    if (!practitionerUuid) return null;

    const practitioner = resourceCache.byUuid.get(ResourceName.PRACTITIONER, practitionerUuid);
    debug('practioner: %j', practitioner);

    return practitioner;
  }

}

module.exports = ResourceService;
