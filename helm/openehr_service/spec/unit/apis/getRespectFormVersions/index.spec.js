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

const mockery = require('mockery');
const { CommandMock, ExecutionContextMock } = require('@tests/mocks');

describe('apis/getRespectFormVersions', () => {
  let args;
  let finished;

  let command;
  let GetRespectFormVersionsCommand;

  let handler;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    args = {
      patientId: 9999999111,
      req: {
        ctx: new ExecutionContextMock()
      },
      session: {
        nhsNumber: 9999999000,
        role: 'phrUser'
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    GetRespectFormVersionsCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../../lib/commands', { GetRespectFormVersionsCommand });

    delete require.cache[require.resolve('@apis/getRespectFormVersions')];
    handler = require('@apis/getRespectFormVersions');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    const responseObj = [
      {
        api: 'getRespectFormVersions',
        use: 'results',
        results: [
          {
            version: 1,
            author: 'Tony Shannon',
            dateCreated: 1514808000000,
            status: 'foo',
            sourceId: '2d800bcb-4b17-4cd3-8ad0-e34a786158a7',
            source: 'ethercis'
          }
        ]
      }
    ];

    command.execute.and.resolveValue(responseObj);

    await handler(args, finished);

    expect(GetRespectFormVersionsCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId);

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should return error object', async () => {
    command.execute.and.rejectValue(new Error('custom error'));

    await handler(args, finished);

    expect(GetRespectFormVersionsCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId);

    expect(finished).toHaveBeenCalledWith({
      error: 'custom error'
    });
  });
});
