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
const { Worker, rewritePaths } = require('@tests/mocks');
const getPatientDataFromCache = require('@jumper/getPatientDataFromCache');

describe('utils/jumper/lib/getPatientDataFromCache', () => {
  let q;
  let openehrConfig;

  let patientId;
  let heading;
  let format;
  let qewdSession;
  let callback;

  function seeds() {
    const hostCache = qewdSession.data.$(['headings', 'byPatientId', patientId, heading]);
    hostCache.$(['byHost', 'ethercis', '0f7192e9-168e-4dea-812a-3e1d236ae46d']).value = '';

    qewdSession.data.$(['headings', 'bySourceId', '0f7192e9-168e-4dea-812a-3e1d236ae46d']).setDocument({
      pulsetile: {
        name: 'foo',
        desc: 'bar',
      },
      jumperFormatData: {
        name: 'bar'
      },
      fhir: {
        name: 'quux'
      }
    });
  }

  function fhirSeeds() {
    const hostCache = qewdSession.data.$(['headings', 'byPatientId', patientId, heading]);
    hostCache.$(['byHost', 'ethercis', '2c9a7b22-4cdd-484e-a8b5-759a70443be3']).value = '';

    qewdSession.data.$(['headings', 'bySourceId', '2c9a7b22-4cdd-484e-a8b5-759a70443be3']).setDocument({
      jumperFormatData: {
        name: 'bar2'
      },
    });
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

    patientId = 9999999000;
    heading = 'allergies';
    format = '';
    qewdSession = q.sessions.create('app');
    callback = jasmine.createSpy();

    rewritePaths(q);
    seeds();

    openehrConfig = q.userDefined.globalConfig.openehr;
  });

  afterEach(() => {
    mockery.deregisterAll();
    q.db.reset();
  });

  it('should return empty array when no format', () => {
    getPatientDataFromCache.call(q, patientId, heading, format, qewdSession, callback);

    expect(callback).toHaveBeenCalledWith({
      format: '',
      results: []
    });
  });

  describe('pulsetile', () => {
    beforeEach(() => {
      format = 'pulsetile';
    });

    it('should return patient data in pulsetile format', () => {
      getPatientDataFromCache.call(q, patientId, heading, format, qewdSession, callback);

      expect(callback).toHaveBeenCalledWith({
        format: 'pulsetile',
        results: [
          {
            name: 'foo',
            desc: 'bar'
          }
        ]
      });
    });
  });

  describe('openehr', () => {
    beforeEach(() => {
      format = 'openehr';
    });

    it('should return patient data in openehr format', () => {
      getPatientDataFromCache.call(q, patientId, heading, format, qewdSession, callback);

      expect(callback).toHaveBeenCalledWith({
        format: 'openehr',
        results: [
          {
            name: 'bar'
          }
        ]
      });
    });
  });

  describe('fhir', () => {
    beforeEach(() => {
      format = 'fhir';
      fhirSeeds();
    });

    it('should return patient data in fhir format', () => {
      getPatientDataFromCache.call(q, patientId, heading, format, qewdSession, callback);

      expect(callback).toHaveBeenCalledWith({
        resourceType: 'Bundle',
        total: 2,
        entry: [
          {
            name: 'quux'
          },
          {
            name: 'bar2',
            desc: 'quuxx'
          }
        ]
      });
    });

    it('should cache openEHR to FHIR template for heading', () => {
      getPatientDataFromCache.call(q, patientId, heading, format, qewdSession, callback);


      const openEhrToFhirPath = path.join(openehrConfig.paths.jumper_templates, 'allergies/openEHR_to_FHIR.json');
      mockery.registerSubstitute(openEhrToFhirPath, 'baz');


      expect(() => {
        getPatientDataFromCache.call(q, patientId, heading, format, qewdSession, callback);
        mockery.deregisterSubstitute(openEhrToFhirPath);
      }).not.toThrowError();
    });
  });

});
