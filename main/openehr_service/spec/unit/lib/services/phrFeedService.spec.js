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
const { uuidV4Regex } = require('@tests/helpers/utils');
const { NotFoundError } = require('@lib/errors');
const PhrFeedService = require('@lib/services/phrFeedService');

describe('lib/services/phrFeedService', () => {
  let ctx;
  let phrFeedService;

  let phrFeedDb;

  beforeEach(() => {
    const nowTime = Date.UTC(2019, 0, 1); // 1546300800000, now
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(nowTime));

    ctx = new ExecutionContextMock();
    phrFeedService = new PhrFeedService(ctx);

    phrFeedDb = ctx.db.phrFeedDb;

    ctx.freeze();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = PhrFeedService.create(ctx);

      expect(actual).toEqual(jasmine.any(PhrFeedService));
      expect(actual.ctx).toBe(ctx);
      expect(actual.phrFeedDb).toBe(phrFeedDb);
    });
  });

  describe('#getBySourceId', () => {
    it('should throw invalid sourceId error', () => {
      phrFeedDb.getBySourceId.and.returnValue();

      const sourceId = 'eaf394a9-5e05-49c0-9c69-c710c77eda76';

      expect(() => {
        phrFeedService.getBySourceId(sourceId);
      }).toThrow(new NotFoundError('Invalid sourceId'));

      expect(phrFeedDb.getBySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
    });

    it('should return feed', () => {
      const expected = {
        author: 'ivor.cox@phr.leeds.nhs',
        name: 'ABC News',
        landingPageUrl: 'https://www.abc.co.uk/news',
        rssFeedUrl: 'https://www.abc.co.uk/rss',
        nhsNumber: 9999999000,
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        dateCreated: 1483228800000 // Date.UTC(2017, 0, 1)
      };

      const dbData = {
        ...expected
      };
      phrFeedDb.getBySourceId.and.returnValue(dbData);

      const sourceId = 'eaf394a9-5e05-49c0-9c69-c710c77eda76';
      const actual = phrFeedService.getBySourceId(sourceId);

      expect(phrFeedDb.getBySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(actual).toEqual(expected);
    });
  });

  describe('#getByNhsNumber', () => {
    it('should return feeds', () => {
      const expected = [
        {
          landingPageUrl: 'https://www.nytimes.com/section/health',
          name: 'NYTimes.com',
          rssFeedUrl: 'http://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
          sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
        },
        {
          landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
          name: 'Leeds Live - Whats on',
          rssFeedUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/?service=rss',
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ];

      const dbData = [
        {
          author: 'bob.smith@gmail.com',
          dateCreated: 1527663973204,
          nhsNumber: 9999999000,
          landingPageUrl: 'https://www.nytimes.com/section/health',
          name: 'NYTimes.com',
          rssFeedUrl: 'http://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
          sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
        },
        {
          author: 'bob.smith@gmail.com',
          dateCreated: 1527605220395,
          nhsNumber: 9999999000,
          landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
          name: 'Leeds Live - Whats on',
          rssFeedUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/?service=rss',
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ];
      phrFeedDb.getByNhsNumber.and.returnValue(dbData);

      const nhsNumber = 9999999000;
      const actual = phrFeedService.getByNhsNumber(nhsNumber);

      expect(phrFeedDb.getByNhsNumber).toHaveBeenCalledWith(9999999000);
      expect(actual).toEqual(expected);
    });
  });

  describe('#create', () => {
    let feed;

    beforeEach(() => {
      feed = {
        author: 'bob.smith@gmail.com',
        nhsNumber: 9999999000,
        landingPageUrl: 'https://www.nytimes.com/section/health',
        name: 'NYTimes.com',
        rssFeedUrl: 'http://rss.nytimes.com/services/xml/rss/nyt/Health.xml'
      };
    });

    it('should return existing sourceId when there is a feed found by name', () => {
      const expected = '0f7192e9-168e-4dea-812a-3e1d236ae46d';

      const dbData = {
        sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      };
      phrFeedDb.getByName.and.returnValue(dbData);

      const nhsNumber = 9999999000;
      const actual = phrFeedService.create(nhsNumber, feed);

      expect(phrFeedDb.getByName).toHaveBeenCalledWith(9999999000, 'NYTimes.com');

      expect(actual).toEqual(expected);
    });

    it('should return existing sourceId when there is a feed found by landingPageUrl', () => {
      const expected = '0f7192e9-168e-4dea-812a-3e1d236ae46d';

      const dbData = {
        sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      };
      phrFeedDb.getByName.and.returnValue();
      phrFeedDb.getByLandingPageUrl.and.returnValue(dbData);

      const nhsNumber = 9999999000;
      const actual = phrFeedService.create(nhsNumber, feed);

      expect(phrFeedDb.getByName).toHaveBeenCalledWith(nhsNumber, 'NYTimes.com');
      expect(phrFeedDb.getByLandingPageUrl).toHaveBeenCalledWith(nhsNumber, 'https://www.nytimes.com/section/health');

      expect(actual).toEqual(expected);
    });

    it('should create feed and return new sourceId', () => {
      phrFeedDb.getByName.and.returnValue();
      phrFeedDb.getByLandingPageUrl.and.returnValue();

      const nhsNumber = 9999999000;
      const actual = phrFeedService.create(nhsNumber, feed);

      expect(phrFeedDb.getByName).toHaveBeenCalledWith(9999999000, 'NYTimes.com');
      expect(phrFeedDb.getByLandingPageUrl).toHaveBeenCalledWith(9999999000, 'https://www.nytimes.com/section/health');
      expect(phrFeedDb.insert).toHaveBeenCalledWith({
        author: 'bob.smith@gmail.com',
        nhsNumber: 9999999000,
        landingPageUrl: 'https://www.nytimes.com/section/health',
        name: 'NYTimes.com',
        rssFeedUrl: 'http://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
        sourceId: jasmine.stringMatching(uuidV4Regex),
        dateCreated: 1546300800000
      });

      expect(actual).toMatch(uuidV4Regex);
    });
  });

  describe('#update', () => {
    it('should update phr feed', () => {
      const sourceId = 'eaf394a9-5e05-49c0-9c69-c710c77eda76';
      const feed = {
        nhsNumber: 9999999000,
        email: 'ivor.cox@ripple.foundation',
        landingPageUrl: 'https://www.nytimes.com/section/health',
        name: 'NYTimes.com',
        rssFeedUrl: 'http://rss.nytimes.com/services/xml/rss/nyt/Health.xml'
      };

      const nhsNumber = 9999999000;
      phrFeedService.update(nhsNumber, sourceId, feed);

      expect(phrFeedDb.update).toHaveBeenCalledWith(
        'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        {
          nhsNumber: 9999999000,
          email: 'ivor.cox@ripple.foundation',
          landingPageUrl: 'https://www.nytimes.com/section/health',
          name: 'NYTimes.com',
          rssFeedUrl: 'http://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
          dateCreated: 1546300800000
        }
      );
    });
  });
});
