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

const { ExecutionContextMock } = require('@tests/mocks');
const { GetHeadingDetailCommand } = require('@lib/commands');
const { Role } = require('@lib/shared/enums');
const { BadRequestError } = require('@lib/errors');

describe('ripple-cdr-lib/lib/commands/getHeadingDetailCommand', () => {
  let ctx;
  let session;

  let patientId;
  let heading;
  let sourceId;

  let resourceService;
  let headingService;

  function mockHeadingService(patientId) {
    const responseObj = {
      vaccinationName: 'Rotavirus',
      comment: 'Vaccination for 18 yrs old patient',
      series: 'Inactivated poliovirus',
      vaccinationDateTime: 1546400900000,
      author: 'Dr.House',
      dateCreated: 1546300800000,
      source: 'openEHR_to_Pulsetile.json',
      sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
      patientId: patientId
    };
    headingService.getBySourceId.and.returnValue(responseObj);
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      role : 'IDCR',
      nhsNumber: 9999999111
    };

    patientId = 5558526784;
    heading = 'vaccinations';
    sourceId = 'Discovery-eaf394a9-5e05-49c0-9c69-c710c77eda76';

    resourceService = ctx.services.resourceService;
    headingService = ctx.services.headingService;

    ctx.services.freeze();
  });

  it('should throw patientId is not valid error', async () => {
    patientId = 'foo';

    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return no results when invalid or missing heading error', async () => {
    const expected = {
      responseFrom: 'discovery_service',
      results: false
    };

    heading = 'foo';

    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(actual).toEqual(expected);
  });

  it('should return no results when sourceId is not valid error', async () => {
    const expected = {
      responseFrom: 'discovery_service',
      results: false
    };

    sourceId = 'bar';

    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(actual).toEqual(expected);
  });

  it('should return heading details data', async () => {
    const expected = {
      responseFrom: 'discovery_service',
      results: {
        vaccinationName: 'Rotavirus',
        comment: 'Vaccination for 18 yrs old patient',
        series: 'Inactivated poliovirus',
        vaccinationDateTime: 1546400900000,
        author: 'Dr.House',
        dateCreated: 1546300800000,
        source: 'openEHR_to_Pulsetile.json',
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        patientId: 5558526784
      }
    };

    mockHeadingService(patientId);

    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(resourceService.fetchPatients).toHaveBeenCalledWith(5558526784);
    expect(resourceService.fetchPatientResources).toHaveBeenCalledWith(5558526784, 'Immunization');
    expect(headingService.getBySourceId).toHaveBeenCalledWith(5558526784, 'vaccinations', 'Discovery-eaf394a9-5e05-49c0-9c69-c710c77eda76');

    expect(actual).toEqual(expected);
  });

  it('should return heading details data (phr user)', async () => {
    const expected = {
      responseFrom: 'discovery_service',
      results: {
        vaccinationName: 'Rotavirus',
        comment: 'Vaccination for 18 yrs old patient',
        series: 'Inactivated poliovirus',
        vaccinationDateTime: 1546400900000,
        author: 'Dr.House',
        dateCreated: 1546300800000,
        source: 'openEHR_to_Pulsetile.json',
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        patientId: 9999999111
      }
    };

    session.role = Role.PHR_USER;
    mockHeadingService(session.nhsNumber);

    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    expect(resourceService.fetchPatients).toHaveBeenCalledWith(9999999111);
    expect(resourceService.fetchPatientResources).toHaveBeenCalledWith(9999999111, 'Immunization');
    expect(headingService.getBySourceId).toHaveBeenCalledWith(9999999111, 'vaccinations', 'Discovery-eaf394a9-5e05-49c0-9c69-c710c77eda76');

    expect(actual).toEqual(expected);
  });
});
