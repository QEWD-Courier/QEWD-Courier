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

const path = require('path');
const mockery = require('mockery');
const fs = require('fs-extra');
const fsMock = require('mock-fs');
const { Worker, rewritePaths } = require('@tests/mocks');

describe('utils/jumper/lib/processWebTemplate', () => {
  let processWebTemplate;

  let parseWebTemplate;
  let createFlatJSON;
  let createJSONSchema;
  let buildJSONFile;

  let q;
  let openehrConfig;
  let templateName;
  let headingPath;
  let body;
  let host;

  function resolvePath(file) {
    return path.join(headingPath, file);
  }

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

    rewritePaths(q);
    openehrConfig = q.userDefined.globalConfig.openehr;

    templateName = 'IDCR - Adverse Reaction List.v1';

    headingPath = path.join(openehrConfig.paths.jumper_templates, 'allergies');
    body = {
      uid: 'f473e2ed-7f0a-41c9-9ef6-01632fe6c78b',
      template_id: 'IDCR - Adverse Reaction List.v1',
      default_language: 'en'
    };

    host = 'ethercis';

    parseWebTemplate = jasmine.createSpy();
    mockery.registerMock('./parseWebTemplate', parseWebTemplate);

    createFlatJSON = jasmine.createSpy();
    mockery.registerMock('./createFlatJSON', createFlatJSON);

    createJSONSchema = jasmine.createSpy();
    mockery.registerMock('./createJSONSchema', createJSONSchema);

    buildJSONFile = jasmine.createSpy();
    mockery.registerMock('./buildJsonFile', buildJSONFile);

    delete require.cache[require.resolve('@jumper/processWebTemplate')];
    processWebTemplate = require('@jumper/processWebTemplate');

    fsMock({
      'spec/fixtures/templates/allergies': {}
    });
  });

  afterEach(() => {
    fsMock.restore();
    mockery.deregisterAll();
    q.db.reset();
  });

  it('should process web template', () => {

    const parsed = {
      template_name: 'Adverse reaction list',
      composition_name: 'openEHR-EHR-COMPOSITION.adverse_reaction_list.v1',
      metadata: [
        {
          id: 'last_updated',
          name: 'Last updated'
        }
      ]
    };
    const flatJSON = {
      'ctx/composer_name': 'Dr Tony Shannon',
      'ctx/health_care_facility|id': '999999-345'
    };


    parseWebTemplate.and.returnValue(parsed);
    createFlatJSON.and.returnValue(flatJSON);

    const actual = processWebTemplate.call(q, templateName, headingPath, body, host);

    expect(buildJSONFile).toHaveBeenCalledWithContext(q, body, headingPath, 'WebTemplate_ethercis.json');
    expect(parseWebTemplate).toHaveBeenCalledWith(body, 'ethercis');
    expect(createFlatJSON).toHaveBeenCalledWith(parsed.metadata);
    expect(createJSONSchema).toHaveBeenCalledWith(templateName, parsed.metadata, headingPath);

    const actualMetadata = fs.readJsonSync(resolvePath('metaData.json'));

    expect(actualMetadata).toEqual({
      template_name: 'Adverse reaction list',
      composition_name: 'openEHR-EHR-COMPOSITION.adverse_reaction_list.v1',
      metadata: [
        {
          id: 'last_updated',
          name: 'Last updated'
        }
      ]
    });


    const actualFlatJSON = fs.readJsonSync(resolvePath('flatJSON_template.json'));

    expect(actualFlatJSON).toEqual({
      'ctx/composer_name': 'Dr Tony Shannon',
      'ctx/health_care_facility|id': '999999-345'
    });



    expect(actual).toEqual({
      ok: true,
      template: 'IDCR - Adverse Reaction List.v1',
      flatJSON: {
        'ctx/composer_name': 'Dr Tony Shannon',
        'ctx/health_care_facility|id': '999999-345'
      },
      metadata: {
        template_name: 'Adverse reaction list',
        composition_name: 'openEHR-EHR-COMPOSITION.adverse_reaction_list.v1',
        metadata: [
          {
            id: 'last_updated',
            name: 'Last updated'
          }
        ]
      }
    });

  });
});
