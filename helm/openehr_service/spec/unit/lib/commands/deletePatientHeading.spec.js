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
const { BadRequestError, ForbiddenError } = require('@lib/errors');
const { DeletePatientHeadingCommand } = require('@lib/commands');

describe('lib/commands/deletePatientHeading', () => {
  let ctx;
  let session;

  let patientId;
  let heading;
  let sourceId;

  let headingService;
  let discoveryService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      userMode: 'admin'
    };

    patientId = 9999999111;
    heading = 'procedures';
    sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';

    headingService = ctx.services.headingService;
    discoveryService = ctx.services.discoveryService;

    headingService.delete.and.resolveValue({
      deleted: true,
      patientId: 9999999111,
      heading: 'procedures',
      compositionId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
      host: 'ethercis'
    });

    ctx.services.freeze();
  });

  it('should throw invalid request error', async () => {
    delete session.userMode;

    const command = new DeletePatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new ForbiddenError('Invalid request'));
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new DeletePatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should throw cannot delete feeds records error', async () => {
    heading = 'feeds';

    const command = new DeletePatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Cannot delete feeds records'));
  });

  it('should throw cannot delete top3Things records error', async () => {
    heading = 'top3Things';

    const command = new DeletePatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Cannot delete top3Things records'));
  });

  it('should throw invalid or missing heading error', async () => {
    heading = 'bar';

    const command = new DeletePatientHeadingCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Invalid or missing heading: bar'));
  });

  it('should delete patient heading and return response', async () => {
    const expected = {
      deleted: true,
      patientId: 9999999111,
      heading: 'procedures',
      compositionId: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
      host: 'ethercis'
    };

    const command = new DeletePatientHeadingCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(headingService.fetchOne).toHaveBeenCalledWith(9999999111, 'procedures');
    expect(headingService.delete).toHaveBeenCalledWith(9999999111, 'procedures', 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76');
    expect(discoveryService.delete).toHaveBeenCalledWith('ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76');

    expect(actual).toEqual(expected);
  });
});
