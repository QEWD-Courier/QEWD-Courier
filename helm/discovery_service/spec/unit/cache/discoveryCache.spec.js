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
const { DiscoveryCache } = require('@lib/cache');

describe('ripple-cdr-lib/lib/cache/discoveryCache', () => {
  let ctx;

  let discoveryCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['Discovery']).setDocument({
      'Patient': {
        '44137bde-4103-49c8-a4c8-7cb8fcf8aeb9': {
          value: 'bar'
        }
      },
      'Condition': {
        'cdff4e82-aec8-4724-857c-fbc7a90a4ad4': {
          value: 'quux'
        }
      }
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    discoveryCache = new DiscoveryCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = DiscoveryCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(DiscoveryCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  describe('#deleteAll', () => {
    it('should delete all discovery cache', () => {
      const excepted = {};

      seeds();

      discoveryCache.deleteAll();

      const actual = qewdSession.data.$(['Discovery']).getDocument();

      expect(actual).toEqual(excepted);
    });
  });
});
