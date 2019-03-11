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

  12 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const PatientService = require('@lib/services/patientService');

describe('ripple-cdr-lib/lib/services/patientService', () => {
  let ctx;

  let patientService;
  let patientBundleCache;
  let patientCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    patientService = new PatientService(ctx);
    patientBundleCache = ctx.cache.patientBundleCache;
    patientCache = ctx.cache.patientCache;

    ctx.cache.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = PatientService.create(ctx);

      expect(actual).toEqual(jasmine.any(PatientService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getPatientBundle', () => {
    let nhsNumber;

    beforeEach(() => {
      nhsNumber = 9999999000;
    });

    it('should return patient bundle (patient bundle cache)', () => {
      const expected = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999111',
              name: [
                {
                  text: 'John Doe'
                }
              ]
            }
          },
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999222',
              name: [
                {
                  text: 'Jane Doe'
                }
              ]
            }
          }
        ]
      };

      const patientUuids = [
        '48f8c9e3-7bae-4418-b896-2423957f3c33',
        '62656761-27c8-45ba-8f7c-67aa9eeb5a02',
      ];
      const patients = [
        {
          resourceType: 'Patient',
          id: '9999999111',
          name: [
            {
              text: 'John Doe'
            }
          ]
        },
        {
          resourceType: 'Patient',
          id: '9999999222',
          name: [
            {
              text: 'Jane Doe'
            }
          ]
        }
      ];

      patientBundleCache.exists.and.returnValue(true);
      patientBundleCache.byNhsNumber.getAllPatientUuids.and.returnValue(patientUuids);
      patientBundleCache.byPatientUuid.getByPatientUuids.and.returnValue(patients);

      const actual = patientService.getPatientBundle(nhsNumber);

      expect(patientBundleCache.exists).toHaveBeenCalled();
      expect(patientBundleCache.byNhsNumber.getAllPatientUuids).toHaveBeenCalledWith(9999999000);
      expect(patientBundleCache.byPatientUuid.getByPatientUuids).toHaveBeenCalledWith([
        '48f8c9e3-7bae-4418-b896-2423957f3c33',
        '62656761-27c8-45ba-8f7c-67aa9eeb5a02'
      ]);

      expect(actual).toEqual(expected);
    });

    it('should return patient bundle (patient cache)', () => {
      const expected = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999111',
              name: [
                {
                  text: 'John Doe'
                }
              ]
            }
          },
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999222',
              name: [
                {
                  text: 'Jane Doe'
                }
              ]
            }
          }
        ]
      };

      const patientUuids = [
        '48f8c9e3-7bae-4418-b896-2423957f3c33',
        '62656761-27c8-45ba-8f7c-67aa9eeb5a02',
      ];
      const patients = [
        {
          resourceType: 'Patient',
          id: '9999999111',
          name: [
            {
              text: 'John Doe'
            }
          ]
        },
        {
          resourceType: 'Patient',
          id: '9999999222',
          name: [
            {
              text: 'Jane Doe'
            }
          ]
        }
      ];

      patientBundleCache.exists.and.returnValue(false);
      patientCache.byNhsNumber.getAllPatientUuids.and.returnValue(patientUuids);
      patientCache.byPatientUuid.getByPatientUuids.and.returnValue(patients);

      const actual = patientService.getPatientBundle(nhsNumber);

      expect(patientBundleCache.exists).toHaveBeenCalled();
      expect(patientCache.byNhsNumber.getAllPatientUuids).toHaveBeenCalledWith(9999999000);
      expect(patientCache.byPatientUuid.getByPatientUuids).toHaveBeenCalledWith([
        '48f8c9e3-7bae-4418-b896-2423957f3c33',
        '62656761-27c8-45ba-8f7c-67aa9eeb5a02'
      ]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#updatePatientBundle', () => {
    it('should import data to patient bundle cache', () => {
      const data = {
        foo: 'bar'
      };
      patientCache.export.and.returnValue(data);

      patientService.updatePatientBundle();

      expect(patientCache.export).toHaveBeenCalled();
      expect(patientBundleCache.import).toHaveBeenCalledWith(data);
    });
  });
});
