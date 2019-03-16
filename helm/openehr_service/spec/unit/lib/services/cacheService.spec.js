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
const CacheService = require('@lib/services/cacheService');

describe('lib/services/cacheService', () => {
  let ctx;
  let cacheService;

  let session1;
  let session2;

  // TODO: fix seeds
  function seeds(q) {
    // session 1
    session1 = q.sessions.create('app1');
    const byPatientId1 = session1.data.$(['headings', 'byPatientId', 9999999000, 'procedures']);
    byPatientId1.$(['byDate', 1514764800000, '0f7192e9-168e-4dea-812a-3e1d236ae46d']).value = 'true';
    byPatientId1.$(['byHost', 'ethercis', '0f7192e9-168e-4dea-812a-3e1d236ae46d']).value = 'true';
    const bySourceId1 = session1.data.$(['headings', 'bySourceId']);
    bySourceId1.$('0f7192e9-168e-4dea-812a-3e1d236ae46d').setDocument({date: 1514764800000});
    const byHeading1 = session1.data.$(['headings', 'byHeading', 'procedures']);
    byHeading1.$('0f7192e9-168e-4dea-812a-3e1d236ae46d').value = 'true';

    // session 2
    session2 = q.sessions.create('app2');
    const byPatientId2 = session2.data.$(['headings', 'byPatientId', 9999999000, 'procedures']);
    byPatientId2.$(['byDate', 1483228800000, '260a7be5-e00f-4b1e-ad58-27d95604d010']).value = 'true';
    byPatientId2.$(['byHost', 'ethercis', '260a7be5-e00f-4b1e-ad58-27d95604d010']).value = 'true';
    const bySourceId2 = session2.data.$(['headings', 'bySourceId']);
    bySourceId2.$('260a7be5-e00f-4b1e-ad58-27d95604d010').setDocument({date: 1483228800000});
    const byHeading2 = session1.data.$(['headings', 'byHeading', 'procedures']);
    byHeading2.$('260a7be5-e00f-4b1e-ad58-27d95604d010').value = 'true';
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    cacheService = new CacheService(ctx);

    seeds(ctx.worker);
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = CacheService.create(ctx);

      expect(actual).toEqual(jasmine.any(CacheService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#delete', () => {
    it('should delete session cache', async () => {
      const patientId = 9999999000;
      const heading = 'procedures';
      const host = 'ethercis';

      await cacheService.delete(host, patientId, heading);

      expect(session1.data.$('heading').exists).toBeFalsy();
      expect(session2.data.$('heading').exists).toBeFalsy();
    });
  });
});
