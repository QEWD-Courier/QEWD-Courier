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
const { FetchCache } = require('@lib/cache');

describe('ripple-cdr-lib/lib/cache/fetchCache', () => {
  let ctx;
  let reference;

  let fetchCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['fetchingResource', 'Immunization/05659867-d811-40c7-beb9-e51fa6fdb033']).value = true;
    qewdSession.data.$(['fetchingResource', 'AllergyIntolerance/e0bf8e94-6f99-4862-b34e-a86e0f223543']).value = true;
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    fetchCache = new FetchCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    reference = 'Immunization/05659867-d811-40c7-beb9-e51fa6fdb033';

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = FetchCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(FetchCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  describe('#exists', () => {
    it('should return false', () => {
      const expected = false;

      const actual = fetchCache.exists(reference);

      expect(actual).toEqual(expected);
    });

    it('should return true when fetch cache for reference exists', () => {
      const expected = true;

      seeds();
      const actual = fetchCache.exists(reference);

      expect(actual).toEqual(expected);
    });
  });

  describe('#set', () => {
    it('should set fetch cache for a reference', () => {
      const expected = true;

      fetchCache.set(reference);

      const actual = qewdSession.data.$(['fetchingResource', reference]).value;
      expect(actual).toEqual(expected);
    });
  });

  describe('#deleteAll', () => {
    it('should delete all fetching cache for all references', () => {
      const expected = {};

      fetchCache.deleteAll();

      const actual = qewdSession.data.$(['fetchingResource']).getDocument();
      expect(actual).toEqual(expected);
    });
  });
});
