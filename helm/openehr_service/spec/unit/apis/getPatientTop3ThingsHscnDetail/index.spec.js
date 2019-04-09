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

  10 April 2019

*/

'use strict';

const mockery = require('mockery');
const { ExecutionContext } = require('@lib/core');
const { CommandMock, Worker } = require('@tests/mocks');

describe('apis/getPatientTop3ThingsHscnDetail', () => {
  let q;
  let args;
  let finished;

  let command;
  let GetPatientTop3ThingsHscnDetailCommand;

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
    q = new Worker();
    args = {
      site: 'ltht',
      patientId: 9999999111,
      req: {
        headers: {
          authorization: 'AccessToken 5ebe2294ecd0e0f08eab7690d2a6ee69'
        }
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    GetPatientTop3ThingsHscnDetailCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../../lib/commands', { GetPatientTop3ThingsHscnDetailCommand });

    delete require.cache[require.resolve('@apis/getPatientTop3ThingsHscnDetail')];
    handler = require('@apis/getPatientTop3ThingsHscnDetail');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    const responseObj = [
      {
        source: 'QEWDDB',
        sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb',
        dateCreated: 1519851600000,
        name1: 'foo1',
        description1: 'baz1',
        name2: 'foo2',
        description2: 'baz2',
        name3: 'foo3',
        description3: 'baz3'
      }
    ];
    command.execute.and.resolveValue(responseObj);

    await handler.call(q, args, finished);

    expect(GetPatientTop3ThingsHscnDetailCommand).toHaveBeenCalledWith(jasmine.any((ExecutionContext)));
    expect(command.execute).toHaveBeenCalledWith(args.site, args.patientId, args.req.headers);

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should return error object', async () => {
    command.execute.and.rejectValue(new Error('custom error'));

    await handler.call(q, args, finished);

    expect(GetPatientTop3ThingsHscnDetailCommand).toHaveBeenCalledWith(jasmine.any((ExecutionContext)));
    expect(command.execute).toHaveBeenCalledWith(args.site, args.patientId, args.req.headers);

    expect(finished).toHaveBeenCalledWith({
      error: 'custom error'
    });
  });
});
