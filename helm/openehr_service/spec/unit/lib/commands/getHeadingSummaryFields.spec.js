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
const { BadRequestError, ForbiddenError } = require('@lib/errors');
const { GetHeadingSummaryFieldsCommand } = require('@lib/commands');

describe('lib/commands/getHeadingSummaryFields', () => {
  let ctx;
  let session;
  let heading;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      userMode: 'admin'
    };
    heading = 'procedures';
  });

  it('should throw invalid request error', async () => {
    session.userMode = 'idcr';

    const command = new GetHeadingSummaryFieldsCommand(ctx, session);
    const actual = command.execute(heading);

    await expectAsync(actual).toBeRejectedWith(new ForbiddenError('Invalid request'));
  });

  it('should throw feeds records are not maintained error', async () => {
    heading = 'feeds';

    const command = new GetHeadingSummaryFieldsCommand(ctx, session);
    const actual = command.execute(heading);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('feeds records are not maintained on OpenEHR'));
  });

  it('should throw top3Things records are not maintained error', async () => {
    heading = 'top3Things';

    const command = new GetHeadingSummaryFieldsCommand(ctx, session);
    const actual = command.execute(heading);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('top3Things records are not maintained on OpenEHR'));
  });

  it('should throw invalid or missing heading error', async () => {
    heading = 'bar';

    const command = new GetHeadingSummaryFieldsCommand(ctx, session);
    const actual = command.execute(heading);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Invalid or missing heading: bar'));
  });

  it('should return summary heading fields from heading definition', async () => {
    const expected = ['name', 'date', 'time'];

    const command = new GetHeadingSummaryFieldsCommand(ctx, session);
    const actual = await command.execute(heading);

    expect(actual).toEqual(expected);
  });

  it('should return summary heading fields from config', async () => {
    const expected = ['vaccinationName', 'dateCreated'];

    heading = 'vaccinations';

    const command = new GetHeadingSummaryFieldsCommand(ctx, session);
    const actual = await command.execute(heading);

    expect(actual).toEqual(expected);
  });
});
