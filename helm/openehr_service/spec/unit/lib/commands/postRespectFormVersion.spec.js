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

  26 March 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { BadRequestError } = require('@lib/errors');
const { PostRespectFormVersionCommand } = require('@lib/commands');

describe('lib/commands/postRespectFormVersion', () => {
  let ctx;

  let patientId;
  let sourceId;
  let data;

  let respectFormVersionService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    patientId = 9999999111;
    sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
    data = {
      foo: 'bar'
    };

    respectFormVersionService = ctx.services.respectFormVersionService;
    respectFormVersionService.getByPatientId.and.returnValue([
      {
        version: 5,
        author: 'Tony Shannon',
        dateCreated: 1514808000000,
        status: 'foo',
        sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
        source: 'ethercis'
      }
    ]);

    ctx.services.freeze();
  });

  it('should throw patientId was not defined error', async () => {
    patientId = '';

    const command = new PostRespectFormVersionCommand(ctx);
    const actual = command.execute(patientId, sourceId, data);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId was not defined'));
  });

  it('should throw sourceId was not defined error', async () => {
    sourceId = '';

    const command = new PostRespectFormVersionCommand(ctx);
    const actual = command.execute(patientId, sourceId, data);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('sourceId was not defined'));
  });

  it('should create new respect form version 2', async () => {
    const command = new PostRespectFormVersionCommand(ctx);
    await command.execute(patientId, sourceId, data);

    expect(respectFormVersionService.create2).toHaveBeenCalledWith(
      9999999111,  '2d800bcb-4b17-4cd3-8ad0-e34a786158a7', { foo: 'bar' }
    );
  });

  it('should return all respect form versions', async () => {
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

    const command = new PostRespectFormVersionCommand(ctx);
    const actual = await command.execute(patientId, sourceId, data);

    expect(respectFormVersionService.getByPatientId).toHaveBeenCalledWith(9999999111);
    expect(actual).toEqual(expected);
  });
});
