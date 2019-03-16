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
const { RevertAllDiscoveryDataCommand } = require('@lib/commands');

describe('lib/commands/revertAllDiscoveryData', () => {
  let ctx;

  let discoveryService;
  let headingService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    discoveryService = ctx.services.discoveryService;
    headingService = ctx.services.headingService;

    discoveryService.getAllSourceIds.and.resolveValue(
      [
        'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76'
      ]
    );
    discoveryService.getBySourceId.and.resolveValues(
      {
        patientId: 9999999000,
        heading: 'problems',
        discovery: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      },
      {
        patientId: 9999999111,
        heading: 'procedures',
        discovery: '260a7be5-e00f-4b1e-ad58-27d95604d010'
      }
    );
    headingService.delete.and.resolveValues(
      {
        deleted: true,
        patientId: 9999999000,
        heading: 'problems',
        compositionId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        host: 'ethercis'
      },
      {
        deleted: true,
        patientId: 9999999111,
        heading: 'procedures',
        compositionId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76::vm01.ethercis.org::1',
        host: 'ethercis'
      }
    );

    ctx.services.freeze();
  });

  it('should revert all discovery data', async () => {
    const expected = [
      {
        deleted: true,
        patientId: 9999999000,
        heading: 'problems',
        compositionId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        host: 'ethercis'
      },
      {
        deleted: true,
        patientId: 9999999111,
        heading: 'procedures',
        compositionId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76::vm01.ethercis.org::1',
        host: 'ethercis'
      }
    ];

    const command = new RevertAllDiscoveryDataCommand(ctx);
    const actual = await command.execute();

    expect(discoveryService.getAllSourceIds).toHaveBeenCalled();

    expect(discoveryService.getBySourceId).toHaveBeenCalledTimes(2);
    expect(discoveryService.getBySourceId.calls.argsFor(0)).toEqual(['ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6']);
    expect(discoveryService.getBySourceId.calls.argsFor(1)).toEqual(['ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76']);

    expect(headingService.delete).toHaveBeenCalledTimes(2);
    expect(headingService.delete.calls.argsFor(0)).toEqual(
      [9999999000, 'problems', 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6']
    );
    expect(headingService.delete.calls.argsFor(1)).toEqual(
      [9999999111, 'procedures', 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76']
    );

    expect(discoveryService.delete).toHaveBeenCalledTimes(2);
    expect(discoveryService.delete.calls.argsFor(0)).toEqual(['0f7192e9-168e-4dea-812a-3e1d236ae46d']);
    expect(discoveryService.delete.calls.argsFor(1)).toEqual(['260a7be5-e00f-4b1e-ad58-27d95604d010']);

    expect(actual).toEqual(expected);
  });
});
