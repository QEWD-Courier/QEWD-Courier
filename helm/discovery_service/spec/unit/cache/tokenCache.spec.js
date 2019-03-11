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
const { TokenCache } = require('@lib/cache');

describe('ripple-cdr-lib/lib/cache/tokenCache', () => {
  let ctx;

  let tokenCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['discoveryToken']).setDocument({
      token: 'foo.bar.baz',
      createdAt: 1546300800000
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    tokenCache = new TokenCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = TokenCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(TokenCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  describe('#get', () => {
    it('should get token from cache', () => {
      const expected = {
        token: 'foo.bar.baz',
        createdAt: 1546300800000
      };

      seeds();
      const actual = tokenCache.get();

      expect(actual).toEqual(expected);
    });
  });

  describe('#set', () => {
    it('should set token to cache', () => {
      const token = {
        token: 'quuz.quux.quuy',
        createdAt: 1546300800000
      };

      tokenCache.set(token);

      const actual = qewdSession.data.$(['discoveryToken']).getDocument();
      expect(actual).toEqual(token);
    });
  });

  describe('#delete', () => {
    it('should delete token from cache', () => {
      const expected = {};

      seeds();
      tokenCache.delete();

      const actual = qewdSession.data.$(['discoveryToken']).getDocument();
      expect(actual).toEqual(expected);
    });
  });
});
