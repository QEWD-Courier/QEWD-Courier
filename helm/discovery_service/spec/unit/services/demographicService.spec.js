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

  15 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const DemographicService = require('@lib/services/demographicService');

describe('ripple-cdr-lib/lib/services/demographicService', () => {
  let ctx;
  let nhsNumber;

  let demographicService;

  let resourceService;
  let demographicCache;
  let discoveryCache;
  let resourceCache;
  let patientCache;

  function configureMocks() {
    resourceService.getOrganisationLocation.and.returnValue({});

    patientCache.byNhsNumber.getPatientUuid.and.returnValue('7bb44952-60dd-4ce8-9bbd-f0b56c80a260');
    patientCache.byPatientUuid.get.and.returnValue({
      name: [
        { text: 'John Doe' }
      ],
      gender: 'male',
      telecom : '+44 58584 5475477',
      birthDate: '1990-01-01T12:00:00Z'
    });
    patientCache.byPatientUuid.getPractitionerUuid.and.returnValue('3f2a728b-eda5-4c16-b67d-afeacaacbb1c');
    resourceCache.byUuid.get.and.returnValue({
      name: {
        text: 'Jane Doe'
      },
      practitionerRole: [
        {
          managingOrganization: {
            reference: 'Organization/1a30d00b-7fe5-44d5-bf18-9909e6fdacd2'
          }
        }
      ]
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 9999999000;

    demographicService = new DemographicService(ctx);

    resourceService = ctx.services.resourceService;
    demographicCache = ctx.cache.demographicCache;
    discoveryCache = ctx.cache.discoveryCache;
    resourceCache = ctx.cache.resourceCache;
    patientCache = ctx.cache.patientCache;

    configureMocks();

    ctx.cache.freeze();
    ctx.services.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = DemographicService.create(ctx);

      expect(actual).toEqual(jasmine.any(DemographicService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getByPatientId', () => {
    it('should return demographics', () => {
      const expected = {
        demographics: {
          id: 9999999000,
          nhsNumber: 9999999000,
          gender: 'male',
          phone: '+44 58584 5475477',
          name: 'John Doe',
          dateOfBirth: 631195200000,
          gpName: 'Jane Doe',
          gpAddress: 'Not known',
          address: 'Not known'
        }
      };

      const actual = demographicService.getByPatientId(nhsNumber);

      expect(patientCache.byNhsNumber.getPatientUuid).toHaveBeenCalledWith(9999999000);
      expect(patientCache.byPatientUuid.get).toHaveBeenCalledWith('7bb44952-60dd-4ce8-9bbd-f0b56c80a260');
      expect(patientCache.byPatientUuid.getPractitionerUuid).toHaveBeenCalledWith('7bb44952-60dd-4ce8-9bbd-f0b56c80a260');
      expect(resourceCache.byUuid.get).toHaveBeenCalledWith('Practitioner', '3f2a728b-eda5-4c16-b67d-afeacaacbb1c');
      expect(resourceService.getOrganisationLocation).toHaveBeenCalledWith('Organization/1a30d00b-7fe5-44d5-bf18-9909e6fdacd2');

      expect(discoveryCache.deleteAll).toHaveBeenCalled();
      expect(demographicCache.byNhsNumber.set).toHaveBeenCalledWith(9999999000, {
        demographics: {
          id: 9999999000,
          nhsNumber: 9999999000,
          gender: 'male',
          phone: '+44 58584 5475477',
          name: 'John Doe',
          dateOfBirth: 631195200000,
          gpName: 'Jane Doe',
          gpAddress: 'Not known',
          address: 'Not known'
        }
      });

      expect(actual).toEqual(expected);
    });
  });

});
