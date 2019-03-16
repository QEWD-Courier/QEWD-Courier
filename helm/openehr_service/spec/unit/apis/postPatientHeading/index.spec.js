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

describe('apis/postPatientHeading', () => {
  let args;
  let finished;

  let command;
  let PostPatientHeadingCommand;

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
      heading: 'procedures',
      req: {
        ctx: new ExecutionContextMock(),
        query: {
          format: 'openehr-jumper'
        },
        body: {
          foo: 'bar'
        }
      },
      session: {
        nhsNumber: 9999999000,
        email: 'john.doe@example.org'
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    PostPatientHeadingCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../../lib/commands', { PostPatientHeadingCommand });

    delete require.cache[require.resolve('@apis/postPatientHeading')];
    handler = require('@apis/postPatientHeading');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    const responseObj = {
      ok: true,
      host: 'ethercis',
      heading: 'procedures',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    };
    command.execute.and.resolveValue(responseObj);

    await handler(args, finished);

    expect(PostPatientHeadingCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId, args.heading, args.req.query, args.req.body);

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should pass empty query when query is not defined', async () => {
    delete args.req.query;

    const responseObj = {
      ok: true,
      host: 'ethercis',
      heading: 'procedures',
      compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
    };
    command.execute.and.resolveValue(responseObj);

    await handler(args, finished);

    expect(PostPatientHeadingCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId, args.heading, {}, args.req.body);

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should return error object', async () => {
    command.execute.and.rejectValue(new Error('custom error'));

    await handler(args, finished);

    expect(PostPatientHeadingCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId, args.heading, args.req.query, args.req.body);

    expect(finished).toHaveBeenCalledWith({
      error: 'custom error'
    });
  });
});
