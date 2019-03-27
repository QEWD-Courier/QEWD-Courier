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
const { uuidV4Regex } = require('@tests/helpers/utils');
const RespectFormVersionService = require('@lib/services/respectFormVersionService');

describe('lib/services/respectFormVersionService', () => {
  let ctx;
  let respectFormVersionService;

  let respectFormDb;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    respectFormVersionService = new RespectFormVersionService(ctx);

    respectFormDb = ctx.db.respectFormDb;

    ctx.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = RespectFormVersionService.create(ctx);

      expect(actual).toEqual(jasmine.any(RespectFormVersionService));
      expect(actual.ctx).toBe(ctx);
      expect(actual.respectFormDb).toBe(respectFormDb);
    });
  });

  describe('#getByPatientId', () => {
    it('should return respect form versions', async () => {
      const expected = [
        {
          version: 5,
          author: 'Tony Shannon',
          dateCreated: 1514808000000,
          status: 'foo',
          sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
          source: 'ethercis'
        }
      ];

      const dbData = [...expected];
      respectFormDb.getByPatientId.and.returnValue(dbData);

      const patientId = 9999999000;
      const actual = await respectFormVersionService.getByPatientId(patientId);

      expect(respectFormDb.getByPatientId).toHaveBeenCalledWith(9999999000);
      expect(actual).toEqual(expected);
    });
  });

  describe('#validateGet', () => {
    it('should return the selected patient does not have any Respect Forms error', () => {
      const expected = {
        error: 'The selected patient does not have any Respect Forms'
      };

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateGet(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);

      expect(actual).toEqual(expected);
    });

    it('should return the selected patient does not have any Respect Forms error', () => {
      const expected = {
        error: 'The specified sourceId does not exist'
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateGet(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');

      expect(actual).toEqual(expected);
    });

    it('should return the specified sourceId and version does not exist', () => {
      const expected = {
        error: 'The specified sourceId and version does not exist'
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);
      respectFormDb.bySourceId.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateGet(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');
      expect(respectFormDb.byVersion.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5);

      expect(actual).toEqual(expected);
    });

    it('should return ok', () => {
      const expected = {
        ok: true
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);
      respectFormDb.bySourceId.exists.and.returnValue(true);
      respectFormDb.byVersion.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateGet(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');
      expect(respectFormDb.byVersion.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5);

      expect(actual).toEqual(expected);
    });
  });

  describe('#get', () => {
    it('should return respect form version data', () => {
      const expected = {
        version: 5,
        author: 'Tony Shannon',
        dateCreated: 1514808000000,
        status: 'foo',
        sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
        source: 'ethercis'
      };

      const dbData = {
        ...expected
      };
      respectFormDb.byVersion.getCompositionId.and.returnValue(16);
      respectFormDb.byId.get.and.returnValue(dbData);

      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.get(sourceId, version);

      expect(respectFormDb.byVersion.getCompositionId).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5);
      expect(respectFormDb.byId.get).toHaveBeenCalledWith(16, 5);

      expect(actual).toEqual(expected);
    });
  });

  describe('#validateCreate', () => {
    it('should return the selected patient does not have any Respect Forms error', () => {
      const expected = {
        error: 'The selected patient does not have any Respect Forms'
      };

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const actual = respectFormVersionService.validateCreate(patientId, sourceId);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);

      expect(actual).toEqual(expected);
    });

    it('should return the selected patient does not have any Respect Forms error', () => {
      const expected = {
        error: 'The specified sourceId does not exist'
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const actual = respectFormVersionService.validateCreate(patientId, sourceId);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');

      expect(actual).toEqual(expected);
    });

    it('should return ok', () => {
      const expected = {
        ok: true
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);
      respectFormDb.bySourceId.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const actual = respectFormVersionService.validateCreate(patientId, sourceId);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');

      expect(actual).toEqual(expected);
    });
  });

  describe('#create', () => {
    it('should create respect form version data (no sourceId)', () => {
      respectFormDb.byId.nextCompositionId.and.returnValue(33);
      respectFormDb.byId.nextVersion.and.returnValue(1);

      const patientId = 9999999000;
      const sourceId = null;
      const data = {
        foo: 'bar'
      };
      respectFormVersionService.create(patientId, sourceId, data);

      expect(respectFormDb.byId.nextCompositionId).toHaveBeenCalledWith();
      expect(respectFormDb.byId.nextVersion).toHaveBeenCalledWith(33);
      expect(respectFormDb.byId.set).toHaveBeenCalledWith(33, 1, data);

      expect(data.patientId).toEqual(9999999000);
      expect(data.uuid).toMatch(uuidV4Regex);
    });

    it('should create respect form version data (with sourceId)', () => {
      respectFormDb.bySourceId.getCompositionId.and.returnValue(45);
      respectFormDb.byId.nextVersion.and.returnValue(10);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const data = {
        foo: 'bar'
      };
      respectFormVersionService.create(patientId, sourceId, data);

      expect(respectFormDb.bySourceId.getCompositionId).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');
      expect(respectFormDb.byId.nextVersion).toHaveBeenCalledWith(45);
      expect(respectFormDb.byId.set).toHaveBeenCalledWith(45, 10, data);

      expect(data.patientId).toEqual(9999999000);
      expect(data.uuid).toMatch('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');
    });
  });

  describe('#validateUpdate', () => {
    it('should return the selected patient does not have any Respect Forms error', () => {
      const expected = {
        error: 'The selected patient does not have any Respect Forms'
      };

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateUpdate(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);

      expect(actual).toEqual(expected);
    });

    it('should return the selected patient does not have any Respect Forms error', () => {
      const expected = {
        error: 'The specified sourceId does not exist'
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateUpdate(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');

      expect(actual).toEqual(expected);
    });

    it('should return the specified sourceId and version does not exist', () => {
      const expected = {
        error: 'The specified sourceId and version does not exist'
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);
      respectFormDb.bySourceId.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateUpdate(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');
      expect(respectFormDb.byVersion.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5);

      expect(actual).toEqual(expected);
    });

    it('should return ok', () => {
      const expected = {
        ok: true
      };

      respectFormDb.byPatientId.exists.and.returnValue(true);
      respectFormDb.bySourceId.exists.and.returnValue(true);
      respectFormDb.byVersion.exists.and.returnValue(true);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 5;
      const actual = respectFormVersionService.validateUpdate(patientId, sourceId, version);


      expect(respectFormDb.byPatientId.exists).toHaveBeenCalledWith(9999999000);
      expect(respectFormDb.bySourceId.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');
      expect(respectFormDb.byVersion.exists).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5);

      expect(actual).toEqual(expected);
    });
  });

  describe('#update', () => {
    it('should update respect form version data', () => {
      respectFormDb.byVersion.getCompositionId.and.returnValue(76);
      respectFormDb.byId.nextVersion.and.returnValue(10);

      const patientId = 9999999000;
      const sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
      const version = 88;
      const data = {
        foo: 'bar'
      };
      respectFormVersionService.update(patientId, sourceId, version, data);

      expect(respectFormDb.byVersion.getCompositionId).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 88);
      expect(respectFormDb.byId.delete).toHaveBeenCalledWith(76, 88);
      expect(respectFormDb.byId.set).toHaveBeenCalledWith(76, 88, data);

      expect(data.patientId).toEqual(9999999000);
      expect(data.uuid).toMatch('2d800bcb-4b17-4cd3-8ad0-e34a786158a7');
    });
  });

});
