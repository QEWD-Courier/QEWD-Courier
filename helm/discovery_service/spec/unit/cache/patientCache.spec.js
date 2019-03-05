/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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
const { PatientCache } = require('@lib/cache');

describe('ripple-cdr-lib/lib/cache/patientCache', () => {
  let ctx;

  let patientCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['Discovery', 'Patient']).setDocument({
      'by_nhsNumber': {
        '9999999000': {
          'Patient': {
            '888c1383-c07c-400d-99aa-f30350bdb984': '888c1383-c07c-400d-99aa-f30350bdb984',
            'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
          },
          resources: {
            AllergyIntolerance: {
              '888c1383-c07c-400d-99aa-f30350bdb984': '888c1383-c07c-400d-99aa-f30350bdb984'
            },
            Immunization: {
              'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
            }
          }
        }
      },
      'by_uuid': {
        '888c1383-c07c-400d-99aa-f30350bdb984': {
          'data': {
            foo: 'bar',
            testArray: [3, 4]
          },
          practitioner: 'ed8489c4-ca57-4c8c-8349-d96ada1da244'
        },
        'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': {
          data: {
            bar: 'quux',
            testArray: [1, 2]
          },
          practitioner: 'f24bb154-2155-4cfd-b3bf-af1c3fa95c3b',
        }
      },
      resources: {
        AllergyIntolerance: {
          '888c1383-c07c-400d-99aa-f30350bdb984': '888c1383-c07c-400d-99aa-f30350bdb984'
        },
        Immunization: {
          'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
        }
      }
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    patientCache = new PatientCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = PatientCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(PatientCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byResource).toEqual(jasmine.any(Object));
      expect(actual.byPatientUuid).toEqual(jasmine.any(Object));
      expect(actual.byNhsNumber).toEqual(jasmine.any(Object));
    });
  });

  describe('#export', () => {
    it('should export patient data', () => {
      const expected = {
        by_nhsNumber: {
          '9999999000': {
            Patient: {
              '888c1383-c07c-400d-99aa-f30350bdb984': '888c1383-c07c-400d-99aa-f30350bdb984',
              'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
            },
            resources: {
              AllergyIntolerance: {
                '888c1383-c07c-400d-99aa-f30350bdb984': '888c1383-c07c-400d-99aa-f30350bdb984'
              },
              Immunization: {
                'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
              }
            }
          }
        },
        by_uuid: {
          '888c1383-c07c-400d-99aa-f30350bdb984': {
            'data': {
              foo: 'bar',
              testArray: [3, 4]
            },
            practitioner: 'ed8489c4-ca57-4c8c-8349-d96ada1da244'
          },
          'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': {
            data: {
              bar: 'quux',
              testArray: [1, 2]
            },
            practitioner: 'f24bb154-2155-4cfd-b3bf-af1c3fa95c3b',
          }
        },
        resources: {
          AllergyIntolerance: {
            '888c1383-c07c-400d-99aa-f30350bdb984': '888c1383-c07c-400d-99aa-f30350bdb984'
          },
          Immunization: {
            'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
          }
        }
      };

      seeds();

      const actual = patientCache.export();

      expect(actual).toEqual(expected);
    });
  });

  describe('byNhsNumber', () => {
    let nhsNumber;

    beforeEach(() => {
      nhsNumber = 9999999000;
    });

    describe('#exists', () => {
      it('should return false', () => {
        const expected = false;

        const actual = patientCache.byNhsNumber.exists(nhsNumber);

        expect(actual).toEqual(expected);
      });

      it('should return true', () => {
        const expected = true;

        seeds();
        const actual = patientCache.byNhsNumber.exists(nhsNumber);

        expect(actual).toEqual(expected);
      });
    });

    describe('#getPatientUuid', () => {
      it('should get patient uuid', () => {
        const expected = '888c1383-c07c-400d-99aa-f30350bdb984';

        seeds();
        const actual = patientCache.byNhsNumber.getPatientUuid(nhsNumber);

        expect(actual).toEqual(expected);
      });
    });

    describe('#getAllPatientUuids', () => {
      it('should get all patients uuid', () => {
        const expected = [
          '888c1383-c07c-400d-99aa-f30350bdb984',
          'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
        ];

        seeds();
        const actual = patientCache.byNhsNumber.getAllPatientUuids(nhsNumber);

        expect(actual).toEqual(expected);
      });
    });

    describe('#setPatientUuid', () => {
      it('should set all patient uuid', () => {
        const expected = {
          '9455268f-ee5b-481b-8dbc-a156897cf055': '9455268f-ee5b-481b-8dbc-a156897cf055'
        };

        const patientUuid = '9455268f-ee5b-481b-8dbc-a156897cf055';
        patientCache.byNhsNumber.setPatientUuid(nhsNumber, patientUuid);

        const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'Patient']).getDocument();
        expect(actual).toEqual(expected);
      });
    });

    describe('#setResourceUuid', () => {
      it('should set all patient uuid', () => {
        const expected = {
          AllergyIntolerance: {
            '9853d2e5-f706-4b59-af0b-c4bca3106a53': '9853d2e5-f706-4b59-af0b-c4bca3106a53'
          }
        };

        const resourceName = 'AllergyIntolerance';
        const uuid = '9853d2e5-f706-4b59-af0b-c4bca3106a53';
        patientCache.byNhsNumber.setResourceUuid(nhsNumber, resourceName, uuid);

        const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'resources']).getDocument();
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('byPatientUuid', () => {
    let patientUuid;

    beforeEach(() => {
      patientUuid = '888c1383-c07c-400d-99aa-f30350bdb984';
    });

    describe('#exists', () => {
      it('should return false', () => {
        const expected = false;

        const actual = patientCache.byPatientUuid.exists(patientUuid);

        expect(actual).toEqual(expected);
      });

      it('should return true', () => {
        const expected = true;

        seeds();
        const actual = patientCache.byPatientUuid.exists(patientUuid);

        expect(actual).toEqual(expected);
      });
    });

    describe('#set', () => {
      it('should set patient data', () => {
        const expected = {
          quux: 'quuz'
        };

        const data = {
          quux: 'quuz'
        };
        patientCache.byPatientUuid.set(patientUuid, data);

        const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid]).getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#get', () => {
      it('should get patient data', () => {
        const expected = {
          foo: 'bar',
          testArray: [3, 4]
        };

        seeds();
        const actual = patientCache.byPatientUuid.get(patientUuid);

        expect(actual).toEqual(expected);
      });
    });

    describe('#setNhsNumber', () => {
      it('should set nhs number', () => {
        const expected = {
          nhsNumber: {
            '9999999000': 9999999000
          }
        };

        const nhsNumber = 9999999000;
        patientCache.byPatientUuid.setNhsNumber(patientUuid, nhsNumber);

        const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid]).getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#deleteAll', () => {
      it('should delete all data', () => {
        const expected = {};

        seeds();
        patientCache.byPatientUuid.deleteAll();

        const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid']).getDocument();
        expect(actual).toEqual(expected);
      });
    });

    describe('#getPractitionerUuid', () => {
      it('should get practitioner uuid by patient uuid', () => {
        const expected = 'ed8489c4-ca57-4c8c-8349-d96ada1da244';

        seeds();
        const actual = patientCache.byPatientUuid.getPractitionerUuid(patientUuid);

        expect(actual).toEqual(expected);
      });
    });

    describe('#getByPatientUuids', () => {
      it('should return data by patient uuids', () => {
        const expected = [{
          data: {
            bar: 'quux', testArray: [1, 2]
          },
          practitioner: 'f24bb154-2155-4cfd-b3bf-af1c3fa95c3b'
        }];

        seeds();

        const patientUuids = [
          'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
        ];
        const actual = patientCache.byPatientUuid.getByPatientUuids(patientUuids);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('byResource', () => {
    let nhsNumber;
    let patientUuid;
    let resourceName;
    let uuid;

    beforeEach(() => {
      nhsNumber = 9999999000;
      patientUuid = '888c1383-c07c-400d-99aa-f30350bdb984';
      resourceName = 'Immunization';
      uuid = 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
    });

    describe('#exists', () => {
      it('should return false', () => {
        const expected = false;

        const actual = patientCache.byResource.exists(nhsNumber, resourceName);

        expect(actual).toEqual(expected);
      });

      it('should return true', () => {
        const expected = true;

        seeds();
        const actual = patientCache.byResource.exists(nhsNumber, resourceName);

        expect(actual).toEqual(expected);
      });
    });

    describe('#set', () => {
      it('should set resource uuid', () => {
        patientCache.byResource.set(nhsNumber, patientUuid, resourceName, uuid);

        const byNhsNumber = qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber]).getDocument();
        expect(byNhsNumber).toEqual({
          resources: {
            Immunization: {
              'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
            }
          }
        });

        const byPatientUuid = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid]).getDocument();
        expect(byPatientUuid).toEqual({
          resources: {
            Immunization: {
              'ce437b97-4f6e-4c96-89bb-0b58b29a79cb': 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
            }
          }
        });
      });
    });

    describe('#getUuidsByResourceName', () => {
      it('should get uuids by resource name', () => {
        const expected = [
          'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
        ];

        seeds();
        const actual = patientCache.byResource.getUuidsByResourceName(nhsNumber, resourceName);

        expect(actual).toEqual(expected);
      });
    });
  });
});
