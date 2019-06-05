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
const { GetRespectFormVersionsCommand } = require('@lib/commands');

describe('lib/commands/getRespectFormVersions', () => {
  let ctx;
  let session;

  let patientId;

  let respectFormsService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      role: 'IDCR'
    };

    patientId = 9999999111;

    respectFormsService = ctx.services.respectFormsService;

    ctx.services.freeze();
  });

  it('should throw patientId is invalid error', async () => {
    patientId = 'test';

    const command = new GetRespectFormVersionsCommand(ctx, session);
    const actual = command.execute(patientId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId test is invalid'));
  });

  it('should return empty when no results from openehr', async () => {
    const expected = [];

    respectFormsService.fetchOne.and.resolveValue({ ok: false });

    const command = new GetRespectFormVersionsCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(respectFormsService.fetchOne).toHaveBeenCalledWith(9999999111);
    expect(actual).toEqual(expected);
  });

  it('should return respect form versions', async () => {
    const expected = {
      api: 'getRespectFormVersions',
      use: 'results',
      results: [
        {
          version: 5,
          author: 'Tony Shannon',
          dateCreated: 1514808000000,
          status: 'foo',
          sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
          source: 'ethercis'
        }
      ]
    };

    respectFormsService.fetchOne.and.resolveValue({ ok: true });
    respectFormsService.getSummary.and.resolveValue({
      results: [
        {
          version: 5,
          author: 'Tony Shannon',
          dateCreated: 1514808000000,
          status: 'foo',
          sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
          source: 'ethercis'
        }
      ]
    });

    const command = new GetRespectFormVersionsCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(respectFormsService.fetchOne).toHaveBeenCalledWith(9999999111);
    expect(respectFormsService.getSummary).toHaveBeenCalledWith(9999999111);

    expect(actual).toEqual(expected);
  });

  it('should return respect form versions (phr user)', async () => {
    const expected = {
      api: 'getRespectFormVersions',
      use: 'results',
      results: [
        {
          version: 5,
          author: 'Tony Shannon',
          dateCreated: 1514808000000,
          status: 'foo',
          sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
          source: 'ethercis'
        }
      ]
    };

    respectFormsService.fetchOne.and.resolveValue({ ok: true });
    respectFormsService.getSummary.and.resolveValue({
      results: [
        {
          version: 5,
          author: 'Tony Shannon',
          dateCreated: 1514808000000,
          status: 'foo',
          sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
          source: 'ethercis'
        }
      ]
    });

    session.role = Role.PHR_USER;

    const command = new GetRespectFormVersionsCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(respectFormsService.fetchOne).toHaveBeenCalledWith(9999999000);
    expect(respectFormsService.getSummary).toHaveBeenCalledWith(9999999000);

    expect(actual).toEqual(expected);
  });
});
