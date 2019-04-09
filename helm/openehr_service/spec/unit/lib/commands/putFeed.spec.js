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
const { BadRequestError, NotFoundError } = require('@lib/errors');
const { PutFeedCommand } = require('@lib/commands');

describe('lib/commands/putFeed', () => {
  let ctx;
  let session;
  let sourceId;
  let payload;

  let phrFeedService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      email: 'john.doe@example.org'
    };

    sourceId = 'eaf394a9-5e05-49c0-9c69-c710c77eda76';
    payload = {
      author: 'ivor.cox@phr.leeds.nhs',
      name: 'BBC News',
      landingPageUrl: 'https://www.bbc.co.uk/news',
      rssFeedUrl: 'https://www.bbc.co.uk/rss'
    };

    phrFeedService = ctx.services.phrFeedService;

    phrFeedService.getBySourceId.and.returnValue({
      author: 'ivor.cox@phr.leeds.nhs',
      name: 'ABC News',
      landingPageUrl: 'https://www.abc.co.uk/news',
      rssFeedUrl: 'https://www.abc.co.uk/rss',
      nhsNumber: 9999999000,
      sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
      dateCreated: 1483228800000 // Date.UTC(2017, 0, 1)
    });

    ctx.services.freeze();
  });

  it('should throw missing or empty sourceId error', async () => {
    sourceId = '';

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Missing or empty sourceId'));
  });

  it('should throw invalid sourceId error', async () => {
    phrFeedService.getBySourceId.and.throwError(new NotFoundError('Invalid sourceId'));

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new NotFoundError('Invalid sourceId'));
  });

  it('should throw author missing or empty error', async () => {
    delete payload.author;

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Author missing or empty'));
  });

  it('should throw feed name missing or empty error', async () => {
    delete payload.name;

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Feed name missing or empty'));
  });

  it('should throw landing page URL missing or empty error', async () => {
    delete payload.landingPageUrl;

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Landing page URL missing or empty'));
  });

  it('should throw landing page URL is invalid error', async () => {
    payload.landingPageUrl = 'foo';

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Landing page URL is invalid'));
  });

  it('should throw RSS Feed URL missing or empty error', async () => {
    delete payload.rssFeedUrl;

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('RSS Feed URL missing or empty'));
  });

  it('should throw RSS Feed URL is invalid error', async () => {
    payload.rssFeedUrl = 'foo';

    const command = new PutFeedCommand(ctx, session);
    const actual = command.execute(sourceId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('RSS Feed URL is invalid'));
  });

  it('should update feed and return response', async () => {
    const expected = {
      sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
    };

    const command = new PutFeedCommand(ctx, session);
    const actual = await command.execute(sourceId, payload);

    expect(phrFeedService.update).toHaveBeenCalledWith(9999999000, 'eaf394a9-5e05-49c0-9c69-c710c77eda76', {
      author: 'ivor.cox@phr.leeds.nhs',
      name: 'BBC News',
      landingPageUrl: 'https://www.bbc.co.uk/news',
      rssFeedUrl: 'https://www.bbc.co.uk/rss'
    });

    expect(actual).toEqual(expected);
  });
});
