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

  12 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { BadRequestError, ForbiddenError } = require('@lib/errors');
const { GetPatientTop3ThingsHscnDetailCommand } = require('@lib/commands');

describe('lib/commands/top3Things/getPatientTop3ThingsHscnDetail', () => {
  let ctx;
  let site;
  let patientId;
  let headers;

  let openidRestService;
  let top3ThingsService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    site = 'ltht';
    patientId = 9999999111;
    headers = {
      authorization: 'AccessToken quux'
    };

    openidRestService = ctx.services.openidRestService;
    openidRestService.getTokenIntrospection.and.resolveValue({
      active: true
    });

    top3ThingsService = ctx.services.top3ThingsService;
    top3ThingsService.getLatestDetailByPatientId.and.resolveValue({
      source: 'QEWDDB',
      sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
      dateCreated: 1519851600000,
      name1: 'foo1',
      description1: 'baz1',
      name2: 'foo2',
      description2: 'baz2',
      name3: 'foo3',
      description3: 'baz3'
    });

    ctx.services.freeze();
  });

  it('should throw invalid site error', async () => {
    site = 'foo';

    const command = new GetPatientTop3ThingsHscnDetailCommand(ctx);
    const actual = command.execute(site, patientId, headers);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Invalid site'));
  });

  it('should throw invalid request error', async () => {
    openidRestService.getTokenIntrospection.and.resolveValue({});

    const command = new GetPatientTop3ThingsHscnDetailCommand(ctx);
    const actual = command.execute(site, patientId, headers);

    await expectAsync(actual).toBeRejectedWith(new ForbiddenError('Invalid request'));

    expect(openidRestService.getTokenIntrospection).toHaveBeenCalledWith('quux', 'eHh4eHh4Onl5eXl5eXl5eXk=');
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new GetPatientTop3ThingsHscnDetailCommand(ctx);
    const actual = command.execute(site, patientId, headers);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));

    expect(openidRestService.getTokenIntrospection).toHaveBeenCalledWith('quux', 'eHh4eHh4Onl5eXl5eXl5eXk=');
  });

  xit('should return latest top 3 things detail', async () => {
    const expected = {
      source: 'QEWDDB',
      sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
      dateCreated: 1519851600000,
      name1: 'foo1',
      description1: 'baz1',
      name2: 'foo2',
      description2: 'baz2',
      name3: 'foo3',
      description3: 'baz3'
    };

    const command = new GetPatientTop3ThingsHscnDetailCommand(ctx);
    const actual = await command.execute(site, patientId, headers);

    expect(openidRestService.getTokenIntrospection).toHaveBeenCalledWith('quux', 'eHh4eHh4Onl5eXl5eXl5eXk=');
    expect(top3ThingsService.getLatestDetailByPatientId).toHaveBeenCalledWith(9999999111);
    expect(actual).toEqual(expected);
  });
});
