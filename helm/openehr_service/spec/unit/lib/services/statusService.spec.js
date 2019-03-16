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
const StatusService = require('@lib/services/statusService');

describe('lib/services/statusService', () => {
  let ctx;
  let statusService;

  let statusCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    statusService = new StatusService(ctx);

    statusCache = ctx.cache.statusCache;

    ctx.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = StatusService.create(ctx);

      expect(actual).toEqual(jasmine.any(StatusService));
      expect(actual.ctx).toBe(ctx);
      expect(actual.statusCache).toBe(statusCache);
    });
  });

  describe('#check', () => {
    it('should return null', async () => {
      const expected = null;

      const actual = await statusService.check();

      expect(statusCache.get).toHaveBeenCalled();
      expect(actual).toEqual(expected);
    });

    it('should increment requestNo and return updated state ', async () => {
      const expected = {
        requestNo: 4
      };

      statusCache.get.and.returnValue({
        requestNo: 3
      });

      const actual = await statusService.check();

      expect(statusCache.get).toHaveBeenCalled();
      expect(statusCache.set).toHaveBeenCalledWith({
        requestNo: 4
      });

      expect(actual).toEqual(expected);
    });
  });

  describe('#get', () => {
    it('should return record state ', async () => {
      const expected = {
        status: 'loading_data',
        new_patient: 'not_known_yet',
        requestNo: 1
      };

      const dbData = {
        status: 'loading_data',
        new_patient: 'not_known_yet',
        requestNo: 1
      };
      statusCache.get.and.returnValue(dbData);

      const actual = await statusService.get();

      expect(statusCache.get).toHaveBeenCalled();
      expect(actual).toEqual(expected);
    });
  });

  describe('#create', () => {
    it('should create record state ', async () => {
      const state = {
        status: 'loading_data',
        new_patient: true,
        requestNo: 5
      };
      await statusService.create(state);

      expect(statusCache.set).toHaveBeenCalledWith({
        status: 'loading_data',
        new_patient: true,
        requestNo: 5
      });
    });
  });

  describe('#update', () => {
    it('should update record state ', async () => {
      const state = {
        status: 'ready',
        new_patient: true,
        requestNo: 7
      };
      await statusService.update(state);

      expect(statusCache.set).toHaveBeenCalledWith({
        status: 'ready',
        new_patient: true,
        requestNo: 7
      });
    });
  });
});
