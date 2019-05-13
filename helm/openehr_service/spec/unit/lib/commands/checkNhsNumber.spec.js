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

  11 May 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { BadRequestError } = require('@lib/errors');
const { Role } = require('@lib/shared/enums');
const CheckNhsNumberCommand = require('@lib/commands/checkNhsNumber');

describe('lib/commands/checkNhsNumber', () => {
  let ctx;
  let session;

  let statusService;
  let patientService;
  let phrFeedService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999111,
      email: 'john.doe@example.org'
    };

    statusService = ctx.services.statusService;
    patientService = ctx.services.patientService;
    phrFeedService = ctx.services.phrFeedService;

    ctx.services.freeze();
  });

  it('should throw invalid or missing patientId error', async () => {
    const patientId = 'foo';

    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = command.execute(patientId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return response when data still loading', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: true,
      responseNo: 2,
      nhsNumber: 9999999000
    };

    const state = {
      new_patient: true,
      requestNo: 2,
      status: 'loading_data'
    };
    statusService.check.and.returnValue(state);

    const patientId = 9999999000;
    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(statusService.check).toHaveBeenCalledWith(9999999000);
    expect(actual).toEqual(expected);
  });

  it('should return response when data loading finished', async () => {
    const expected = {
      status: 'ready',
      nhsNumber: 9999999000
    };

    const state = {
      new_patient: true,
      requestNo: 2,
      status: 'ready'
    };
    statusService.check.and.returnValue(state);

    const patientId = 9999999000;
    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(statusService.check).toHaveBeenCalledWith(9999999000);
    expect(actual).toEqual(expected);
  });

  it('should initiate loading data and return response', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: false,
      responseNo: 2,
      nhsNumber: 9999999000
    };

    statusService.check.and.returnValue();
    statusService.create.and.returnValue();
    patientService.check.and.returnValue({
      created: false
    });
    statusService.get.and.returnValue({
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 2
    });

    const patientId = 9999999000;
    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(statusService.check).toHaveBeenCalledWith(9999999000);
    expect(statusService.create).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 1
    });
    expect(patientService.check).toHaveBeenCalledWith('ethercis', 9999999000);
    expect(statusService.update).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: false,
      requestNo: 2
    });

    expect(actual).toEqual(expected);
  });

  it('should create standard feed when new patient', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: true,
      responseNo: 2,
      nhsNumber: 9999999000
    };

    statusService.check.and.returnValue();
    statusService.create.and.returnValue();
    patientService.check.and.returnValue({
      created: true
    });
    statusService.get.and.returnValue({
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 2
    });

    const patientId = 9999999000;
    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(statusService.check).toHaveBeenCalledWith(9999999000);
    expect(statusService.create).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 1
    });
    expect(patientService.check).toHaveBeenCalledWith('ethercis', 9999999000);
    expect(phrFeedService.create).toHaveBeenCalledWith(9999999000, {
      author: 'Helm PHR service',
      name: 'Leeds Live - Whats On',
      landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
      rssFeedUrl: 'https://www.leeds-live.co.uk/news/?service=rss'
    });
    expect(statusService.update).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: true,
      requestNo: 2
    });

    expect(actual).toEqual(expected);
  });

  it('should create standard feed when new patient (dummy)', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: true,
      responseNo: 2,
      nhsNumber: 9999999111
    };

    statusService.check.and.returnValue();
    statusService.create.and.returnValue();
    patientService.check.and.returnValue({
      created: true
    });
    statusService.get.and.returnValue({
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 2
    });

    const patientId = 'dummy';
    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(statusService.check).toHaveBeenCalledWith(9999999111);
    expect(statusService.create).toHaveBeenCalledWith(9999999111, {
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 1
    });
    expect(patientService.check).toHaveBeenCalledWith('ethercis', 9999999111);
    expect(phrFeedService.create).toHaveBeenCalledWith(9999999111, {
      author: 'Helm PHR service',
      name: 'Leeds Live - Whats On',
      landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
      rssFeedUrl: 'https://www.leeds-live.co.uk/news/?service=rss'
    });
    expect(statusService.update).toHaveBeenCalledWith(9999999111, {
      status: 'loading_data',
      new_patient: true,
      requestNo: 2
    });

    expect(actual).toEqual(expected);
  });

  it('should create standard feed when new patient (phr user)', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: true,
      responseNo: 2,
      nhsNumber: 9999999111
    };

    statusService.check.and.returnValue();
    statusService.create.and.returnValue();
    patientService.check.and.returnValue({
      created: true
    });
    statusService.get.and.returnValue({
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 2
    });

    session.role = Role.PHR_USER;

    const patientId = 9999999111;
    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(statusService.check).toHaveBeenCalledWith(9999999111);
    expect(statusService.create).toHaveBeenCalledWith(9999999111, {
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 1
    });
    expect(patientService.check).toHaveBeenCalledWith('ethercis', 9999999111);
    expect(phrFeedService.create).toHaveBeenCalledWith(9999999111, {
      author: 'Helm PHR service',
      name: 'Leeds Live - Whats On',
      landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
      rssFeedUrl: 'https://www.leeds-live.co.uk/news/?service=rss'
    });
    expect(statusService.update).toHaveBeenCalledWith(9999999111, {
      status: 'loading_data',
      new_patient: true,
      requestNo: 2
    });

    expect(actual).toEqual(expected);
  });
});
