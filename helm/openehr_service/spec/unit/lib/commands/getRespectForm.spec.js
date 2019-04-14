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

  27 March 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { BadRequestError } = require('@lib/errors');
const { GetRespectFormCommand } = require('@lib/commands');

xdescribe('lib/commands/getRespectForm', () => {
  let ctx;

  let patientId;
  let sourceId;
  let version;

  let respectFormsService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    patientId = 9999999111;
    sourceId = '2d800bcb-4b17-4cd3-8ad0-e34a786158a7';
    version = 5;

    respectFormsService = ctx.services.respectFormsService;
    respectFormsService.validateGet.and.returnValue({ ok : true });
    respectFormsService.get.and.returnValue({
      version: 5,
      author: 'Tony Shannon',
      dateCreated: 1514808000000,
      status: 'foo',
      sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
      source: 'ethercis'
    });

    ctx.services.freeze();
  });

  it('should throw patientId was not defined error', async () => {
    patientId = '';

    const command = new GetRespectFormCommand(ctx);
    const actual = command.execute(patientId, sourceId, version);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId was not defined'));
  });

  it('should throw sourceId was not defined error', async () => {
    sourceId = '';

    const command = new GetRespectFormCommand(ctx);
    const actual = command.execute(patientId, sourceId, version);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('sourceId was not defined'));
  });

  it('should throw version was not defined error', async () => {
    version = '';

    const command = new GetRespectFormCommand(ctx);
    const actual = command.execute(patientId, sourceId, version);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('version was not defined'));
  });

  it('should throw validate get error', async () => {
    respectFormsService.validateGet.and.returnValue({
      error: 'custom error'
    });

    const command = new GetRespectFormCommand(ctx);
    const actual = command.execute(patientId, sourceId, version);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('custom error'));

    expect(respectFormsService.validateGet).toHaveBeenCalledWith(
      9999999111, '2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5
    );
  });

  it('should return respect form data', async () => {
    const expected = {
      respect_form: {
        version: 5,
        author: 'Tony Shannon',
        dateCreated: 1514808000000,
        status: 'foo',
        sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
        source: 'ethercis'
      }
    };

    const command = new GetRespectFormCommand(ctx);
    const actual = await command.execute(patientId, sourceId, version);

    expect(respectFormsService.validateGet).toHaveBeenCalledWith(9999999111, '2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5);
    expect(respectFormsService.get).toHaveBeenCalledWith('2d800bcb-4b17-4cd3-8ad0-e34a786158a7', 5);

    expect(actual).toEqual(expected);
  });
});
