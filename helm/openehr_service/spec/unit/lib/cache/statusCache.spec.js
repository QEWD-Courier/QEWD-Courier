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
const { StatusCache } = require('@lib/cache');

describe('lib/cache/statusCache', () => {
  let ctx;
  let statusCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['record_status']).setDocument({
      new_patient: true,
      requestNo: 1,
      status: 'loading_data'
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    statusCache = new StatusCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = StatusCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(StatusCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  describe('#get', () => {
    it('should return null', async () => {
      const expected = null;

      const actual = await statusCache.get();

      expect(actual).toEqual(expected);
    });

    it('should return status', async () => {
      const expected = {
        new_patient: true,
        requestNo: 1,
        status: 'loading_data'
      };

      seeds();

      const actual = await statusCache.get();

      expect(actual).toEqual(expected);
    });
  });

  describe('#set', () => {
    it('should set status', async () => {
      const expected = {
        new_patient: false,
        requestNo: 3,
        status: 'ready'
      };

      const data = {
        new_patient: false,
        requestNo: 3,
        status: 'ready'
      };
      await statusCache.set(data);

      const actual = qewdSession.data.$('record_status').getDocument();

      expect(actual).toEqual(expected);
    });
  });
});
