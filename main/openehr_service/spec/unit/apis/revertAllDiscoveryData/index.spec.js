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

const mockery = require('mockery');
const { CommandMock, ExecutionContextMock } = require('@tests/mocks');

describe('apis/revertAllDiscoveryData', () => {
  let args;
  let finished;

  let command;
  let RevertAllDiscoveryDataCommand;

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
      req: {
        ctx: new ExecutionContextMock()
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    RevertAllDiscoveryDataCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../../lib/commands', { RevertAllDiscoveryDataCommand });

    delete require.cache[require.resolve('@apis/revertAllDiscoveryData')];
    handler = require('@apis/revertAllDiscoveryData');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    const responseObj = [
      {
        deleted: true,
        patientId: 9999999111,
        heading: 'procedures',
        compositionId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        host: 'ethercis'
      },
      {
        deleted: true,
        patientId: 9999999111,
        heading: 'problems',
        compositionId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76::vm01.ethercis.org::1',
        host: 'ethercis'
      }
    ];
    command.execute.and.resolveValue(responseObj);

    await handler(args, finished);

    expect(RevertAllDiscoveryDataCommand).toHaveBeenCalledWith(args.req.ctx);
    expect(command.execute).toHaveBeenCalledWith();

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should return error object', async () => {
    command.execute.and.rejectValue(new Error('custom error'));

    await handler(args, finished);

    expect(RevertAllDiscoveryDataCommand).toHaveBeenCalledWith(args.req.ctx);
    expect(command.execute).toHaveBeenCalledWith();

    expect(finished).toHaveBeenCalledWith({
      error: 'custom error'
    });
  });
});
