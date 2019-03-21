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
const { BadRequestError } = require('@lib/errors');
const { Role } = require('@lib/shared/enums');
const { GetPatientHeadingDetailCommand } = require('@lib/commands');

describe('lib/commands/getPatientHeadingDetail', () => {
  let ctx;
  let session;

  let patientId;
  let heading;
  let sourceId;

  let headingService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000
    };

    patientId = 9999999111;
    heading = 'procedures';
    sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';

    headingService = ctx.services.headingService;

    headingService.fetchOne.and.resolveValue({ ok: true });
    headingService.getBySourceId.and.resolveValue({ foo: 'bar' });

    ctx.services.freeze();
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new GetPatientHeadingDetailCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return empty array when heading has not yet been added to middle-tier processing', async () => {
    const expected = [];

    heading = 'bar';

    const command = new GetPatientHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(actual).toEqual(expected);
  });

  it('should return empty array when invalid sourceId', async () => {
    const expected = [];

    sourceId = 'foobar';

    const command = new GetPatientHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(actual).toEqual(expected);
  });

  it('should return empty array when no results could be returned from the OpenEHR servers for heading', async () => {
    const expected = [];

    const result = { ok: false };
    headingService.fetchOne.and.resolveValue(result);

    const command = new GetPatientHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');
    expect(actual).toEqual(expected);
  });

  it('should return details', async () => {
    const expected = {
      responseFrom: 'phr_service',
      api: 'getPatientHeadingDetail',
      use: 'results',
      results: {
        foo: 'bar'
      }
    };

    const command = new GetPatientHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');
    expect(headingService.getBySourceId).toHaveBeenCalledWith('ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76', 'detail');

    expect(actual).toEqual(expected);
  });

  it('should return details (PHR user)', async () => {
    const expected = {
      responseFrom: 'phr_service',
      api: 'getPatientHeadingDetail',
      use: 'results',
      results: {
        foo: 'bar'
      }
    };

    session.role = Role.PHR_USER;

    const command = new GetPatientHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999000, 'procedures');
    expect(headingService.getBySourceId).toHaveBeenCalledWith('ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76', 'detail');

    expect(actual).toEqual(expected);
  });
});
