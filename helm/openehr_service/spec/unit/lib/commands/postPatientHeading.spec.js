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
const { PostPatientHeadingCommand } = require('@lib/commands');

describe('lib/commands/postPatientHeading', () => {
  let ctx;
  let session;

  let patientId;
  let heading;
  let query;
  let payload;

  let headingService;
  let cacheService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      userMode: 'admin',
      nhsNumber: 9999999000
    };

    patientId = 9999999111;
    heading = 'procedures';
    query = {
      format: 'openehr-jumper'
    };
    payload = {
      foo: 'bar'
    };

    headingService = ctx.services.headingService;
    cacheService = ctx.services.cacheService;
    ctx.services.freeze();

    headingService.post.and.resolveValue({
      ok: true,
      host: 'ethercis',
      heading: 'procedures',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    });

    ctx.services.freeze();
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new PostPatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, query, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should throw invalid or missing heading error', async () => {
    heading = 'bar';

    const command = new PostPatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, query, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Invalid or missing heading: bar'));
  });

  it('should throw no body content was posted for heading error', async () => {
    payload = {};

    const command = new PostPatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, query, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('No body content was posted for heading procedures'));
  });

  it('should post patient heading, delete cache and return response (openehr-jumper)', async () => {
    const expected = {
      ok: true,
      host: 'ethercis',
      heading: 'procedures',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    };

    const command = new PostPatientHeadingCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query, payload);

    expect(headingService.post).toHaveBeenCalledWith('ethercis', 9999999111, 'procedures', {
      data: {
        foo: 'bar'
      },
      format: 'openehr-jumper'
    });
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999111, 'procedures');

    expect(actual).toEqual(expected);
  });

  it('should post patient heading, delete cache and return response (pulsetile)', async () => {
    const expected = {
      ok: true,
      host: 'ethercis',
      heading: 'procedures',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    };

    query = {};

    const command = new PostPatientHeadingCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query, payload);

    expect(headingService.post).toHaveBeenCalledWith('ethercis', 9999999111, 'procedures', {
      data: {
        foo: 'bar'
      },
      format: 'pulsetile'
    });
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999111, 'procedures');

    expect(actual).toEqual(expected);
  });

  it('should post patient heading, delete cache and return response (PHR users)', async () => {
    const expected = {
      ok: true,
      host: 'ethercis',
      heading: 'procedures',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    };

    session.role = Role.PHR_USER;

    const command = new PostPatientHeadingCommand(ctx, session);
    const actual = await command.execute(patientId, heading, query, payload);

    expect(headingService.post).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures', {
      data: {
        foo: 'bar'
      },
      format: 'openehr-jumper'
    });
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures');

    expect(actual).toEqual(expected);
  });
});
