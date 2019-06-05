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

  17 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { BadRequestError } = require('@lib/errors');
const { Role, Heading } = require('@lib/shared/enums');
const { GetPatientHeadingSynopsisCommand } = require('@lib/commands');

describe('lib/commands/getPatientHeadingSynopsis', () => {
  let ctx;
  let session;

  let patientId;
  let heading;
  let query;

  let headingService;
  let top3ThingsService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      role: 'IDCR'
    };

    patientId = 9999999111;
    heading = 'procedures';
    query = {};

    headingService = ctx.services.headingService;
    top3ThingsService = ctx.services.top3ThingsService;

    headingService.fetchOne.and.resolveValue({ ok: true });
    headingService.getSynopsis.and.resolveValue({
      results: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        },
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    });

    top3ThingsService.getLatestSynopsisByPatientId.and.returnValue([
      {
        sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
        text: 'foo1'
      },
      {
        sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
        text: 'foo2'
      },
      {
        sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
        text: 'foo3'
      }
    ]);

    ctx.services.freeze();
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = command.execute(patientId, heading, query);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return heading missing or empty error', async () => {
    heading = '';

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = command.execute(patientId, heading, query);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Heading missing or empty'));
  });

  xit('should return patient top3things synopsis', async () => {
    const expected = {
      heading: 'top3Things',
      synopsis: [
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo1'
        },
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo2'
        },
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo3'
        }
      ]
    };


    heading = Heading.TOP_3_THINGS;

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(top3ThingsService.getLatestSynopsisByPatientId).toHaveBeenCalledWith(9999999111);
    expect(actual).toEqual(expected);
  });

  xit('should return patient top3things synopsis (phr user)', async () => {
    const expected = {
      heading: 'top3Things',
      synopsis: [
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo1'
        },
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo2'
        },
        {
          sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
          text: 'foo3'
        }
      ]
    };

    session.role = Role.PHR_USER;
    heading = Heading.TOP_3_THINGS;

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(top3ThingsService.getLatestSynopsisByPatientId).toHaveBeenCalledWith(9999999000);
    expect(actual).toEqual(expected);
  });

  it('should return empty array when invalid or missing heading error', async () => {
    const expected = [];

    heading = 'bar';

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(actual).toEqual(expected);
  });

  it('should return empty array when no results could be returned from the OpenEHR servers for heading', async () => {
    const expected = [];

    headingService.fetchOne.and.resolveValue({ ok: false });

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');

    expect(actual).toEqual(expected);
  });

  it('should return patient heading synopsis (synopsis config maximum)', async () => {
    const expected = {
      heading: 'procedures',
      synopsis: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        },
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    };

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');
    expect(headingService.getSynopsis).toHaveBeenCalledWith(9999999111, 'procedures', 2);

    expect(actual).toEqual(expected);
  });

  it('should return patient heading synopsis (query maximum)', async () => {
    const expected = {
      heading: 'procedures',
      synopsis: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        },
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    };

    query.maximum = 5;

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');
    expect(headingService.getSynopsis).toHaveBeenCalledWith(9999999111, 'procedures', 5);

    expect(actual).toEqual(expected);
  });

  it('should return patient heading synopsis (phr user)', async () => {
    const expected = {
      heading: 'procedures',
      synopsis: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        },
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    };

    session.role = Role.PHR_USER;

    const command = new GetPatientHeadingSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999000, 'procedures');
    expect(headingService.getSynopsis).toHaveBeenCalledWith(9999999000, 'procedures', 2);

    expect(actual).toEqual(expected);
  });
});
