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
const StatMode = require('stat-mode');
const { Worker, rewritePaths } = require('@tests/mocks');
const buildJSONFileFn = require('@jumper/buildJsonFile');

describe('utils/jumper/lib/jumper', () => {
  let jumper;
  let buildHeadingFHIRTemplate;
  let buildHeadingRippleTemplate;
  let buildJSONFile;

  let q;
  let openehrConfig;

  function validateNoBuildRun() {
    expect(buildHeadingRippleTemplate).not.toHaveBeenCalled();
    expect(buildHeadingFHIRTemplate).not.toHaveBeenCalled();
    expect(buildJSONFile).not.toHaveBeenCalled();
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

    buildHeadingFHIRTemplate = jasmine.createSpy();
    mockery.registerMock('./buildHeadingFHIRTemplate', buildHeadingFHIRTemplate);

    buildHeadingRippleTemplate = jasmine.createSpy();
    mockery.registerMock('./buildHeadingRippleTemplate', buildHeadingRippleTemplate);

    buildJSONFile = jasmine.createSpy().and.callFake(buildJSONFileFn);
    mockery.registerMock('./buildJsonFile', buildJSONFile);

    delete require.cache[require.resolve('@jumper/jumper')];
    jumper = require('@jumper/jumper');
  });

  afterEach(() => {
    mockery.deregisterAll();
    q.db.reset();
  });

  describe('#build', () => {
    let headings;

    beforeEach(() => {
      headings = {
        problems: {
          template: {
            name: 'IDCR - Problem List.v1'
          }
        }
      };
    });

    afterEach(() => {
      fsMock.restore();
    });

    it('should not create template folder for heading when no template defined', () => {
      headings = {
        procedures: true
      };

      jumper.build.call(q, headings);


      const fp = path.join(openehrConfig.paths.jumper_templates, 'procedures');
      const actual = fs.existsSync(fp);


      validateNoBuildRun();
      expect(actual).toBeFalsy();
    });

    it('should rebuild heading when template folder is not created', () => {
      fsMock();

      jumper.build.call(q, headings);


      const headingPath = path.join(openehrConfig.paths.jumper_templates, 'problems');
      const statusJson = {status: 'locked'};


      expect(buildHeadingRippleTemplate).toHaveBeenCalledWith(headingPath);
      expect(buildHeadingFHIRTemplate).not.toHaveBeenCalled();
      expect(buildJSONFile).toHaveBeenCalledWithContext(q, statusJson, headingPath, 'headingStatus.json');

      const stat = new StatMode(fs.statSync(headingPath));
      expect(stat.toString()).toBe('drwxrwxrwx');
    });

    it('should not rebuild heading when heading status is "locked"', () => {
      headings = {
        allergies: {
          template: {
            name: 'IDCR - Adverse Reaction List.v1'
          }
        }
      };

      jumper.build.call(q, headings);

      validateNoBuildRun();
    });

    it('should rebuild heading when heading status is not created', () => {
      fsMock({
        'spec/templates/problems': {}
      });

      jumper.build.call(q, headings);


      const headingPath = path.join(openehrConfig.paths.jumper_templates, 'problems');
      const statusJson = {status: 'locked'};


      expect(buildHeadingRippleTemplate).toHaveBeenCalledWith(headingPath);
      expect(buildHeadingFHIRTemplate).not.toHaveBeenCalled();
      expect(buildJSONFile).toHaveBeenCalledWithContext(q, statusJson, headingPath, 'headingStatus.json');

      const stat = new StatMode(fs.statSync(headingPath));
      expect(stat.toString()).toBe('drwxrwxrwx');
    });

    it('should rebuild heading when heading status is "rebuild"', () => {
      buildJSONFile.and.callFake(() => null);

      jumper.build.call(q, headings);


      const headingPath = path.join(openehrConfig.paths.jumper_templates, 'problems');
      const statusJson = {status: 'locked'};


      expect(buildHeadingRippleTemplate).toHaveBeenCalledWith(headingPath);
      expect(buildHeadingFHIRTemplate).not.toHaveBeenCalled();
      expect(buildJSONFile).toHaveBeenCalledWithContext(q, statusJson, headingPath, 'headingStatus.json');
    });

    describe('fhir', () => {
      beforeEach(() => {
        headings = {
          problems: {
            template: {
              name: 'IDCR - Problem List.v1'
            },
            fhir: {
              name: 'Condition'
            }
          }
        };
      });

      it('should build FHIR template', () => {
        fsMock({
          'spec/templates/problems': {}
        });

        jumper.build.call(q, headings);


        const headingPath = path.join(openehrConfig.paths.jumper_templates, 'problems');
        const statusJson = {status: 'locked'};


        expect(buildHeadingRippleTemplate).toHaveBeenCalledWith(headingPath);
        expect(buildHeadingFHIRTemplate).toHaveBeenCalledWith('Condition', headingPath);
        expect(buildJSONFile).toHaveBeenCalledWithContext(q, statusJson, headingPath, 'headingStatus.json');

        const stat = new StatMode(fs.statSync(headingPath));
        expect(stat.toString()).toBe('drwxrwxrwx');
      });
    });
  });
});
