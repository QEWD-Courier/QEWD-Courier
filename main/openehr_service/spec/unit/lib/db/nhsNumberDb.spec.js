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
const NhsNumberDb = require('@lib/db/nhsNumberDb');

describe('lib/db/nhsNumberDb', () => {
  let ctx;
  let nhsNumberDb;
  let nhsNoMap;

  function seeds() {
    [
      {
        patientId: 9999999000,
        host: 'ethercis',
        ehrId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6'
      },
      {
        patientId: 9999999000,
        host: 'marand',
        ehrId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6'
      },
      {
        patientId: 9999999111,
        host: 'ethercis',
        ehrId: '33a93da2-6677-42a0-8b39-9d1e012dde12'
      }
    ].forEach(x => {
      nhsNoMap.$(['byNHSNo', x.patientId, x.host]).value = x.ehrId;
      nhsNoMap.$(['byEhrId', x.ehrId, x.host]).value = x.patientId;
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumberDb = new NhsNumberDb(ctx);

    nhsNoMap = ctx.worker.db.use('RippleNHSNoMap');
    seeds();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = NhsNumberDb.create(ctx);

      expect(actual).toEqual(jasmine.any(NhsNumberDb));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getEhrId', () => {
    it('should return null', async () => {
      const expected = null;

      const host = 'foo';
      const patientId = 9999999000;
      const actual = nhsNumberDb.getEhrId(host, patientId);

      expect(actual).toEqual(expected);
    });

    it('should return ehr id', async () => {
      const expected = '188a6bbe-d823-4fca-a79f-11c64af5c2e6';

      const host = 'marand';
      const patientId = 9999999000;
      const actual = nhsNumberDb.getEhrId(host, patientId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getPatientId', () => {
    it('should return null', async () => {
      const expected = null;

      const host = 'ethercis';
      const ehrId = 'foo';
      const actual = nhsNumberDb.getPatientId(host, ehrId);

      expect(actual).toEqual(expected);
    });

    it('should return data by source id', async () => {
      const expected = 9999999000;

      const host = 'marand';
      const ehrId = '188a6bbe-d823-4fca-a79f-11c64af5c2e6';
      const actual = nhsNumberDb.getPatientId(host, ehrId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#insert', () => {
    it('should insert new db record data', async () => {
      const host = 'marand';
      const patientId = 9999999111;
      const ehrId = '0f7192e9-168e-4dea-812a-3e1d236ae46d';

      nhsNumberDb.insert(host, patientId, ehrId);

      const byNHSNo = nhsNoMap.$(['byNHSNo', '9999999111', 'marand']);
      expect(byNHSNo.value).toEqual('0f7192e9-168e-4dea-812a-3e1d236ae46d');

      const byEhrId = nhsNoMap.$(['byEhrId', '0f7192e9-168e-4dea-812a-3e1d236ae46d', 'marand']);
      expect(byEhrId.value).toEqual(9999999111);
    });
  });
});

