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

  13 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { PatientBundleCache } = require('@lib/cache');

describe('ripple-cdr-lib/lib/cache/patientBundleCache', () => {
  let ctx;
  let nhsNumber;

  let patientBundleCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['Discovery', 'PatientBundle', 'by_nhsNumber', nhsNumber, 'Patient']).setDocument({
      'c57c65f2-1ca8-46df-9a29-09373dcff552': {
        value: 'foo'
      },
      'be7b03df-2c9a-4afd-8bc5-6065d0688f15': {
        value: 'bar'
      },
      '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5': {
        value: 'baz'
      }
    });
    qewdSession.data.$(['Discovery', 'PatientBundle', 'by_uuid']).setDocument({
      'c57c65f2-1ca8-46df-9a29-09373dcff552': {
        value: 'foo',
        testArray: [1, 2]
      },
      'be7b03df-2c9a-4afd-8bc5-6065d0688f15': {
        value: 'bar',
        testArray: [3, 4]
      },
      '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5': {
        value: 'baz',
        testArray: [5, 6]
      }
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    patientBundleCache = new PatientBundleCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    nhsNumber = 9999999000;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = PatientBundleCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(PatientBundleCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byNhsNumber).toEqual(jasmine.any(Object));
      expect(actual.byPatientUuid).toEqual(jasmine.any(Object));
    });
  });

  describe('#exists', () => {
    it('should return false', () => {
      const expected = false;

      const actual = patientBundleCache.exists();

      expect(actual).toEqual(expected);
    });

    it('should return true when bundle cache exists', () => {
      const expected = true;

      seeds();

      const actual = patientBundleCache.exists();

      expect(actual).toEqual(expected);
    });
  });

  describe('#import', () => {
    it('should set data to bundle cache', () => {
      const expected = {
        foo: 'bar'
      };

      const data = {
        foo: 'bar'
      };
      patientBundleCache.import(data);

      const actual = qewdSession.data.$(['Discovery', 'PatientBundle']).getDocument(true);
      expect(actual).toEqual(expected);
    });
  });

  describe('byNhsNumber', () => {
    it('should return all patient uuids', () => {
      const expected = [
        '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5',
        'be7b03df-2c9a-4afd-8bc5-6065d0688f15',
        'c57c65f2-1ca8-46df-9a29-09373dcff552'
      ];

      seeds();

      const actual = patientBundleCache.byNhsNumber.getAllPatientUuids(nhsNumber);

      expect(actual).toEqual(expected);
    });
  });

  describe('byPatientUuid', () => {
    it('should return patients by patient uuids', () => {
      const expected = [
        {
          value: 'baz',
          testArray: [5, 6]
        },
        {
          value: 'bar',
          testArray: [3, 4]
        },
        {
          value: 'foo',
          testArray: [1, 2]
        }
      ];

      seeds();

      const patientUiids = [
        '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5',
        'be7b03df-2c9a-4afd-8bc5-6065d0688f15',
        'c57c65f2-1ca8-46df-9a29-09373dcff552'
      ];
      const actual = patientBundleCache.byPatientUuid.getByPatientUuids(patientUiids);

      expect(actual).toEqual(expected);
    });
  });
});

