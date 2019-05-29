/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Alexey Kucherenko <alexei.kucherenko@gmail.com>                  |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  16 March 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { SessionCache } = require('@lib/cache');

describe('lib/cache/sessionCache', () => {
  let ctx;
  let sessionCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['openEHR', 'sessions', 'ethercis']).setDocument({
      id: 'e5770469-7c26-47f7-afe0-57bce80eb2ee',
      creationTime: 1546300800000
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    sessionCache = new SessionCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    seeds();
    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = SessionCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(SessionCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  describe('#get', () => {
    it('should return null', async () => {
      const expected = null;

      const host = 'marand';
      const actual = await sessionCache.get(host);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = {
        id: 'e5770469-7c26-47f7-afe0-57bce80eb2ee',
        creationTime: 1546300800000
      };

      const host = 'ethercis';
      const actual = await sessionCache.get(host);

      expect(actual).toEqual(expected);
    });
  });

  describe('#set', () => {
    it('should set data', async () => {
      const expected = {
        id: 'e5770469-7c26-47f7-afe0-57bce80eb2ee',
        creationTime: 1546300845123
      };

      const host = 'marand';
      const data = {
        id: 'e5770469-7c26-47f7-afe0-57bce80eb2ee',
        creationTime: 1546300845123
      };
      await sessionCache.set(host, data);

      const actual = qewdSession.data.$(['openEHR', 'sessions', 'marand']).getDocument();
      expect(actual).toEqual(expected);
    });
  });

  describe('#delete', () => {
    it('should delete data', async () => {
      const expected = null;

      const host = 'ethercis';
      await sessionCache.delete(host);

      const actual = qewdSession.data.$(['openEHR', 'sessions', 'ethercis']).exists;
      expect(actual).toBeFalsy(expected);
    });
  });
});
