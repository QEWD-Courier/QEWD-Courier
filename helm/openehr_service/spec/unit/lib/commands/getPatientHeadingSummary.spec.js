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
const { Role } = require('@lib/shared/enums');
const { GetPatientHeadingSummaryCommand } = require('@lib/commands');

describe('lib/commands/getPatientHeadingSummary', () => {
  let ctx;
  let session;

  let patientId;
  let heading;
  let query;

  let headingService;

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

    headingService.fetchOne.and.resolveValue({ ok: true });
    headingService.getSummary.and.resolveValue({
      results: [
        {
          desc: 'foo',
          source: 'ethercis',
          sourceId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
        },
        {
          desc: 'bar',
          source: 'marand',
          sourceId: '41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4'
        }
      ],
      fetchCount: 8
    });

    ctx.services.freeze();
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new GetPatientHeadingSummaryCommand(ctx, session);
    const actual = command.execute(patientId, heading, query);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return empty array when heading has not yet been added to middle-tier processing', async () => {
    const expected = [];

    heading = 'bar';

    const command = new GetPatientHeadingSummaryCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(actual).toEqual(expected);
  });

  it('should return empty array when no results could be returned from the OpenEHR servers for heading', async () => {
    const expected = [];

    headingService.fetchOne.and.resolveValue({ ok: false });

    const command = new GetPatientHeadingSummaryCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');

    expect(actual).toEqual(expected);
  });

  it('should return patient heading summary', async () => {
    const expected = {
      responseFrom: 'phr_service',
      api: 'getPatientHeadingSummary',
      use: 'results',
      patientId: 9999999111,
      heading: 'procedures',
      fetch_count: 8,
      results: [
        {
          desc: 'foo',
          source: 'ethercis',
          sourceId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
        },
        {
          desc: 'bar',
          source: 'marand',
          sourceId: '41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4'
        }
      ]
    };

    const command = new GetPatientHeadingSummaryCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');
    expect(headingService.getSummary).toHaveBeenCalledWith(9999999111, 'procedures');

    expect(actual).toEqual(expected);
  });

  it('should return patient heading summary (phr user)', async () => {
    const expected = {
      responseFrom: 'phr_service',
      api: 'getPatientHeadingSummary',
      use: 'results',
      patientId: 9999999000,
      heading: 'procedures',
      fetch_count: 8,
      results: [
        {
          desc: 'foo',
          source: 'ethercis',
          sourceId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
        },
        {
          desc: 'bar',
          source: 'marand',
          sourceId: '41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4'
        }
      ]
    };

    session.role = Role.PHR_USER;

    const command = new GetPatientHeadingSummaryCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999000, 'procedures');
    expect(headingService.getSummary).toHaveBeenCalledWith(9999999000, 'procedures');

    expect(actual).toEqual(expected);
  });
});
