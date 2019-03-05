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
const CacheService = require('@lib/services/cacheService');

describe('ripple-cdr-lib/lib/services/cacheService', () => {
  let ctx;
  let nhsNumber;

  let cacheService;
  let demographicCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 9999999000;

    cacheService = new CacheService(ctx);
    demographicCache = ctx.cache.demographicCache;

    ctx.cache.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = CacheService.create(ctx);

      expect(actual).toEqual(jasmine.any(CacheService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getDemographics', () => {
    it('should return null when error occurred', () => {
      const expected = null;

      demographicCache.byNhsNumber.get.and.throwError(new Error('some custom error'));

      const actual = cacheService.getDemographics(nhsNumber);

      expect(actual).toEqual(expected);
    });

    it('should return cached demographics', () => {
      const expected = {
        id: 9999999000,
        nhsNumber: 9999999000,
        gender: 'female',
        phone : '+44 58584 5475477',
        name: 'Megan',
        dateOfBirth: 1546400900000,
        gpName: 'Fox',
        gpAddress: 'California',
        address: 'London'
      };

      const data = {
        id: 9999999000,
        nhsNumber: 9999999000,
        gender: 'female',
        phone : '+44 58584 5475477',
        name: 'Megan',
        dateOfBirth: 1546400900000,
        gpName: 'Fox',
        gpAddress: 'California',
        address: 'London'
      };
      demographicCache.byNhsNumber.get.and.returnValue(data);

      const actual = cacheService.getDemographics(nhsNumber);

      expect(actual).toEqual(expected);
    });
  });
});
