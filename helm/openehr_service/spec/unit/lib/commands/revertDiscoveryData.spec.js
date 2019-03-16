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
const { RevertDiscoveryDataCommand } = require('@lib/commands');

describe('lib/commands/revertDiscoveryData', () => {
  let ctx;

  let patientId;
  let heading;

  let discoveryService;
  let headingService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    patientId = 9999999000;
    heading = 'vaccinations';

    discoveryService = ctx.services.discoveryService;
    headingService = ctx.services.headingService;

    discoveryService.getSourceIds.and.resolveValue(
      [
        'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6'
      ]
    );
    discoveryService.getBySourceId.and.resolveValue(
      {
        patientId: 9999999000,
        heading: 'vaccinations',
        discovery: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      }
    );
    headingService.delete.and.resolveValue(
      {
        deleted: true,
        patientId: 9999999000,
        heading: 'vaccinations',
        compositionId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        host: 'ethercis'
      }
    );

    ctx.services.freeze();
  });

  describe('#execute', () => {
    it('should revert discovery data', async () => {
      const expected = [
        {
          deleted: true,
          patientId: 9999999000,
          heading: 'vaccinations',
          compositionId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
          host: 'ethercis'
        }
      ];

      const command = new RevertDiscoveryDataCommand(ctx);

      const filter = jasmine.createSpy();
      spyOn(command, 'createFilter').and.returnValue(filter);

      const actual = await command.execute(patientId, heading);

      expect(command.createFilter).toHaveBeenCalledWith(9999999000, 'vaccinations');
      expect(discoveryService.getSourceIds).toHaveBeenCalledWith(filter);
      expect(discoveryService.getBySourceId).toHaveBeenCalledWith('ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6');
      expect(headingService.delete).toHaveBeenCalledWith(
        9999999000, 'vaccinations', 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6'
      );
      expect(discoveryService.delete).toHaveBeenCalledWith('0f7192e9-168e-4dea-812a-3e1d236ae46d');

      expect(actual).toEqual(expected);
    });
  });

  describe('#createFilter', () => {
    it('should filter data by patientId and heading', () => {
      const expected = [
        {
          patientId: 9999999000,
          heading: 'vaccinations'
        }
      ];

      const data = [
        {
          patientId: 9999999000,
          heading: 'vaccinations'
        },
        {
          patientId: 9999999111,
          heading: 'vaccinations'
        },
        {
          patientId: 9999999000,
          heading: 'problems'
        }
      ];

      const command = new RevertDiscoveryDataCommand(ctx);
      const filter = command.createFilter(patientId, heading);
      const actual = data.filter(filter);

      expect(actual).toEqual(expected);
    });
  });
});
