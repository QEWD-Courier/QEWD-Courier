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

  22 December 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../../mocks');
const { BadRequestError } = require('../../../../lib/errors');
const { Role } = require('../../../../lib/shared/enums');
const { GetPatientSynopsisCommand } = require('../../../../lib/commands/patients');

describe('ripple-cdr-openehr/lib/commands/patients/getSynopsis', () => {
  let ctx;
  let session;

  let patientId;
  let query;

  let headingService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      role: 'admin'
    };

    patientId = 9999999111;
    query = {};

    headingService = ctx.services.headingService;

    headingService.fetchMany.and.resolveValue({ ok: true });
    headingService.getSynopses.and.resolveValue({
      procedures: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        }
      ],
      vaccinations: [
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    });

    ctx.services.freeze();
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new GetPatientSynopsisCommand(ctx, session);
    const actual = command.execute(patientId, query);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return patient heading synopsis (synopsis config maximum)', async () => {
    const expected = {
      procedures: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        }
      ],
      vaccinations: [
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    };

    const command = new GetPatientSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, query);

    expect(headingService.fetchMany).toHaveBeenCalledWith(9999999111, ['procedures', 'vaccinations']);
    expect(headingService.getSynopses).toHaveBeenCalledWith(9999999111, ['procedures', 'vaccinations'], 2);

    expect(actual).toEqual(expected);
  });

  it('should return patient heading synopsis (synopsis config maximum)', async () => {
    const expected = {
      procedures: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        }
      ],
      vaccinations: [
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    };

    query.maximum = 5;

    const command = new GetPatientSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, query);

    expect(headingService.fetchMany).toHaveBeenCalledWith(9999999111, ['procedures', 'vaccinations']);
    expect(headingService.getSynopses).toHaveBeenCalledWith(9999999111, ['procedures', 'vaccinations'], 5);

    expect(actual).toEqual(expected);
  });

  it('should return patient heading synopsis (phr user)', async () => {
    const expected = {
      procedures: [
        {
          sourceId: 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be',
          source: 'ethercis',
          text: 'quux'
        }
      ],
      vaccinations: [
        {
          sourceId: 'marand-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'marand',
          text: 'quux'
        }
      ]
    };

    session.role = Role.PHR_USER;

    const command = new GetPatientSynopsisCommand(ctx, session);
    const actual = await command.execute(patientId, query);

    expect(headingService.fetchMany).toHaveBeenCalledWith(9999999000, ['procedures', 'vaccinations']);
    expect(headingService.getSynopses).toHaveBeenCalledWith(9999999000, ['procedures', 'vaccinations'], 2);

    expect(actual).toEqual(expected);
  });
});
