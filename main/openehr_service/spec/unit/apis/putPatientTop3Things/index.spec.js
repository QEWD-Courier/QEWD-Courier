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

describe('apis/putPatientTop3Things', () => {
  let args;
  let finished;

  let command;
  let PostPatientTop3ThingsCommand;

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
        ctx: new ExecutionContextMock(),
        body: {
          name1: 'foo1',
          description1: 'baz1',
          name2: 'foo2',
          description2: 'baz2',
          name3: 'foo3',
          description3: 'baz3'
        }
      },
      session: {
        nhsNumber: 9999999000,
        role: 'phrUser'
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    PostPatientTop3ThingsCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../../lib/commands', { PostPatientTop3ThingsCommand });

    delete require.cache[require.resolve('@apis/putPatientTop3Things')];
    handler = require('@apis/putPatientTop3Things');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    const responseObj = {
      sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
    };
    command.execute.and.resolveValue(responseObj);

    await handler(args, finished);

    expect(PostPatientTop3ThingsCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId, args.req.body);

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should return error object', async () => {
    command.execute.and.rejectValue(new Error('custom error'));

    await handler(args, finished);

    expect(PostPatientTop3ThingsCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId, args.req.body);

    expect(finished).toHaveBeenCalledWith({
      error: 'custom error'
    });
  });
});
