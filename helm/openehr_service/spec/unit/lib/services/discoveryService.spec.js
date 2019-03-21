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
const DiscoveryService = require('@lib/services/discoveryService');

describe('lib/services/discoveryService', () => {
  let ctx;
  let discoveryService;

  let patientService;
  let headingService;

  let discoveryDb;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    discoveryService = new DiscoveryService(ctx);

    patientService = ctx.services.patientService;
    headingService = ctx.services.headingService;

    discoveryDb = ctx.db.discoveryDb;

    ctx.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = DiscoveryService.create(ctx);

      expect(actual).toEqual(jasmine.any(DiscoveryService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#mergeAll', () => {
    it('should merge data and return false', async () => {
      const expected = false;

      spyOn(discoveryService, 'merge').and.resolveValues(false, false);

      patientService.getEhrId.and.resolveValue('41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4');

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const data = [
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        },
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ];

      const actual = await discoveryService.mergeAll(host, patientId, heading, data);

      expect(patientService.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);

      expect(discoveryService.merge).toHaveBeenCalledTimes(2);
      expect(discoveryService.merge.calls.argsFor(0)).toEqual([
        'ethercis',
        9999999000,
        'procedures',
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        }
      ]);
      expect(discoveryService.merge.calls.argsFor(1)).toEqual([
        'ethercis',
        9999999000,
        'procedures',
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ]);

      expect(actual).toEqual(expected);
    });

    it('should merge data and return true', async () => {
      const expected = true;

      spyOn(discoveryService, 'merge').and.resolveValues(true, false);

      patientService.getEhrId.and.resolveValue('41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4');

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const data = [
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        },
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ];

      const actual = await discoveryService.mergeAll(host, patientId, heading, data);

      expect(patientService.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);

      expect(discoveryService.merge).toHaveBeenCalledTimes(2);
      expect(discoveryService.merge.calls.argsFor(0)).toEqual([
        'ethercis',
        9999999000,
        'procedures',
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        }
      ]);
      expect(discoveryService.merge.calls.argsFor(1)).toEqual([
        'ethercis',
        9999999000,
        'procedures',
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#merge', () => {
    it('should return false when record exists in discovery cache', async () => {
      const expected = false;

      discoveryDb.getSourceIdByDiscoverySourceId.and.returnValue('foo-bar');

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(actual).toEqual(expected);
    });

    it('should return false when error thrown', async () => {
      const expected = false;

      discoveryDb.getSourceIdByDiscoverySourceId.and.returnValue(null);
      headingService.post.and.rejectValue(new Error('custom error'));

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(headingService.post).toHaveBeenCalledWith(
        'ethercis',
        9999999000,
        'procedures',
        {
          data: {
            sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
          },
          format: 'pulsetile',
          source: 'GP'
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should return false when non ok response from OpenEHR server', async () => {
      const expected = false;

      discoveryDb.getSourceIdByDiscoverySourceId.and.returnValue(null);
      headingService.post.and.resolveValue({ ok: false });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(headingService.post).toHaveBeenCalledWith(
        'ethercis',
        9999999000,
        'procedures',
        {
          data: {
            sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
          },
          format: 'pulsetile',
          source: 'GP'
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should return true when record merged and cached in discovery cache', async () => {
      const expected = true;

      const response = {
        ok: true,
        compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
      };

      discoveryDb.getSourceIdByDiscoverySourceId.and.returnValue(null);
      headingService.post.and.resolveValue(response);
      discoveryDb.insert.and.returnValue();

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(headingService.post).toHaveBeenCalledWith(
        'ethercis',
        9999999000,
        'procedures',
        {
          data: {
            sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
          },
          format: 'pulsetile',
          source: 'GP'
        }
      );
      expect(discoveryDb.insert).toHaveBeenCalledWith(
        'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        {
          discovery: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
          openehr: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
          patientId: 9999999000,
          heading: 'procedures'
        }
      );

      expect(actual).toEqual(expected);
    });
  });

  describe('#delete', () => {
    it('should do nothing when record not found', async () => {
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      await discoveryService.delete(sourceId);

      expect(discoveryDb.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(discoveryDb.delete).not.toHaveBeenCalled();
    });

    it('should delete discovery data', async () => {
      const dbData = {
        discovery: '3020ad3c-8072-4b38-95f7-d8adbbbfb07a'
      };
      discoveryDb.getBySourceId.and.returnValue(dbData);

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      await discoveryService.delete(sourceId);

      expect(discoveryDb.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(discoveryDb.delete).toHaveBeenCalledWith(
        '3020ad3c-8072-4b38-95f7-d8adbbbfb07a',
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      );
    });
  });

  describe('#getAllSourceIds', () => {
    it('should return all source ids', async () => {
      const expected = [
        'ethercis-3020ad3c-8072-4b38-95f7-d8adbbbfb07a',
        'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      ];

      discoveryDb.getAllSourceIds.and.returnValue([
        'ethercis-3020ad3c-8072-4b38-95f7-d8adbbbfb07a',
        'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      ]);

      const actual = await discoveryService.getAllSourceIds();

      expect(discoveryDb.getAllSourceIds).toHaveBeenCalled();
      expect(actual).toEqual(expected);
    });
  });

  describe('#getSourceIds', () => {
    it('should return source ids by filter', async () => {
      const expected = [
        'ethercis-3020ad3c-8072-4b38-95f7-d8adbbbfb07a'
      ];

      discoveryDb.getSourceIds.and.returnValue([
        'ethercis-3020ad3c-8072-4b38-95f7-d8adbbbfb07a'
      ]);

      const filter = x => x.name === 'Alexey';
      const actual = await discoveryService.getSourceIds(filter);

      expect(discoveryDb.getSourceIds).toHaveBeenCalledWith(filter);
      expect(actual).toEqual(expected);
    });
  });

  describe('#getBySourceId', () => {
    it('should return data by source id', async () => {
      const expected = {
        foo: 'bar'
      };

      discoveryDb.getBySourceId.and.returnValue({
        foo: 'bar'
      });

      const sourceId = 'ethercis-3020ad3c-8072-4b38-95f7-d8adbbbfb07a';
      const actual = await discoveryService.getBySourceId(sourceId);

      expect(discoveryDb.getBySourceId).toHaveBeenCalledWith('ethercis-3020ad3c-8072-4b38-95f7-d8adbbbfb07a');
      expect(actual).toEqual(expected);
    });
  });
});
