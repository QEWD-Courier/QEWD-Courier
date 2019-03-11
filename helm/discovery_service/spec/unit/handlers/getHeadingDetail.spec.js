/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  11 February 2019

*/

'use strict';

const mockery = require('mockery');
const { ExecutionContextMock, CommandMock } = require('@tests/mocks');

xdescribe('ripple-cdr-lib/lib/handlers/getHeadingDetail', () => {
  let args;
  let finished;
  let command;

  let handler;
  let GetHeadingDetailCommand;

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
      heading: 'procedures',
      patientId: 9999999000,
      sourceId: 'Discovery-MedicationStatement/eaf394a9-5e05-49c0-9c69-c710c77eda76',
      req: {
        ctx: new ExecutionContextMock(),
      },
      session: {
        nhsNumber: 9999999000,
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    GetHeadingDetailCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../commands', { GetHeadingDetailCommand });

    delete require.cache[require.resolve('@lib/handlers/getHeadingDetail')];
    handler = require('@lib/handlers/getHeadingDetail');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should call handler and return response object', async () => {
    const responseObj = {
      responseFrom: 'discovery_service',
      results: false
    };
    command.execute.and.resolveValue(responseObj);
    await handler(args, finished);

    expect(GetHeadingDetailCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId, args.heading, args.sourceId);
    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should call handler with error', async () => {
    command.execute.and.rejectValue(new Error('Some unknown error'));

    await handler(args, finished);

    expect(GetHeadingDetailCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.patientId, args.heading, args.sourceId);

    expect(finished).toHaveBeenCalledWith({
      error: 'Some unknown error'
    });
  });

});
