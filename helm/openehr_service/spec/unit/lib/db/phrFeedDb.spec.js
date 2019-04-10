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

  9 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const PhrFeedDb = require('@lib/db/phrFeedDb');

describe('lib/db/phrFeedDb', () => {
  let ctx;
  let phrFeedDb;
  let phrFeeds;

  function seeds() {
    [
      {
        sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        nhsNumber: 9999999000,
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/'
      },
      {
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        nhsNumber: 9999999000,
        name: 'CNN News',
        landingPageUrl: 'https://www.cnn.com/top-news/'
      },
      {
        sourceId: '0f903095-f038-49a4-ac84-77cc273bc343',
        nhsNumber: 9999999111,
        name: 'Abc news',
        landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
      }
    ].forEach(x => {
      phrFeeds.$(['by_nhsNumber', x.nhsNumber, x.sourceId]).value = '';
      phrFeeds.$(['bySourceId', x.sourceId]).setDocument(x);
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    phrFeedDb = new PhrFeedDb(ctx);

    phrFeeds = ctx.worker.db.use('PHRFeeds');
    seeds();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = PhrFeedDb.create(ctx);

      expect(actual).toEqual(jasmine.any(PhrFeedDb));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getBySourceId', () => {
    it('should return null', async () => {
      const expected = null;

      const sourceId = 'foo';
      const actual = phrFeedDb.getBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = {
        sourceId: '0f903095-f038-49a4-ac84-77cc273bc343',
        nhsNumber: 9999999111,
        name: 'Abc news',
        landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
      };

      const sourceId = '0f903095-f038-49a4-ac84-77cc273bc343';
      const actual = phrFeedDb.getBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getByName', () => {
    it('should return null', async () => {
      const expected = null;

      const nhsNumber = 9999999111;
      const name = 'foo';
      const actual = phrFeedDb.getByName(nhsNumber, name);

      expect(actual).toEqual(expected);
    });

    it('should return null (unknown nhsNumber)', async () => {
      const expected = null;

      const nhsNumber = 9999999222;
      const name = 'foo';
      const actual = phrFeedDb.getByName(nhsNumber, name);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = {
        sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        nhsNumber: 9999999000,
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/'
      };

      const nhsNumber = 9999999000;
      const name = 'Leeds Live - Whats On';
      const actual = phrFeedDb.getByName(nhsNumber, name);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getByLandingPageUrl', () => {
    it('should return null', async () => {
      const expected = null;

      const nhsNumber = 9999999000;
      const landingPageUrl = 'https://www.quux.co.uk/baz1/baz2';
      const actual = phrFeedDb.getByLandingPageUrl(nhsNumber, landingPageUrl);

      expect(actual).toEqual(expected);
    });

    it('should return null (unknown nhsNumber)', async () => {
      const expected = null;

      const nhsNumber = 9999999222;
      const landingPageUrl = 'https://www.quux.co.uk/baz1/baz2';
      const actual = phrFeedDb.getByLandingPageUrl(nhsNumber, landingPageUrl);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = {
        sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        nhsNumber: 9999999000,
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/'
      };

      const nhsNumber = 9999999000;
      const landingPageUrl = 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/';
      const actual = phrFeedDb.getByLandingPageUrl(nhsNumber, landingPageUrl);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getByNhsNumber', () => {
    it('should return empty (unknown nhsNumber)', async () => {
      const expected = [];

      const nhsNumber = 9999999222;
      const actual = phrFeedDb.getByNhsNumber(nhsNumber);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = [
        {
          nhsNumber: 9999999000,
          landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
          name: 'Leeds Live - Whats On',
          sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6'
         },
         {
           nhsNumber: 9999999000,
           landingPageUrl: 'https://www.cnn.com/top-news/',
           name: 'CNN News',
           sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
         }
      ];

      const nhsNumber = 9999999000;
      const actual = phrFeedDb.getByNhsNumber(nhsNumber);

      expect(actual).toEqual(expected);
    });

    describe('name duplications', () => {
      beforeEach(() => {
        phrFeeds.$(['by_nhsNumber', 9999999111, '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).value = '';
        phrFeeds.$(['bySourceId', '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).setDocument({
          sourceId: '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8',
          nhsNumber: 9999999111,
          name: 'Abc news',
          landingPageUrl: 'https://www.xyz.co.uk/foo/bar/'
        });
      });

      it('should delete duplications found by name', async () => {
        const expected = [
          {
            sourceId: '0f903095-f038-49a4-ac84-77cc273bc343',
            nhsNumber: 9999999111,
            name: 'Abc news',
            landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
          }
        ];

        const nhsNumber = 9999999111;
        const actual = phrFeedDb.getByNhsNumber(nhsNumber);

        expect(actual).toEqual(expected);
      });
    });

    describe('landingPageUrl duplications', () => {
      beforeEach(() => {
        phrFeeds.$(['by_nhsNumber', 9999999111, '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).value = '';
        phrFeeds.$(['bySourceId', '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).setDocument({
          sourceId: '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8',
          nhsNumber: 9999999111,
          name: 'Xyz news',
          landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
        });
      });

      it('should delete duplications found by landing page url', async () => {
        const expected = [
          {
            sourceId: '0f903095-f038-49a4-ac84-77cc273bc343',
            nhsNumber: 9999999111,
            name: 'Abc news',
            landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
          }
        ];

        const nhsNumber = 9999999111;
        const actual = phrFeedDb.getByNhsNumber(nhsNumber);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('#insert', () => {
    it('should insert new db record', async () => {
      const data = {
        nhsNumber: 9999999000,
        sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      };

      phrFeedDb.insert(data);

      const byNhsNumber = phrFeeds.$(['by_nhsNumber', 9999999000, '0f7192e9-168e-4dea-812a-3e1d236ae46d']);
      expect(byNhsNumber.value).toEqual('');

      const bySourceId = phrFeeds.$(['bySourceId', '0f7192e9-168e-4dea-812a-3e1d236ae46d']);
      expect(bySourceId.getDocument()).toEqual({
        nhsNumber: 9999999000,
        sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      });
    });
  });

  describe('#update', () => {
    it('should update / replace existing db record', async () => {
      const data = {
        nhsNumber: 9999999000,
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        foo: 'bar'
      };

      phrFeedDb.update(data.sourceId, data);

      const bySourceId = phrFeeds.$(['bySourceId', '260a7be5-e00f-4b1e-ad58-27d95604d010']);
      expect(bySourceId.getDocument()).toEqual({
        nhsNumber: 9999999000,
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        foo: 'bar'
      });
    });
  });
});

