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
const { PutRespectFormVersionCommand } = require('@lib/commands');

describe('lib/commands/putRespectFormVersion', () => {
  let ctx;
  let session;

  let patientId;
  let sourceId;
  let version;
  let payload;

  let respectFormsService;
  let cacheService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      role: 'IDCR'
    };

    patientId = 9999999111;
    sourceId = 'ethercis-2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
    version = 5;
    payload = {
      foo: 'bar'
    };

    respectFormsService = ctx.services.respectFormsService;
    cacheService = ctx.services.cacheService;

    ctx.services.freeze();
  });

  it('should throw patientId is invalid', async () => {
    patientId = 'test';

    const command = new PutRespectFormVersionCommand(ctx, session);
    const actual = command.execute(patientId, sourceId, version, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId test is invalid'));
  });

  it('should return empty obj if sourceId is invalid', async () => {
    const expected = {};

    sourceId = 'foo';

    const command = new PutRespectFormVersionCommand(ctx, session);
    const actual = await command.execute(patientId, sourceId, version, payload);

    expect(actual).toEqual(expected);
  });

  it('should throw version was not defined error', async () => {
    version = '';

    const command = new PutRespectFormVersionCommand(ctx, session);
    const actual = command.execute(patientId, sourceId, version, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('version was not defined'));
  });

  it('should put respectforms, delete cache and return response', async () => {
    const expected = {
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7::vm01.ethercis.org::6'
    };

    respectFormsService.put.and.resolveValue({
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7::vm01.ethercis.org::6'
    });

    const command = new PutRespectFormVersionCommand(ctx, session);
    const actual = await command.execute(patientId, sourceId, version, payload);

    expect(respectFormsService.put).toHaveBeenCalledWith('ethercis', 'respectforms', 'ethercis-2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5, { foo: 'bar' });
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999111, 'respectforms');

    expect(actual).toEqual(expected);
  });

  it('should put respectforms, delete cache and return response (phr user)', async () => {
    const expected = {
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7::vm01.ethercis.org::6'
    };

    respectFormsService.put.and.resolveValue({
      ok: true,
      host: 'ethercis',
      heading: 'respectforms',
      compositionUid: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7::vm01.ethercis.org::6'
    });

    session.role = Role.PHR_USER;

    const command = new PutRespectFormVersionCommand(ctx, session);
    const actual = await command.execute(patientId, sourceId, version, payload);

    expect(respectFormsService.put).toHaveBeenCalledWith('ethercis', 'respectforms', 'ethercis-2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5, { foo: 'bar' });
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999000, 'respectforms');

    expect(actual).toEqual(expected);
  });
});
