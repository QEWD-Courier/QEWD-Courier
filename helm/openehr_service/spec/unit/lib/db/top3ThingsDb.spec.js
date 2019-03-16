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
const Top3ThingsDb = require('@lib/db/top3ThingsDb');

describe('lib/db/top3ThingsDb', () => {
  let ctx;
  let top3ThingsDb;

  function seeds() {
    const dbNode = ctx.worker.db.use('Top3Things');

    dbNode.$(['byPatient', 9999999000, 'latest']).value = 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
    dbNode.$(['bySourceId', 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb']).setDocument({
      date: 1519851600000,
      data: {
        name1: 'foo1',
        description1: 'baz1',
        name2: 'foo2',
        description2: 'baz2',
        name3: 'foo3',
        description3: 'baz3'
      }
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    top3ThingsDb = new Top3ThingsDb(ctx);

    seeds();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = Top3ThingsDb.create(ctx);

      expect(actual).toEqual(jasmine.any(Top3ThingsDb));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getLatestSourceId', () => {
    it('should return null', async () => {
      const expected = null;

      const patientId = 94347659193;
      const actual = top3ThingsDb.getLatestSourceId(patientId);

      expect(actual).toEqual(expected);
    });

    it('should return latest sourceId', async () => {
      const expected = 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb';

      const patientId = 9999999000;
      const actual = top3ThingsDb.getLatestSourceId(patientId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#setLatestSourceId', () => {
    it('should update latest sourceId', async () => {
      const patientId = 9999999000;
      const sourceId = 'eaf394a9-5e05-49c0-9c69-c710c77eda76';

      top3ThingsDb.setLatestSourceId(patientId, sourceId);

      const dbNode = ctx.worker.db.use('Top3Things');
      expect(dbNode.$(['byPatient', 9999999000, 'latest']).value).toBe(sourceId);
    });
  });

  describe('#getBySourceId', () => {
    it('should return top3 things data', async () => {
      const expected = {
        date: 1519851600000,
        data: {
          name1: 'foo1',
          description1: 'baz1',
          name2: 'foo2',
          description2: 'baz2',
          name3: 'foo3',
          description3: 'baz3'
        }
      };

      const sourceId = 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
      const actual = top3ThingsDb.getBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#insert', () => {
    it('should insert new top3 things data', async () => {
      const patientId = 9999999000;
      const sourceId = 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
      const top3Things = {
        patientId: 9999999000,
        date: 1514764800000,
        data: {
          name1: 'bar1',
          description1: 'quux1',
          name2: 'bar2',
          description2: 'quux2',
          name3: 'bar3',
          description3: 'quux3'
        }
      };
      top3ThingsDb.insert(patientId, sourceId, top3Things);

      const dbNode = ctx.worker.db.use('Top3Things');
      expect(dbNode.$(['bySourceId', sourceId]).getDocument()).toEqual({
        patientId: 9999999000,
        date: 1514764800000,
        data: {
          name1: 'bar1',
          description1: 'quux1',
          name2: 'bar2',
          description2: 'quux2',
          name3: 'bar3',
          description3: 'quux3'
        }
      });
      expect(dbNode.$(['byPatient', 9999999000, 'byDate', 1514764800000]).value).toBe(sourceId);
    });
  });
});
