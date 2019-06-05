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

  17 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { EhrIdNotFoundError } = require('@lib/errors');
const PatientService = require('@lib/services/patientService');

describe('lib/services/patientService', () => {
  let ctx;
  let patientService;

  let nhsNumberDb;
  let ehrSessionService;
  let ethercisEhrRestService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    patientService = new PatientService(ctx);

    nhsNumberDb = ctx.db.nhsNumberDb;
    ehrSessionService = ctx.services.ehrSessionService;
    ethercisEhrRestService = ctx.rest.ethercis;

    ehrSessionService.start.and.resolveValue({
      sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
    });

    ctx.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = PatientService.create(ctx);

      expect(actual).toEqual(jasmine.any(PatientService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#check', () => {
    it('should return existing patient data', async () => {
      const expected = {
        created: false,
        data: {
          ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
        }
      };

      ethercisEhrRestService.getEhr.and.resolveValue({
        ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = await patientService.check(host, patientId);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.getEhr).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 9999999000);

      expect(actual).toEqual(expected);
    });

    it('should return created patient data', async () => {
      const expected = {
        created: true,
        data: {
          ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
        }
      };

      ethercisEhrRestService.getEhr.and.rejectValue({ error: 'some error'});
      ethercisEhrRestService.postEhr.and.resolveValue({
        ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = await patientService.check(host, patientId);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.getEhr).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 9999999000);
      expect(ethercisEhrRestService.postEhr).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 9999999000);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getEhrId', () => {
    it('should return cached ehr id', async () => {
      const expected = '74b6a24b-bd97-47f0-ac6f-a632d0cac60f';

      nhsNumberDb.getEhrId.and.resolveValue('74b6a24b-bd97-47f0-ac6f-a632d0cac60f');

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = await patientService.getEhrId(host, patientId);

      expect(nhsNumberDb.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(actual).toEqual(expected);
    });

    it('should thrown ehr id not found error (no response)', async () => {
      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = patientService.getEhrId(host, patientId);

      await expectAsync(actual).toBeRejectedWith(new EhrIdNotFoundError());

      expect(nhsNumberDb.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.getEhr).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 9999999000);
    });

    it('should thrown ehr id not found error (bad response)', async () => {
      ethercisEhrRestService.getEhr.and.resolveValue({});

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = patientService.getEhrId(host, patientId);

      await expectAsync(actual).toBeRejectedWith(new EhrIdNotFoundError());

      expect(nhsNumberDb.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.getEhr).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 9999999000);
    });

    it('should return and cache ehr id', async () => {
      const expected = '74b6a24b-bd97-47f0-ac6f-a632d0cac60f';

      ethercisEhrRestService.getEhr.and.resolveValue({
        ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = await patientService.getEhrId(host, patientId);

      expect(nhsNumberDb.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.getEhr).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 9999999000);
      expect(nhsNumberDb.insert).toHaveBeenCalledWith('ethercis', 9999999000, '74b6a24b-bd97-47f0-ac6f-a632d0cac60f');

      expect(actual).toEqual(expected);
    });
  });
});
