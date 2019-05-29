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
const { uuidV4Regex } = require('@tests/helpers/utils');
const Top3ThingsService = require('@lib/services/top3ThingsService');

describe('lib/services/top3ThingsService', () => {
  let ctx;
  let top3ThingsService;

  let top3ThingsDb;

  beforeEach(() => {
    const nowTime = Date.UTC(2018, 0, 1); // 1514764800000, now
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(nowTime));

    ctx = new ExecutionContextMock();
    top3ThingsService = new Top3ThingsService(ctx);

    top3ThingsDb = ctx.db.top3ThingsDb;
    top3ThingsDb.getBySourceId.and.returnValue({
      patientId: 9999999000,
      date: 1514764800000,
      data: {
        name1: 'foo1',
        description1: 'baz1',
        name2: 'foo2',
        description2: 'baz2',
        name3: 'foo3',
        description3: 'baz3'
      }
    });
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = Top3ThingsService.create(ctx);

      expect(actual).toEqual(jasmine.any(Top3ThingsService));
      expect(actual.ctx).toBe(ctx);
      expect(actual.top3ThingsDb).toBe(top3ThingsDb);
    });
  });

  describe('#getLatestSummaryByPatientId', () => {
    it('should return empty array', async () => {
      const expected = [];

      top3ThingsDb.getLatestSourceId.and.returnValue('');

      const patientId = 9999999000;
      const actual = top3ThingsService.getLatestSummaryByPatientId(patientId);

      expect(top3ThingsDb.getLatestSourceId).toHaveBeenCalledWith(9999999000);
      expect(actual).toEqual(expected);
    });

    it('should return top3 things summary', async () => {
      const expected = [
        {
          source: 'QEWDDB',
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          dateCreated: 1514764800000,
          name1: 'foo1',
          name2: 'foo2',
          name3: 'foo3'
        }
      ];

      top3ThingsDb.getLatestSourceId.and.returnValue('ce437b97-4f6e-4c96-89bb-0b58b29a79cb');

      const patientId = 9999999000;
      const actual = top3ThingsService.getLatestSummaryByPatientId(patientId);

      expect(top3ThingsDb.getLatestSourceId).toHaveBeenCalledWith(9999999000);
      expect(top3ThingsDb.getBySourceId).toHaveBeenCalledWith('ce437b97-4f6e-4c96-89bb-0b58b29a79cb');
      expect(actual).toEqual(expected);
    });
  });

  describe('#getLatestSynopsisByPatientId', () => {
    it('should return empty array', async () => {
      const expected = [];

      top3ThingsDb.getLatestSourceId.and.returnValue('');

      const patientId = 9999999000;
      const actual = top3ThingsService.getLatestSynopsisByPatientId(patientId);

      expect(top3ThingsDb.getLatestSourceId).toHaveBeenCalledWith(9999999000);
      expect(actual).toEqual(expected);
    });

    it('should return top3 things synopsis', async () => {
      const expected = [
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo1'
        },
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo2'
        },
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo3'
        }
      ];

      top3ThingsDb.getLatestSourceId.and.returnValue('ce437b97-4f6e-4c96-89bb-0b58b29a79cb');

      const patientId = 9999999000;
      const actual = top3ThingsService.getLatestSynopsisByPatientId(patientId);

      expect(top3ThingsDb.getLatestSourceId).toHaveBeenCalledWith(9999999000);
      expect(top3ThingsDb.getBySourceId).toHaveBeenCalledWith('ce437b97-4f6e-4c96-89bb-0b58b29a79cb');
      expect(actual).toEqual(expected);
    });
  });

  describe('#getLatestDetailByPatientId', () => {
    it('should return empty array', async () => {
      const expected = [];

      top3ThingsDb.getLatestSourceId.and.returnValue('');

      const patientId = 9999999000;
      const actual = top3ThingsService.getLatestDetailByPatientId(patientId);

      expect(top3ThingsDb.getLatestSourceId).toHaveBeenCalledWith(9999999000);
      expect(actual).toEqual(expected);
    });

    it('should return top3 things detail', async () => {
      const expected = {
        source: 'QEWDDB',
        sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
        dateCreated: 1514764800000,
        name1: 'foo1',
        description1: 'baz1',
        name2: 'foo2',
        description2: 'baz2',
        name3: 'foo3',
        description3: 'baz3'
      };

      top3ThingsDb.getLatestSourceId.and.returnValue('ce437b97-4f6e-4c96-89bb-0b58b29a79cb');

      const patientId = 9999999000;
      const actual = top3ThingsService.getLatestDetailByPatientId(patientId);

      expect(top3ThingsDb.getLatestSourceId).toHaveBeenCalledWith(9999999000);
      expect(top3ThingsDb.getBySourceId).toHaveBeenCalledWith('ce437b97-4f6e-4c96-89bb-0b58b29a79cb');
      expect(actual).toEqual(expected);
    });
  });

  describe('#create', () => {
    it('should create top3 things and return new sourceId', async () => {
      const patientId = 9999999000;
      const data = {
        name1: 'foo1',
        description1: 'baz1',
        name2: 'foo2',
        description2: 'baz2',
        name3: 'foo3',
        description3: 'baz3'
      };

      const actual = top3ThingsService.create(patientId, data);

      expect(top3ThingsDb.insert).toHaveBeenCalledWith(
        9999999000,
        jasmine.stringMatching(uuidV4Regex),
        {
          patientId: 9999999000,
          date: 1514764800000,
          data: {
            name1: 'foo1',
            description1: 'baz1',
            name2: 'foo2',
            description2: 'baz2',
            name3: 'foo3',
            description3: 'baz3'
          }
        }
      );
      expect(top3ThingsDb.setLatestSourceId).toHaveBeenCalledWith(9999999000, jasmine.stringMatching(uuidV4Regex));

      expect(actual).toMatch(uuidV4Regex);
    });
  });
});
