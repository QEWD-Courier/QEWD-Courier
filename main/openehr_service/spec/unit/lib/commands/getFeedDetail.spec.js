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
const { GetFeedDetailCommand } = require('@lib/commands');

describe('lib/commands/getFeedDetail', () => {
  let ctx;
  let sourceId;
  let phrFeedService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    sourceId = 'eaf394a9-5e05-49c0-9c69-c710c77eda76';
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

    const command = new GetFeedDetailCommand(ctx);
    const actual = command.execute(sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Missing or empty sourceId'));
  });

  it('should throw invalid sourceId error', async () => {
    phrFeedService.getBySourceId.and.throwError(new NotFoundError('Invalid sourceId'));

    const command = new GetFeedDetailCommand(ctx);
    const actual = command.execute(sourceId);

    await expectAsync(actual).toBeRejectedWith(new NotFoundError('Invalid sourceId'));
  });

  it('should return feed', async () => {
    const expected = {
      feed: {
        author: 'ivor.cox@phr.leeds.nhs',
        name: 'ABC News',
        landingPageUrl: 'https://www.abc.co.uk/news',
        rssFeedUrl: 'https://www.abc.co.uk/rss',
        nhsNumber: 9999999000,
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        dateCreated: 1483228800000
      }
    };

    const command = new GetFeedDetailCommand(ctx);
    const actual = await command.execute(sourceId);

    expect(phrFeedService.getBySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');

    expect(actual).toEqual(expected);
  });
});
