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
const fs = require('fs-extra');
const mockery = require('mockery');
const { rewritePaths, Worker } = require('@tests/mocks');
const buildJSONFileFn = require('@jumper/buildJsonFile');

describe('utils/jumper/lib/buildInverse', () => {
  let q;

  let buildInverse;
  let buildJSONFile;
  let helpers;

  let sourceJSONFile;
  let inverseJSONFile;
  let jumperPath;

  function mockSourceJson(contentsObj) {
    buildJSONFileFn(contentsObj, jumperPath, sourceJSONFile);
  }

  function resetCache() {
    const sourceJSONFilePath = path.join(jumperPath, sourceJSONFile);
    delete require.cache[require.resolve(sourceJSONFilePath)];
  }

  beforeAll(() => {
    q = new Worker();

    mockery.enable({
      warnOnUnregistered: false
    });

    const { jumper_templates } = rewritePaths(q);

    sourceJSONFile = 'openEHR_to_FHIR.json';
    inverseJSONFile = 'FHIR_to_OpenEHR.json';
    jumperPath = path.join(jumper_templates, 'contacts/');

    fs.ensureDirSync(jumperPath);
    fs.chmodSync(jumperPath, '0777');
  });

  afterAll(() => {
    mockery.disable();

    fs.removeSync(jumperPath);
  });

  beforeEach(() => {
    helpers = {
      foo: jasmine.createSpy(),
      bar: jasmine.createSpy(),
      baz: jasmine.createSpy()
    };
    mockery.registerMock('qewd-ripple/lib/jumper', { helpers });

    buildJSONFile = jasmine.createSpy().and.callFake(buildJSONFileFn);
    mockery.registerMock('./buildJsonFile', buildJSONFile);

    delete require.cache[require.resolve('@jumper/buildInverse')];
    buildInverse = require('@jumper/buildInverse');
  });

  afterEach(() => {
    resetCache();
    mockery.deregisterAll();
  });

  it('should ignore keys with data values', () => {
    const expectedObj = {};

    const sourceObj = {
      identifier: [
        {
          system: 'quux'
        }
      ]
    };
    mockSourceJson(sourceObj);

    buildInverse(sourceJSONFile, inverseJSONFile, jumperPath);

    expect(buildJSONFile).toHaveBeenCalledWith(expectedObj, jumperPath, inverseJSONFile);
  });

  it('should inverse keys with {{prop}} values', () => {
    const expectedObj = {
      baz: '{{foo}}',
      patientName: '{{patient.display}}',
      uid: '{{identifier[0].value}}'
    };

    const sourceObj = {
      foo: '{{baz}}',
      patient: {
        display: '{{patientName}}'
      },
      identifier: [
        {
          value: '{{uid}}'
        }
      ]
    };
    mockSourceJson(sourceObj);

    buildInverse(sourceJSONFile, inverseJSONFile, jumperPath);

    expect(buildJSONFile).toHaveBeenCalledWith(expectedObj, jumperPath, inverseJSONFile);
  });

  it('should inverse keys with {{prop}} values and prefix', () => {
    const expectedObj = {
      composer: {
        code: '=> removePrefix(recorder.reference, \'Practitioner/\')'
      }
    };

    const sourceObj = {
      recorder: {
        reference: 'Practitioner/{{composer.code}}'
      }
    };
    mockSourceJson(sourceObj);

    buildInverse(sourceJSONFile, inverseJSONFile, jumperPath);

    expect(buildJSONFile).toHaveBeenCalledWith(expectedObj, jumperPath, inverseJSONFile);
  });

  it('should inverse keys starts with "=> fn"', () => {

    const expectedObj = {
      date_created: '=> foo(dateCreated,false)',
      date_modified: '=> bar(dateModified,true)',
      date_published: '=> baz(datePublished)'
    };


    const sourceObj = {
      dateCreated: '=> foo(date_created, true)',
      dateModified: '=> bar(date_modified, false)',
      datePublished: '=> baz(date_published)',
      dateDeleted: '=> quux(date_deleted)'
    };
    mockSourceJson(sourceObj);

    buildInverse(sourceJSONFile, inverseJSONFile, jumperPath);

    expect(buildJSONFile).toHaveBeenCalledWith(expectedObj, jumperPath, inverseJSONFile);
  });

  it('should inverse keys starts with "=> getDate"', () => {

    const expectedObj = {
      start_time: '=> getTime(dateCreated)'
    };


    const sourceObj = {
      dateCreated: '=> getDate(start_time)'
    };
    mockSourceJson(sourceObj);

    buildInverse(sourceJSONFile, inverseJSONFile, jumperPath);

    expect(buildJSONFile).toHaveBeenCalledWith(expectedObj, jumperPath, inverseJSONFile);
  });
});
