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

const mockery = require('mockery');

describe('utils/jumper/lib/buildHeadingFHIRTemplate', () => {
  let buildHeadingFHIRTemplate;
  let buildJsonFile;
  let buildFHIRToOpenEHR;

  let fhirResourceName;
  let jumperPath;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    fhirResourceName = 'AllergyIntolerance';
    jumperPath = '/path/to/ripple-openehr-jumper/templates/allergies';

    buildJsonFile = jasmine.createSpy();
    mockery.registerMock('./buildJsonFile', buildJsonFile);

    buildFHIRToOpenEHR = jasmine.createSpy();
    mockery.registerMock('./buildFHIRToOpenEHR', buildFHIRToOpenEHR);

    delete require.cache[require.resolve('@jumper/buildHeadingFHIRTemplate')];
    buildHeadingFHIRTemplate = require('@jumper/buildHeadingFHIRTemplate');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should build json file', () => {
    const expectedText = {
      resourceType: 'AllergyIntolerance',
      identifier: [
        {
          system: 'http://ripple.foundation/sourceId',
          value: '{{uid}}'
        }
      ],
      onset: '=> rippleDateTime(start_time, false)',
      recordedDate: '=> rippleDateTime(start_time, false)',
      recorder: {
        reference: '=> fhirReference(composer.code, \'Practitioner\', false)',
        display: '{{composer.value}}'
      },
      patient: {
        reference: '=> fhirReference(patientId, \'Patient\', false)',
        display: '{{patientName}}'
      }
    };

    buildHeadingFHIRTemplate(fhirResourceName, jumperPath);

    expect(buildJsonFile).toHaveBeenCalledWith(expectedText, jumperPath,  'openEHR_to_FHIR.json');
  });

  it('should build inverse json file', () => {
    buildHeadingFHIRTemplate(fhirResourceName, jumperPath);
    expect(buildFHIRToOpenEHR).toHaveBeenCalledWith(jumperPath);
  });
});
