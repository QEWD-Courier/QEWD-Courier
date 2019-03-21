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
const DiscoveryDb = require('@lib/db/discoveryDb');

describe('lib/db/discoveryDb', () => {
  let ctx;
  let discoveryDb;
  let discoveryMap;

  function seeds() {
    [
      {
        sourceId: 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        data: {
          discovery: 'discovery-33a93da2-6677-42a0-8b39-9d1e012dde12',
          openehr: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
          patientId: 9999999000,
          heading: 'procedures'
        }
      },
      {
        sourceId: 'ethercis-260a7be5-e00f-4b1e-ad58-27d95604d010',
        data: {
          discovery: 'discovery-74b6a24b-bd97-47f0-ac6f-a632d0cac60f',
          openehr: '260a7be5-e00f-4b1e-ad58-27d95604d010::vm01.ethercis.org::1',
          patientId: 9999999000,
          heading: 'problems'
        }
      }
    ].forEach(x => {
      discoveryMap.$(['by_discovery_sourceId', x.data.discovery]).value = x.sourceId;
      discoveryMap.$(['by_openehr_sourceId', x.sourceId]).setDocument(x.data);
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    discoveryDb = new DiscoveryDb(ctx);

    discoveryMap = ctx.worker.db.use('DiscoveryMap');
    seeds();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = DiscoveryDb.create(ctx);

      expect(actual).toEqual(jasmine.any(DiscoveryDb));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getSourceIdByDiscoverySourceId', () => {
    it('should return null', async () => {
      const expected = null;

      const discoverySourceId = 'foo';
      const actual = discoveryDb.getSourceIdByDiscoverySourceId(discoverySourceId);

      expect(actual).toEqual(expected);
    });

    it('should return source id by discovery source id', async () => {
      const expected = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';

      const discoverySourceId = 'discovery-33a93da2-6677-42a0-8b39-9d1e012dde12';
      const actual = discoveryDb.getSourceIdByDiscoverySourceId(discoverySourceId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getBySourceId', () => {
    it('should return null', async () => {
      const expected = null;

      const sourceId = 'foo';
      const actual = discoveryDb.getBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });

    it('should return data by source id', async () => {
      const expected = {
        discovery: 'discovery-33a93da2-6677-42a0-8b39-9d1e012dde12',
        openehr: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        patientId: 9999999000,
        heading: 'procedures'
      };

      const sourceId = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';
      const actual = discoveryDb.getBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#checkBySourceId', () => {
    it('should return false', async () => {
      const expected = false;

      const sourceId = 'foo';
      const actual = discoveryDb.checkBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });

    it('should return true', async () => {
      const expected = true;

      const sourceId = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';
      const actual = discoveryDb.checkBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getAllSourceIds', () => {
    it('should return all source ids', async () => {
      const expected = [
        'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        'ethercis-260a7be5-e00f-4b1e-ad58-27d95604d010'
      ];

      const actual = discoveryDb.getAllSourceIds();

      expect(actual).toEqual(expected);
    });
  });

  describe('#getSourceIds', () => {
    it('should return source ids by filter', async () => {
      const expected = [
        'ethercis-260a7be5-e00f-4b1e-ad58-27d95604d010'
      ];

      const filter = (x) => x.heading  === 'problems';
      const actual = discoveryDb.getSourceIds(filter);

      expect(actual).toEqual(expected);
    });
  });

  describe('#insert', () => {
    it('should insert new discovery data', async () => {
      const discoverySourceId = 'discovery-ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        discovery: 'discovery-ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
        openehr: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        patientId: 9999999000,
        heading: 'procedures'
      };

      discoveryDb.insert(discoverySourceId, sourceId, data);

      const byDiscoverySourceId = discoveryMap.$(['by_discovery_sourceId', 'discovery-ce437b97-4f6e-4c96-89bb-0b58b29a79cb']);
      expect(byDiscoverySourceId.value).toEqual('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

      const byOpenehrSourceId = discoveryMap.$(['by_openehr_sourceId', 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d']);
      expect(byOpenehrSourceId.getDocument()).toEqual({
        discovery: 'discovery-ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
        openehr: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        patientId: 9999999000,
        heading: 'procedures'
      });
    });
  });

  describe('#delete', () => {
    it('should delete existing discovery data', async () => {
      const discoverySourceId = 'discovery-33a93da2-6677-42a0-8b39-9d1e012dde12';
      const sourceId = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';

      discoveryDb.delete(discoverySourceId, sourceId);

      const byDiscoverySourceId = discoveryMap.$(['by_discovery_sourceId', 'discovery-33a93da2-6677-42a0-8b39-9d1e012dde12']);
      expect(byDiscoverySourceId.exists).toBeFalsy();

      const byOpenehrSourceId = discoveryMap.$(['by_openehr_sourceId', 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6']);
      expect(byOpenehrSourceId.exists).toBeFalsy();
    });
  });
});

