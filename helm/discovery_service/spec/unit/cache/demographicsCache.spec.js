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

  11 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { DemographicCache } = require('@lib/cache');

describe('ripple-cdr-lib/lib/cache/demographicsCache', () => {
  let ctx;
  let nhsNumber;

  let demographicsCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['Demographics', 'by_nhsNumber', nhsNumber]).setDocument({
      id: nhsNumber,
      nhsNumber: nhsNumber,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: 1546300800000,
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    demographicsCache = new DemographicCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    nhsNumber = 9999999000;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = DemographicCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(DemographicCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byNhsNumber).toEqual(jasmine.any(Object));
    });
  });

  describe('byNhsNumber', () => {
    describe('#get', () => {
      it('should get demographics cache', () => {
        const expected = {
          id: 9999999000,
          nhsNumber: 9999999000,
          gender: 'female',
          phone : '+44 58584 5475477',
          name: 'Megan',
          dateOfBirth: 1546300800000,
          gpName: 'Fox',
          gpAddress: 'California',
          address: 'London'
        };

        seeds();

        demographicsCache.byNhsNumber.get(nhsNumber);

        const actual = qewdSession.data.$(['Demographics', 'by_nhsNumber', 9999999000]).getDocument(true);

        expect(actual).toEqual(expected);
      });
    });

    describe('#set', () => {
      it('should set demographics cache', () => {
        const expected = {
          id: 9999999000,
          nhsNumber: 9999999000,
          gender: 'male',
          phone : '+44 58000 5478901',
          name: 'Brad',
          dateOfBirth: 1546300800000,
          gpName: 'Pitt',
          gpAddress: 'California',
          address: '90210 Beverly Hills'
        };

        const data = {
          id: 9999999000,
          nhsNumber: 9999999000,
          gender: 'male',
          phone : '+44 58000 5478901',
          name: 'Brad',
          dateOfBirth: 1546300800000,
          gpName: 'Pitt',
          gpAddress: 'California',
          address: '90210 Beverly Hills'
        };
        demographicsCache.byNhsNumber.set(nhsNumber, data);

        const actual = qewdSession.data.$(['Demographics', 'by_nhsNumber', nhsNumber]).getDocument(true);

        expect(actual).toEqual(expected);
      });
    });
  });
});
