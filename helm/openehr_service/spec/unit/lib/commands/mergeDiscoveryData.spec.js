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

const { ExecutionContextMock } = require('@tests/mocks');
const { MergeDiscoveryDataCommand } = require('@lib/commands');

describe('lib/commands/mergeDiscoveryData', () => {
  let ctx;
  let session;

  let heading;
  let data;

  let statusService;
  let discoveryService;
  let cacheService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      email: 'john.doe@example.org'
    };

    heading = 'procedures';
    data = [
      {
        sourceId: '33a93da2-6677-42a0-8b39-9d1e012dde12'
      }
    ];

    statusService = ctx.services.statusService;
    discoveryService = ctx.services.discoveryService;
    cacheService = ctx.services.cacheService;

    discoveryService.mergeAll.and.resolveValue(false);

    ctx.services.freeze();
  });

  it('should return refresh needed when heading is finished', async () => {
    const expected = {
      refresh: true
    };

    heading = 'finished';

    statusService.get.and.resolveValue({
      status: 'loading_data',
      new_patient: true,
      requestNo: 2
    });

    const command = new MergeDiscoveryDataCommand(ctx, session);
    const actual = await command.execute(heading, data);

    expect(statusService.get).toHaveBeenCalled();
    expect(statusService.update).toHaveBeenCalledWith({
      status: 'ready',
      new_patient: true,
      requestNo: 2
    });

    expect(actual).toEqual(expected);
  });

  it('should return refresh not needed when no data items', async () => {
    const expected = {
      refresh: false
    };

    data = [];

    const command = new MergeDiscoveryDataCommand(ctx, session);
    const actual = await command.execute(heading, data);

    expect(actual).toEqual(expected);
  });

  it('should merge data and return refresh not needed', async () => {
    const expected = {
      refresh: false
    };

    const command = new MergeDiscoveryDataCommand(ctx, session);
    const actual = await command.execute(heading, data);

    expect(discoveryService.mergeAll).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures', data);
    expect(actual).toEqual(expected);
  });

  it('should merge data and return refresh needed', async () => {
    const expected = {
      refresh: true
    };

    discoveryService.mergeAll.and.resolveValue(true);

    const command = new MergeDiscoveryDataCommand(ctx, session);
    const actual = await command.execute(heading, data);

    expect(discoveryService.mergeAll).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures', data);
    expect(cacheService.delete).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures');

    expect(actual).toEqual(expected);
  });
});
