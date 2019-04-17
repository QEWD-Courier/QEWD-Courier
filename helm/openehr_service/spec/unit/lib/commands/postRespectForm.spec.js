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
const { PostRespectFormCommand } = require('@lib/commands');

describe('lib/commands/postRespectForm', () => {
  let ctx;
  let session;

  let patientId;

  let cacheService;
  let headingService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      role: 'IDCR'
    };

    patientId = 9999999111;

    cacheService = ctx.services.cacheService;
    headingService = ctx.services.headingService;

    ctx.services.freeze();
  });

  it('should throw patientId is invalid', async () => {
    patientId = 'test';

    const command = new PostRespectFormCommand(ctx, session);
    const actual = command.execute(patientId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId test is invalid'));
  });

  it('should post respectforms, delete cache and return response', async () => {
    const expected = {
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    };

    headingService.post.and.resolveValue({
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    });

    const command = new PostRespectFormCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(headingService.post).toHaveBeenCalledWith('ethercis', 9999999111, 'respectforms', { data: {}, format: 'pulsetile' });
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999111, 'respectforms');

    expect(actual).toEqual(expected);
  });

  it('should post respectforms, delete cache and return response (phr user)', async () => {
    const expected = {
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    };

    headingService.post.and.resolveValue({
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    });

    session.role = Role.PHR_USER;

    const command = new PostRespectFormCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(headingService.post).toHaveBeenCalledWith('ethercis', 9999999000, 'respectforms', { data: {}, format: 'pulsetile' });
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999000, 'respectforms');

    expect(actual).toEqual(expected);
  });
});
