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
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  13 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const ResourceService = require('@lib/services/resourceService');

describe('ripple-cdr-lib/lib/services/resourceService', () => {
  let ctx;
  let resourceService;

  let tokenService;
  let resourceRestService;
  let patientService;

  let patientCache;
  let resourceCache;
  let fetchCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    resourceService = new ResourceService(ctx);

    patientCache = ctx.cache.patientCache;
    resourceCache = ctx.cache.resourceCache;
    fetchCache = ctx.cache.fetchCache;

    tokenService = ctx.services.tokenService;
    patientService = ctx.services.patientService;
    resourceRestService = ctx.services.resourceRestService;

    tokenService.get.and.resolveValue('foo.bar.baz');

    ctx.cache.freeze();
    ctx.services.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = ResourceService.create(ctx);

      expect(actual).toEqual(jasmine.any(ResourceService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#fetchPatients', () => {
    let nhsNumber;

    beforeEach(() => {
      nhsNumber = 9999999000;
    });

    it('should return non ok when patients exists', async () => {
      const expected = {
        ok: false,
        exists: true
      };

      patientCache.byNhsNumber.exists.and.returnValue(true);

      const actual = await resourceService.fetchPatients(nhsNumber);

      expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(9999999000);
      expect(actual).toEqual(expected);
    });

    it('should return non ok when no data entry', async () => {
      const expected = {
         ok: false,
         entry: false
      };

      const data = {};

      patientCache.byNhsNumber.exists.and.returnValue(false);
      resourceRestService.getPatients.and.resolveValue(data);

      const actual = await resourceService.fetchPatients(nhsNumber);

      expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(9999999000);
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatients).toHaveBeenCalledWith(9999999000, 'foo.bar.baz');

      expect(actual).toEqual(expected);
    });

    it('should fetch and do not cache existing patients', async () => {
      const expected = {
        ok: true,
        totalCount: 1,
        processedCount: 0
      };

      const data = {
        entry: [
          {
            resource: {
              id: 'e22f0105-279d-4871-bde2-9e18684d69ec'
            }
          }
        ]
      };

      patientCache.byNhsNumber.exists.and.returnValue(false);
      resourceRestService.getPatients.and.resolveValue(data);
      patientCache.byPatientUuid.exists.and.returnValue(true);

      const actual = await resourceService.fetchPatients(nhsNumber);

      expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(9999999000);
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatients).toHaveBeenCalledWith(9999999000, 'foo.bar.baz');
      expect(patientCache.byPatientUuid.exists).toHaveBeenCalledWith('e22f0105-279d-4871-bde2-9e18684d69ec');

      expect(actual).toEqual(expected);
    });

    it('should fetch and cache patients', async () => {
      const expected = {
        ok: true,
        totalCount: 1,
        processedCount: 1
      };

      const data = {
        entry: [
          {
            resource: {
              id: 'e22f0105-279d-4871-bde2-9e18684d69ec'
            }
          }
        ]
      };

      patientCache.byNhsNumber.exists.and.returnValue(false);
      resourceRestService.getPatients.and.resolveValue(data);
      patientCache.byPatientUuid.exists.and.returnValue(false);

      const actual = await resourceService.fetchPatients(nhsNumber);

      expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(9999999000);
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatients).toHaveBeenCalledWith(9999999000, 'foo.bar.baz');
      expect(patientCache.byPatientUuid.exists).toHaveBeenCalledWith('e22f0105-279d-4871-bde2-9e18684d69ec');

      expect(patientCache.byPatientUuid.set).toHaveBeenCalledWith(
        'e22f0105-279d-4871-bde2-9e18684d69ec',
        {
          id: 'e22f0105-279d-4871-bde2-9e18684d69ec'
        }
      );
      expect(patientCache.byNhsNumber.setPatientUuid).toHaveBeenCalledWith(9999999000, 'e22f0105-279d-4871-bde2-9e18684d69ec');

      expect(actual).toEqual(expected);
    });
  });

  describe('#fetchPatientResources', () => {
    let nhsNumber;
    let resourceName;

    beforeEach(() => {
      nhsNumber = 9999999000;
      resourceName = 'Immunization';
    });

    it('should return non ok when resources exists', async () => {
      const expected = {
        ok: false,
        exists: true
      };

      patientCache.byResource.exists.and.returnValue(true);

      const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

      expect(patientCache.byResource.exists).toHaveBeenCalledWith(9999999000, 'Immunization');
      expect(actual).toEqual(expected);
    });

    it('should return non ok when no data entry', async () => {
      const expected = {
        ok: false,
        entry: false
      };

      const patientBundle = {
        resources: ['Immunization'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: 9999999111
            }
          }
        ]
      };
      const data = {};

      patientCache.byResource.exists.and.returnValue(false);
      patientService.getPatientBundle.and.returnValue(patientBundle);
      resourceRestService.getPatientResources.and.resolveValue(data);

      const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

      expect(patientCache.byResource.exists).toHaveBeenCalledWith(9999999000, 'Immunization');
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatientResources).toHaveBeenCalledWith(
        {
          resources: ['Immunization'],
          patients: patientBundle
        },
        'foo.bar.baz'
      );

      expect(actual).toEqual(expected);
    });

    it('should update patient bundle after fetching when resource name is Patient', async () => {
      const expected = {
        ok: true,
        totalCount: 0,
        processedCount: 0
      };

      const patientBundle = {
        resources: ['Patient'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: 9999999111
            }
          }
        ]
      };
      const data = {
        resourceType: 'Bundle',
        entry: []
      };

      patientCache.byResource.exists.and.returnValue(false);
      patientService.getPatientBundle.and.returnValue(patientBundle);
      resourceRestService.getPatientResources.and.resolveValue(data);

      resourceName = 'Patient';
      const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

      expect(patientCache.byResource.exists).toHaveBeenCalledWith(9999999000, 'Patient');
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatientResources).toHaveBeenCalledWith(
        {
          resources: ['Patient'],
          patients: patientBundle
        },
        'foo.bar.baz'
      );

      expect(patientService.updatePatientBundle).toHaveBeenCalled();
      expect(patientCache.byPatientUuid.deleteAll).toHaveBeenCalled();
      expect(fetchCache.deleteAll).toHaveBeenCalled();

      expect(actual).toEqual(expected);
    });

    it('should fetch and ignore resources with another resource type', async () => {
      const expected = {
        ok: true,
        totalCount: 1,
        processedCount: 0
      };

      const patientBundle = {
        resources: ['Immunization'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: 9999999111
            }
          }
        ]
      };
      const data = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              id: '0adc9b7f-d33d-4447-970f-ef295328eb29',
              resourceType: 'Condition'
            }
          }
        ]
      };

      patientCache.byResource.exists.and.returnValue(false);
      patientService.getPatientBundle.and.returnValue(patientBundle);
      resourceRestService.getPatientResources.and.resolveValue(data);

      const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

      expect(patientCache.byResource.exists).toHaveBeenCalledWith(9999999000, 'Immunization');
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatientResources).toHaveBeenCalledWith(
        {
          resources: ['Immunization'],
          patients: patientBundle
        },
        'foo.bar.baz'
      );
      expect(fetchCache.deleteAll).toHaveBeenCalled();

      expect(actual).toEqual(expected);
    });

    it('should fetch and cache resources with same resource type', async () => {
      const expected = {
        ok: true,
        totalCount: 1,
        processedCount: 1
      };

      const patientBundle = {
        resources: ['Immunization'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: 9999999111
            }
          }
        ]
      };
      const data = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              id: '0adc9b7f-d33d-4447-970f-ef295328eb29',
              resourceType: 'Immunization',
              patient: {
                reference: 'Patient/93e4dcc0-409c-446d-a58a-f04cdfb9cd7d'
              }
            }
          }
        ]
      };

      patientCache.byResource.exists.and.returnValue(false);
      patientService.getPatientBundle.and.returnValue(patientBundle);
      resourceRestService.getPatientResources.and.resolveValue(data);

      const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

      expect(patientCache.byResource.exists).toHaveBeenCalledWith(9999999000, 'Immunization');
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatientResources).toHaveBeenCalledWith(
        {
          resources: ['Immunization'],
          patients: patientBundle
        },
        'foo.bar.baz'
      );

      expect(fetchCache.deleteAll).toHaveBeenCalled();
      expect(resourceCache.byUuid.set).toHaveBeenCalledWith('Immunization', '0adc9b7f-d33d-4447-970f-ef295328eb29', {
        id: '0adc9b7f-d33d-4447-970f-ef295328eb29',
        resourceType: 'Immunization',
        patient: {
          reference: 'Patient/93e4dcc0-409c-446d-a58a-f04cdfb9cd7d'
        }
      });
      expect(patientCache.byResource.set).toHaveBeenCalledWith(
        9999999000, '93e4dcc0-409c-446d-a58a-f04cdfb9cd7d', 'Immunization', '0adc9b7f-d33d-4447-970f-ef295328eb29'
      );
      expect(patientCache.byNhsNumber.setResourceUuid).toHaveBeenCalledWith(
        9999999000, 'Immunization', '0adc9b7f-d33d-4447-970f-ef295328eb29'
      );

      expect(actual).toEqual(expected);
    });

    it('should fetch and cache resources with with same resource type (practitioner reference)', async () => {
      const expected = {
        ok: true,
        totalCount: 1,
        processedCount: 1
      };

      const patientBundle = {
        resources: ['Immunization'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: 9999999111
            }
          }
        ]
      };
      const data = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              id: '0adc9b7f-d33d-4447-970f-ef295328eb29',
              resourceType: 'Immunization',
              patient: {
                reference: 'Patient/93e4dcc0-409c-446d-a58a-f04cdfb9cd7d'
              },
              informationSource: {
                reference: 'Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e'
              }
            }
          }
        ]
      };


      patientCache.byResource.exists.and.returnValue(false);
      patientService.getPatientBundle.and.returnValue(patientBundle);
      resourceRestService.getPatientResources.and.resolveValue(data);
      spyOn(resourceService, 'fetchPractitioner');

      const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

      expect(patientCache.byResource.exists).toHaveBeenCalledWith(9999999000, 'Immunization');
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getPatientResources).toHaveBeenCalledWith(
        {
          resources: ['Immunization'],
          patients: patientBundle
        },
        'foo.bar.baz'
      );

      expect(fetchCache.deleteAll).toHaveBeenCalled();
      expect(resourceCache.byUuid.set).toHaveBeenCalledWith('Immunization', '0adc9b7f-d33d-4447-970f-ef295328eb29', {
        id: '0adc9b7f-d33d-4447-970f-ef295328eb29',
        resourceType: 'Immunization',
        patient: {
          reference: 'Patient/93e4dcc0-409c-446d-a58a-f04cdfb9cd7d'
        },
        informationSource: {
          reference: 'Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e'
        }
      });
      // expect(patientCache.byResource.set).toHaveBeenCalledWith(
      //   9999999000, '93e4dcc0-409c-446d-a58a-f04cdfb9cd7d', 'Immunization', '0adc9b7f-d33d-4447-970f-ef295328eb29'
      // );
      // expect(patientCache.byNhsNumber.setResourceUuid).toHaveBeenCalledWith(
      //   9999999000, 'Immunization', '0adc9b7f-d33d-4447-970f-ef295328eb29'
      // );
      // expect(resourceService.fetchPractitioner).toHaveBeenCalledWith(
      //   'Immunization', 'Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e'
      // );

      expect(actual).toEqual(expected);
    });
  });

  describe('#fetchPractitioner', () => {
    let resourceName;
    let reference;

    beforeEach(() => {
      resourceName = 'Immunization';
      reference = 'Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e';
    });

    it('should fetch practitioner', async () => {
      spyOn(resourceService, 'fetchResource').and.resolveValue(
        {
          resource: null
        }
      );

      await resourceService.fetchPractitioner(resourceName, reference);

      expect(resourceService.fetchResource).toHaveBeenCalledTimes(1);
      expect(resourceService.fetchResource).toHaveBeenCalledWith('Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e');
    });

    it('should ignore fetching practitioner organization', async () => {
      spyOn(resourceService, 'fetchResource').and.resolveValues(
        {
          resource: {
            id: '2a5ad06f-2e15-4fcf-9ff5-584e9570fc54',
            practitionerRole: [
              {
                managingOrganisation: {
                  reference: 'Organization/f34c12b1-749e-4c26-9621-a986d67ecd44'
                }
              }
            ]
          }
        },
        {
          resource: null
        }
      );

      await resourceService.fetchPractitioner(resourceName, reference);

      expect(resourceService.fetchResource).toHaveBeenCalledTimes(2);
      expect(resourceService.fetchResource.calls.argsFor(0)).toEqual(['Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e']);
      expect(resourceService.fetchResource.calls.argsFor(1)).toEqual(['Organization/f34c12b1-749e-4c26-9621-a986d67ecd44']);
    });

    it('should fetch practitioner organization', async () => {
      spyOn(resourceService, 'fetchResource').and.resolveValues(
        {
          resource: {
            id: '2a5ad06f-2e15-4fcf-9ff5-584e9570fc54',
            practitionerRole: [
              {
                managingOrganisation: {
                  reference: 'Organization/f34c12b1-749e-4c26-9621-a986d67ecd44'
                }
              }
            ]
          }
        },
        {
          resource: {}
        }
      );

      await resourceService.fetchPractitioner(resourceName, reference);

      expect(resourceService.fetchResource).toHaveBeenCalledTimes(2);
      expect(resourceService.fetchResource.calls.argsFor(0)).toEqual(['Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e']);
      expect(resourceService.fetchResource.calls.argsFor(1)).toEqual(['Organization/f34c12b1-749e-4c26-9621-a986d67ecd44']);
    });

    it('should ignore fetching practitioner organization location', async () => {
      spyOn(resourceService, 'fetchResource').and.resolveValues(
        {
          resource: {
            id: '2a5ad06f-2e15-4fcf-9ff5-584e9570fc54',
            practitionerRole: [
              {
                managingOrganisation: {
                  reference: 'Organization/f34c12b1-749e-4c26-9621-a986d67ecd44'
                }
              }
            ]
          }
        },
        {
          resource: null
        }
      );

      await resourceService.fetchPractitioner(resourceName, reference);

      expect(resourceService.fetchResource).toHaveBeenCalledTimes(2);
      expect(resourceService.fetchResource.calls.argsFor(0)).toEqual(['Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e']);
      expect(resourceService.fetchResource.calls.argsFor(1)).toEqual(['Organization/f34c12b1-749e-4c26-9621-a986d67ecd44']);
    });

    it('should fetch practitioner organization location when resource name is Patient', async () => {
      spyOn(resourceService, 'fetchResource').and.resolveValues(
        {
          resource: {
            id: '2a5ad06f-2e15-4fcf-9ff5-584e9570fc54',
            practitionerRole: [
              {
                managingOrganisation: {
                  reference: 'Organization/f34c12b1-749e-4c26-9621-a986d67ecd44',
                }
              }
            ]
          }
        },
        {
          resource: {
            id: 'a231c6a1-3f46-4518-8771-2a69155920ff',
            extension: [
              {
                valueReference: {
                  reference: 'Location/bf6cc6ca-3d2f-468f-8025-15d71b2b00d2',
                }
              }
            ]
          }
        }
      );

      const resourceName = 'Patient';
      await resourceService.fetchPractitioner(resourceName, reference);

      expect(resourceService.fetchResource).toHaveBeenCalledTimes(3);
      expect(resourceService.fetchResource.calls.argsFor(0)).toEqual(['Practitioner/f08a49e4-8bf4-4beb-9837-dc26fe78111e']);
      expect(resourceService.fetchResource.calls.argsFor(1)).toEqual(['Organization/f34c12b1-749e-4c26-9621-a986d67ecd44']);
      expect(resourceService.fetchResource.calls.argsFor(2)).toEqual(['Location/bf6cc6ca-3d2f-468f-8025-15d71b2b00d2']);
    });
  });

  describe('#fetchResource', () => {
    let reference;

    beforeEach(() => {
      reference = 'Immunization/f08a49e4-8bf4-4beb-9837-dc26fe78111e';
    });

    it('should return non-ok when resource exists', async () => {
      const expected = {
        ok: false,
        exists: true
      };

      resourceCache.byUuid.exists.and.returnValue(true);

      const actual = await resourceService.fetchResource(reference);

      expect(resourceCache.byUuid.exists).toHaveBeenCalledWith('Immunization', 'f08a49e4-8bf4-4beb-9837-dc26fe78111e');
      expect(actual).toEqual(expected);
    });

    it('should return non-ok when resource fetching', async () => {
      const expected = {
        ok: false,
        fetching: true
      };

      resourceCache.byUuid.exists.and.returnValue(false);
      fetchCache.exists.and.returnValue(true);

      const actual = await resourceService.fetchResource(reference);

      expect(resourceCache.byUuid.exists).toHaveBeenCalledWith('Immunization', 'f08a49e4-8bf4-4beb-9837-dc26fe78111e');
      expect(fetchCache.exists).toHaveBeenCalledWith('Immunization/f08a49e4-8bf4-4beb-9837-dc26fe78111e');

      expect(actual).toEqual(expected);
    });

    it('should fetch and cache ressource', async () => {
      const expected = {
        ok: true,
        resource: {
          id: 'f08a49e4-8bf4-4beb-9837-dc26fe78111e',
          foo: 'bar'
        }
      };

      resourceCache.byUuid.exists.and.returnValue(false);
      fetchCache.exists.and.returnValue(false);
      resourceRestService.getResource.and.resolveValue({
        id: 'f08a49e4-8bf4-4beb-9837-dc26fe78111e',
        foo: 'bar'
      });

      const actual = await resourceService.fetchResource(reference);

      expect(resourceCache.byUuid.exists).toHaveBeenCalledWith('Immunization', 'f08a49e4-8bf4-4beb-9837-dc26fe78111e');
      expect(fetchCache.exists).toHaveBeenCalledWith('Immunization/f08a49e4-8bf4-4beb-9837-dc26fe78111e');
      expect(tokenService.get).toHaveBeenCalled();
      expect(resourceRestService.getResource).toHaveBeenCalledWith('Immunization/f08a49e4-8bf4-4beb-9837-dc26fe78111e', 'foo.bar.baz');
      expect(resourceCache.byUuid.set).toHaveBeenCalledWith('Immunization', 'f08a49e4-8bf4-4beb-9837-dc26fe78111e', {
        id: 'f08a49e4-8bf4-4beb-9837-dc26fe78111e',
        foo: 'bar'
      });

      expect(actual).toEqual(expected);
    });
  });

  describe('#getOrganisationLocation', () => {
    it('should return null when reference has bad format', () => {
      const expected = null;

      const reference = 'foo';
      const actual = resourceService.getOrganisationLocation(reference);

      expect(actual).toEqual(expected);
    });

    it('should return null when no resource found', () => {
      const expected = null;

      const reference = 'Organization/ad158290-d5e4-45f1-bff7-f50ff14019c2';
      const actual = resourceService.getOrganisationLocation(reference);

      expect(resourceCache.byUuid.get).toHaveBeenCalledWith('Organization', 'ad158290-d5e4-45f1-bff7-f50ff14019c2');
      expect(actual).toEqual(expected);
    });

    it('should return null when no resource extension found', () => {
      const expected = null;

      const organizationResource = {};
      resourceCache.byUuid.get.and.returnValue(organizationResource);

      const reference = 'Organization/ad158290-d5e4-45f1-bff7-f50ff14019c2';
      const actual = resourceService.getOrganisationLocation(reference);

      expect(resourceCache.byUuid.get).toHaveBeenCalledWith('Organization', 'ad158290-d5e4-45f1-bff7-f50ff14019c2');
      expect(actual).toEqual(expected);
    });

    it('should return location', () => {
      const expected = {
        id: 'ffcf9ca6-9318-4216-a052-370204fd4d59',
        resourceType: 'Location'
      };

      const organizationResource = {
        id: 'ad158290-d5e4-45f1-bff7-f50ff14019c2',
        resourceType: 'Organization',
        extension: [
          {
            valueReference: {
              reference: 'Location/ffcf9ca6-9318-4216-a052-370204fd4d59'
            }
          }
        ]
      };
      const locationResource = {
        id: 'ffcf9ca6-9318-4216-a052-370204fd4d59',
        resourceType: 'Location'
      };
      resourceCache.byUuid.get.and.returnValues(organizationResource, locationResource);

      const reference = 'Organization/ad158290-d5e4-45f1-bff7-f50ff14019c2';
      const actual = resourceService.getOrganisationLocation(reference);

      expect(resourceCache.byUuid.get).toHaveBeenCalledTimes(2);
      expect(resourceCache.byUuid.get.calls.argsFor(0)).toEqual(['Organization', 'ad158290-d5e4-45f1-bff7-f50ff14019c2']);
      expect(resourceCache.byUuid.get.calls.argsFor(1)).toEqual(['Location', 'ffcf9ca6-9318-4216-a052-370204fd4d59']);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getPractitioner', () => {
    it('should return null when no practitioner uuid associated with resource', () => {
      const expected = null;

      const resourceName = 'Immunization';
      const uuid = '74e224b9-2421-4b32-a113-126b7769f93a';
      const actual = resourceService.getPractitioner(resourceName, uuid);

      expect(resourceCache.byUuid.getPractitionerUuid).toHaveBeenCalledWith('Immunization', '74e224b9-2421-4b32-a113-126b7769f93a');
      expect(actual).toEqual(expected);
    });

    it('should return practitioner', () => {
      const expected = {
        id: '178ea9be-0c85-47ff-8464-76257ae3509e',
        resourceType: 'Practitioner'
      };

      const practitionerResource = {
        id: '178ea9be-0c85-47ff-8464-76257ae3509e',
        resourceType: 'Practitioner'
      };
      resourceCache.byUuid.getPractitionerUuid.and.returnValue('65521bb0-60b5-4e5f-9865-313cf9ed42d2');
      resourceCache.byUuid.get.and.returnValue(practitionerResource);

      const resourceName = 'Immunization';
      const uuid = '74e224b9-2421-4b32-a113-126b7769f93a';
      const actual = resourceService.getPractitioner(resourceName, uuid);

      expect(resourceCache.byUuid.getPractitionerUuid).toHaveBeenCalledWith('Immunization', '74e224b9-2421-4b32-a113-126b7769f93a');
      expect(resourceCache.byUuid.get).toHaveBeenCalledWith('Practitioner', '65521bb0-60b5-4e5f-9865-313cf9ed42d2');

      expect(actual).toEqual(expected);
    });
  });
});
