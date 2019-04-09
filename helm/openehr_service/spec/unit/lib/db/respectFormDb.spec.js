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

  27 March 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const RespectFormDb = require('@lib/db/respectFormDb');

describe('lib/db/respectFormDb', () => {
  let ctx;

  let respectFormDb;
  let respectForm;
  let respectFormIndex;

  function seeds() {
    [
      {
        patientId: 9999999000,
        data: [
          {
            id: 1,
            version: 1,
            author: 'Alexey Kucherenko',
            dateCreated: 1514808000000,
            status: 'foo',
            sourceId: '944d9567-7577-4f5a-b6be-c372d5bab162',
            testArray: [1, 2]
          },
          {
            id: 2,
            version: 1,
            author: 'Rob Tweed',
            dateCreated: 1537808000000,
            status: 'bar',
            sourceId: '478aee00-625f-4c42-bda2-d0b734950288',
            testArray: [3, 4]
          },
          {
            id: 2,
            version: 2,
            author: 'Rob Tweed',
            dateCreated: 1555808000000,
            status: 'baz',
            sourceId: 'e8eb45d5-aa5e-4c1d-8cbf-dc03adb6eec0',
            testArray: [5, 6]
          }
        ]
      },
      {
        patientId: 9999999111,
        data: [
          {
            id: 3,
            version: 1,
            author: 'Tony Shannon',
            dateCreated: 155608000000,
            status: 'quux',
            sourceId: '54a6c2ce-82df-4d81-bfaf-9fb4906a0a55',
            testArray: [7, 89]
          }
        ]
      }
    ].forEach(x => {
      x.data.forEach(y => {
        respectForm.$('next_id').increment();
        respectForm.$(['by_id', y.id, 'next_version']).increment();

        respectFormIndex.$(['by_patientId', x.patientId, y.id]).value = '';
        respectFormIndex.$(['by_uid', y.sourceId, y.version]).value = y.id;

        respectForm.$(['by_id', y.id, 'version', y.version]).setDocument({
          author: y.author,
          dateCompleted: y.dateCreated,
          status: y.status,
          uuid: y.sourceId,
          patientId: x.patientId,
          testArray: y.testArray
        });
      });
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    respectFormDb = new RespectFormDb(ctx);

    respectForm = ctx.worker.db.use('RespectForm');
    respectFormIndex = ctx.worker.db.use('RespectFormIndex');

    seeds();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = RespectFormDb.create(ctx);

      expect(actual).toEqual(jasmine.any(RespectFormDb));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getByPatientId', () => {
    it('should return data', async () => {
      const expected = [
        {
          version: 1,
          author: 'Alexey Kucherenko',
          dateCreated: 1514808000000,
          status: 'foo',
          sourceId: '944d9567-7577-4f5a-b6be-c372d5bab162',
          source: 'ethercis'
        },
        {
          version: 1,
          author: 'Rob Tweed',
          dateCreated: 1537808000000,
          status: 'bar',
          sourceId: '478aee00-625f-4c42-bda2-d0b734950288',
          source: 'ethercis'
        },
        {
          version: 2,
          author: 'Rob Tweed',
          dateCreated: 1555808000000,
          status: 'baz',
          sourceId: 'e8eb45d5-aa5e-4c1d-8cbf-dc03adb6eec0',
          source: 'ethercis'
        }
      ];

      const patientId = 9999999000;
      const actual = respectFormDb.getByPatientId(patientId);

      expect(actual).toEqual(expected);
    });
  });

  describe('byId', () => {
    describe('#nextCompositionId', () => {
      it('should return next composition id', () => {
        const expected = 5;

        const actual = respectFormDb.byId.nextCompositionId();

        expect(actual).toEqual(expected);
      });
    });

    describe('#nextVersion', () => {
      it('should return next version for composition id', () => {
        const expected = 3;

        const compositionId = 2;
        const actual = respectFormDb.byId.nextVersion(compositionId);

        expect(actual).toEqual(expected);
      });
    });

    describe('#get', () => {
      it('should return data', () => {
        const expected = {
          author: 'Tony Shannon',
          dateCompleted: 155608000000,
          status: 'quux',
          patientId: 9999999111,
          uuid: '54a6c2ce-82df-4d81-bfaf-9fb4906a0a55',
          testArray: [7, 89]
        };

        const compositionId = 3;
        const version = 1;
        const actual = respectFormDb.byId.get(compositionId, version);

        expect(actual).toEqual(expected);
      });
    });

    describe('#set', () => {
      it('should set data', () => {
        const expected = {
          foo: 'bar',
          testArray: [10, 20]
        };

        const compositionId = 3;
        const version = 1;
        const data = {
          foo: 'bar',
          testArray: [10, 20]
        };

        // to prevent merging data
        respectForm.$(['by_id', compositionId, 'version', version]).delete();

        respectFormDb.byId.set(compositionId, version, data);
        const actual = respectForm.$(['by_id', compositionId, 'version', version]).getDocument(true);

        expect(actual).toEqual(expected);
      });
    });

    describe('#delete', () => {
      it('should delete data', () => {
        const expected = {};

        const compositionId = 3;
        const version = 1;

        respectFormDb.byId.delete(compositionId, version);
        const actual = respectForm.$(['by_id', compositionId, 'version', version]).getDocument();

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('byPatientId', () => {
    describe('#exists', () => {
      it('should return true', () => {
        const expected = true;

        const patientId = 9999999000;
        const actual = respectFormDb.byPatientId.exists(patientId);

        expect(actual).toEqual(expected);
      });

      it('should return false', () => {
        const expected = false;

        const patientId = 7777777000;
        const actual = respectFormDb.byPatientId.exists(patientId);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('bySourceId', () => {
    describe('#exists', () => {
      it('should return true', () => {
        const expected = true;

        const sourceId = 'e8eb45d5-aa5e-4c1d-8cbf-dc03adb6eec0';
        const actual = respectFormDb.bySourceId.exists(sourceId);

        expect(actual).toEqual(expected);
      });

      it('should return false', () => {
        const expected = false;

        const sourceId = 'foo';
        const actual = respectFormDb.bySourceId.exists(sourceId);

        expect(actual).toEqual(expected);
      });
    });

    describe('#getCompositionId', () => {
      it('should return composition id', () => {
        const expected = 2;

        const sourceId = 'e8eb45d5-aa5e-4c1d-8cbf-dc03adb6eec0';
        const actual = respectFormDb.bySourceId.getCompositionId(sourceId);

        expect(actual).toEqual(expected);
      });

      it('should return empty (no source id)', () => {
        const expected = '';

        const sourceId = 'foo';
        const actual = respectFormDb.bySourceId.getCompositionId(sourceId);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('byVersion', () => {
    describe('#exists', () => {
      it('should return true', () => {
        const expected = true;

        const sourceId = 'e8eb45d5-aa5e-4c1d-8cbf-dc03adb6eec0';
        const version = 2;
        const actual = respectFormDb.byVersion.exists(sourceId, version);

        expect(actual).toEqual(expected);
      });

      it('should return false', () => {
        const expected = false;

        const sourceId = 'e8eb45d5-aa5e-4c1d-8cbf-dc03adb6eec0';
        const version = 20;
        const actual = respectFormDb.byVersion.exists(sourceId, version);

        expect(actual).toEqual(expected);
      });
    });

    describe('#getCompositionId', () => {
      it('should return composition id', () => {
        const expected = 3;

        const sourceId = '54a6c2ce-82df-4d81-bfaf-9fb4906a0a55';
        const version = 1;
        const actual = respectFormDb.byVersion.getCompositionId(sourceId, version);

        expect(actual).toEqual(expected);
      });

      it('should return empty (no version)', () => {
        const expected = '';

        const sourceId = '54a6c2ce-82df-4d81-bfaf-9fb4906a0a55';
        const version = 33;
        const actual = respectFormDb.byVersion.getCompositionId(sourceId, version);

        expect(actual).toEqual(expected);
      });
    });
  });
});

