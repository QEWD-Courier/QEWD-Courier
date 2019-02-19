/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  25 January 2019

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const PhrFeedDb = require('../../../lib/db/phrFeedDb');

describe('ripple-cdr-openehr/lib/db/phrFeedDb', () => {
  let ctx;
  let phrFeedDb;
  let phrFeeds;

  function seeds() {
    [
      {
        sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        email: 'john.doe@example.org',
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/'
      },
      {
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        email: 'john.doe@example.org',
        name: 'CNN News',
        landingPageUrl: 'https://www.cnn.com/top-news/'
      },
      {
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        email: 'jane.doe@example.org',
        name: 'Abc news',
        landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
      }
    ].forEach(x => {
      phrFeeds.$(['byEmail', x.email, x.sourceId]).value = 'true';
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
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        email: 'jane.doe@example.org',
        name: 'Abc news',
        landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
      };

      const sourceId = '260a7be5-e00f-4b1e-ad58-27d95604d010';
      const actual = phrFeedDb.getBySourceId(sourceId);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getByName', () => {
    it('should return null', async () => {
      const expected = null;

      const email = 'john.doe@example.org';
      const name = 'foo';
      const actual = phrFeedDb.getByName(email, name);

      expect(actual).toEqual(expected);
    });

    it('should return null (unknown email)', async () => {
      const expected = null;

      const email = 'quux@example.org';
      const name = 'foo';
      const actual = phrFeedDb.getByName(email, name);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = {
        sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        email: 'john.doe@example.org',
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/'
      };

      const email = 'john.doe@example.org';
      const name = 'Leeds Live - Whats On';
      const actual = phrFeedDb.getByName(email, name);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getByLandingPageUrl', () => {
    it('should return null', async () => {
      const expected = null;

      const email = 'john.doe@example.org';
      const landingPageUrl = 'https://www.quux.co.uk/baz1/baz2';
      const actual = phrFeedDb.getByLandingPageUrl(email, landingPageUrl);

      expect(actual).toEqual(expected);
    });

    it('should return null (unknown email)', async () => {
      const expected = null;

      const email = 'foo@example.org';
      const landingPageUrl = 'https://www.quux.co.uk/baz1/baz2';
      const actual = phrFeedDb.getByLandingPageUrl(email, landingPageUrl);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = {
        sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        email: 'john.doe@example.org',
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/'
      };

      const email = 'john.doe@example.org';
      const landingPageUrl = 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/';
      const actual = phrFeedDb.getByLandingPageUrl(email, landingPageUrl);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getByEmail', () => {
    it('should return empty (unknown email)', async () => {
      const expected = [];

      const email = 'quux@example.org';
      const actual = phrFeedDb.getByEmail(email);

      expect(actual).toEqual(expected);
    });

    it('should return data', async () => {
      const expected = [
        {
          email: 'john.doe@example.org',
          landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
          name: 'Leeds Live - Whats On',
          sourceId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6'
         },
         {
           email: 'jane.doe@example.org',
           landingPageUrl: 'https://www.abc.co.uk/foo/bar/',
           name: 'Abc news',
           sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
         }
      ];

      const email = 'john.doe@example.org';
      const actual = phrFeedDb.getByEmail(email);

      expect(actual).toEqual(expected);
    });

    describe('name duplications', () => {
      beforeEach(() => {
        phrFeeds.$(['byEmail', 'jane.doe@example.org', '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).value = 'true';
        phrFeeds.$(['bySourceId', '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).setDocument({
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
          email: 'jane.doe@example.org',
          name: 'Abc news',
          landingPageUrl: 'https://www.xyz.co.uk/foo/bar/'
        });
      });

      it('should delete duplications found by name', async () => {
        const expected = [
          {
            sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
            email: 'jane.doe@example.org',
            name: 'Abc news',
            landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
          }
        ];

        const email = 'jane.doe@example.org';
        const actual = phrFeedDb.getByEmail(email);

        expect(actual).toEqual(expected);
      });
    });

    describe('landingPageUrl duplications', () => {
      beforeEach(() => {
        phrFeeds.$(['byEmail', 'jane.doe@example.org', '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).value = 'true';
        phrFeeds.$(['bySourceId', '2f1bcc58-c29e-414f-bff9-2d0ea24ed3f8']).setDocument({
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
          email: 'jane.doe@example.org',
          name: 'Xyz news',
          landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
        });
      });

      it('should delete duplications found by landing page url', async () => {
        const expected = [
          {
            sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
            email: 'jane.doe@example.org',
            name: 'Abc news',
            landingPageUrl: 'https://www.abc.co.uk/foo/bar/'
          }
        ];

        const email = 'jane.doe@example.org';
        const actual = phrFeedDb.getByEmail(email);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('#insert', () => {
    it('should insert new db record', async () => {
      const data = {
        email: 'john.doe@example.org',
        sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      };

      phrFeedDb.insert(data);

      const byEmail = phrFeeds.$(['byEmail', 'john.doe@example.org', '0f7192e9-168e-4dea-812a-3e1d236ae46d']);
      expect(byEmail.value).toEqual(true);

      const bySourceId = phrFeeds.$(['bySourceId', '0f7192e9-168e-4dea-812a-3e1d236ae46d']);
      expect(bySourceId.getDocument()).toEqual({
        email: 'john.doe@example.org',
        sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      });
    });
  });

  describe('#update', () => {
    it('should update / replace existing db record', async () => {
      const data = {
        email: 'john.doe@example.org',
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        foo: 'bar'
      };

      phrFeedDb.update(data.sourceId, data);

      const bySourceId = phrFeeds.$(['bySourceId', '260a7be5-e00f-4b1e-ad58-27d95604d010']);
      expect(bySourceId.getDocument()).toEqual({
        email: 'john.doe@example.org',
        sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
        foo: 'bar'
      });
    });
  });
});

