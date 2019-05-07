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

  17 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { BadRequestError } = require('@lib/errors');
const { Role } = require('@lib/shared/enums');
const { PostPatientTop3ThingsCommand } = require('@lib/commands');

describe('lib/commands/postPatientTop3Things', () => {
  let ctx;
  let session;
  let patientId;
  let payload;

  let top3ThingsService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      role: 'IDCR'
    };
    patientId = 9999999111;
    payload = {
      name1: 'foo1',
      description1: 'baz1',
      name2: 'foo2',
      description2: 'baz2',
      name3: 'foo3',
      description3: 'baz3'
    };

    top3ThingsService = ctx.services.top3ThingsService;
    top3ThingsService.create.and.returnValue('ce437b97-4f6e-4c96-89bb-0b58b29a79cb');

    ctx.services.freeze();
  });

  it('should throw invalid or missing patientId error', async () => {
    patientId = 'foo';

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = command.execute(patientId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should throw must specify at least 1 top thing error when name1 missed', async () => {
    delete payload.name1;

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = command.execute(patientId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('You must specify at least 1 Top Thing'));
  });

  it('should throw must specify at least 1 top thing error when description1 missed', async () => {
    delete payload.description1;

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = command.execute(patientId, payload);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('You must specify at least 1 Top Thing'));
  });

  it('should throw description for the 2nd top thing was defined but its summary name was not defined error', async () => {
    delete payload.name2;

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = command.execute(patientId, payload);

    await expectAsync(actual).toBeRejectedWith(
      new BadRequestError('A Description for the 2nd Top Thing was defined, but its summary name was not defined')
    );
  });

  it('should throw description for the 3rd top thing was defined but its summary name was not defined error', async () => {
    delete payload.name3;

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = command.execute(patientId, payload);

    await expectAsync(actual).toBeRejectedWith(
      new BadRequestError('A Description for the 3rd Top Thing was defined, but its summary name was not defined')
    );
  });

  it('should create top3 things', async () => {
    const expected = {
      sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
    };

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = await command.execute(patientId, payload);

    expect(top3ThingsService.create).toHaveBeenCalledWith(9999999111, {
      name1: 'foo1',
      description1: 'baz1',
      name2: 'foo2',
      description2: 'baz2',
      name3: 'foo3',
      description3: 'baz3'
    });
    expect(actual).toEqual(expected);
  });

  it('should post top3 things when 2nd thing is missed', async () => {
    const expected = {
      sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
    };

    delete payload.name2;
    delete payload.description2;

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = await command.execute(patientId, payload);

    expect(top3ThingsService.create).toHaveBeenCalledWith(9999999111, {
      name1: 'foo1',
      description1: 'baz1',
      name2: '',
      description2: '',
      name3: 'foo3',
      description3: 'baz3'
    });
    expect(actual).toEqual(expected);
  });

  it('should post top3 things when 3rd thing is missed', async () => {
    const expected = {
      sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
    };

    delete payload.name3;
    delete payload.description3;

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = await command.execute(patientId, payload);

    expect(top3ThingsService.create).toHaveBeenCalledWith(9999999111, {
      name1: 'foo1',
      description1: 'baz1',
      name2: 'foo2',
      description2: 'baz2',
      name3: '',
      description3: ''
    });
    expect(actual).toEqual(expected);
  });

  it('should create top3 things when user has phrUser role', async () => {
    const expected = {
      sourceId: 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb'
    };

    session.role = Role.PHR_USER;

    const command = new PostPatientTop3ThingsCommand(ctx, session);
    const actual = await command.execute(patientId, payload);

    expect(top3ThingsService.create).toHaveBeenCalledWith(9999999000, {
      name1: 'foo1',
      description1: 'baz1',
      name2: 'foo2',
      description2: 'baz2',
      name3: 'foo3',
      description3: 'baz3'
    });
    expect(actual).toEqual(expected);
  });
});
