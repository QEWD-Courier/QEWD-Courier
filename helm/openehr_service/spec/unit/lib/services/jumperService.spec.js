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
const { OpenEhrAdapter } = require('@lib/core');
const jumper = require('@lib/jumper');
const JumperService = require('@lib/services/jumperService');

describe('lib/services/jumperService', () => {
  let ctx;
  let jumperService;

  let ehrSessionService;
  let patientService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    jumperService = new JumperService(ctx);

    ehrSessionService = ctx.services.ehrSessionService;
    patientService = ctx.services.patientService;

    ctx.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = JumperService.create(ctx);

      expect(actual).toEqual(jasmine.any(JumperService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#check', () => {
    it('should return non ok when jumper method not exist', async () => {
      const expected = {
        ok: false
      };

      const heading = 'referrals';
      const method = 'foo';
      const actual = jumperService.check(heading, method);

      expect(actual).toEqual(expected);
    });

    it('should return non ok when heading config is not defined', async () => {
      const expected = {
        ok: false
      };

      delete ctx.userDefined.globalConfig.openehr.headings.vaccinations;

      const heading = 'vaccinations';
      const method = 'post';
      const actual = jumperService.check(heading, method);

      expect(actual).toEqual(expected);
    });

    it('should return non ok when heading config template is not defined', async () => {
      const expected = {
        ok: false
      };

      const heading = 'counts';
      const method = 'post';
      const actual = jumperService.check(heading, method);

      expect(actual).toEqual(expected);
    });

    it('should return non ok when heading config template name is not defined', async () => {
      const expected = {
        ok: false
      };

      delete ctx.userDefined.globalConfig.openehr.headings.vaccinations.template.name;
      delete ctx.userDefined.globalConfig.openehr.headings.vaccinations.synopsisField;
      delete ctx.userDefined.globalConfig.openehr.headings.vaccinations.summaryTableFields;

      const heading = 'vaccinations';
      const method = 'post';
      const actual = jumperService.check(heading, method);

      expect(actual).toEqual(expected);
    });

    it('should return jumper config', async () => {
      const expected = {
        ok: true,
        synopsisField: 'vaccinationName',
        summaryTableFields: ['vaccinationName', 'dateCreated']
      };

      const heading = 'vaccinations';
      const method = 'post';
      const actual = jumperService.check(heading, method);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getBySourceId', () => {
    it('should return heading record data', async () => {
      const expected = {
        source: 'ethercis',
        sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        procedure_name: 'quux',
        name: 'John Doe',
        date: '2019-01-01',
        time: '15:00'
      };

      spyOn(jumper, 'getBySourceId').and.returnValue({
        source: 'ethercis',
        sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        procedure_name: 'quux',
        name: 'John Doe',
        date: '2019-01-01',
        time: '15:00'
      });

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const actual = await jumperService.getBySourceId(sourceId);

      expect(jumper.getBySourceId).toHaveBeenCalledWithContext(
        ctx.worker,
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        'pulsetile',
        ctx.qewdSession
      );
      expect(actual).toEqual(expected);
    });
  });

  describe('#query', () => {
    beforeEach(() => {
      ehrSessionService.start.and.resolveValue({
        sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
      });
      patientService.getEhrId.and.resolveValue('74b6a24b-bd97-47f0-ac6f-a632d0cac60f');
    });

    it('should return heading records', async () => {
      const expected = [
        {
          foo: 'bar'
        }
      ];

      spyOn(jumper, 'query').and.callFake((params, cb) => cb([{ foo: 'bar' }]));

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await jumperService.query(host, patientId, heading);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(patientService.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(jumper.query).toHaveBeenCalledWithContext(
        ctx.worker,
        {
          host: 'ethercis',
          patientId: 9999999000,
          heading: 'procedures',
          ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f',
          openEHR: jasmine.any(OpenEhrAdapter),
          openEHRSession: {
            id: '03134cc0-3741-4d3f-916a-a279a24448e5'
          },
          qewdSession: ctx.qewdSession
        },
        jasmine.any(Function)
      );

      expect(actual).toEqual(expected);
    });

    it('should throw error', async () => {
      const expected = {
        error: 'custom error'
      };

      spyOn(jumper, 'query').and.callFake((params, cb) => cb({ error: 'custom error' }));

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';

      try {
        await jumperService.query(host, patientId, heading);
      } catch (err) {
        expect(err).toEqual(expected);
      }
    });
  });

  describe('#post', () => {
    it('should post heading data', async () => {
      const expected = {
        ok: true,
        host: 'ethercis',
        heading: 'procedures',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      spyOn(jumper, 'post').and.callFake((params, cb) => cb(
        {
          ok: true,
          host: 'ethercis',
          heading: 'procedures',
          compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
        }
      ));

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const data = {
        foo: 'bar'
      };
      const actual = await jumperService.post(host, patientId, heading, data);

      expect(jumper.post).toHaveBeenCalledWithContext(
        ctx.worker,
        {
          defaultHost: 'ethercis',
          patientId: 9999999000,
          heading: 'procedures',
          data: {
            foo: 'bar'
          },
          method: 'post',
          qewdSession: ctx.qewdSession
        },
        jasmine.any(Function)
      );

      expect(actual).toEqual(expected);
    });

    it('should throw error', async () => {
      const expected = {
        error: 'custom error'
      };

      spyOn(jumper, 'post').and.callFake((params, cb) => cb({ error: 'custom error' }));

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const data = {
        foo: 'bar'
      };

      try {
        await jumperService.post(host, patientId, heading, data);
      } catch (err) {
        expect(err).toEqual(expected);
      }
    });
  });

  describe('#put', () => {
    it('should post heading data', async () => {
      const expected = {
        ok: true,
        host: 'ethercis',
        heading: 'procedures',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        action: 'foo'
      };

      spyOn(jumper, 'post').and.callFake((params, cb) => cb(
        {
          ok: true,
          host: 'ethercis',
          heading: 'procedures',
          compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
          action: 'foo'
        }
      ));

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1';
      const data = {
        foo: 'bar'
      };
      const actual = await jumperService.put(host, patientId, heading, compositionId, data);

      expect(jumper.post).toHaveBeenCalledWithContext(
        ctx.worker,
        {
          defaultHost: 'ethercis',
          patientId: 9999999000,
          heading: 'procedures',
          compositionId: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
          data: {
            foo: 'bar'
          },
          method: 'put',
          qewdSession: ctx.qewdSession
        },
        jasmine.any(Function)
      );

      expect(actual).toEqual(expected);
    });

    it('should throw error', async () => {
      const expected = {
        error: 'custom error'
      };

      spyOn(jumper, 'post').and.callFake((params, cb) => cb({ error: 'custom error' }));

      const host = 'ethercis';
      const patientId = 9999999000;
      const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1';
      const heading = 'procedures';
      const data = {
        foo: 'bar'
      };

      try {
        await jumperService.put(host, patientId, heading, compositionId, data);
      } catch (err) {
        expect(err).toEqual(expected);
      }
    });
  });
});
