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
const { Worker, rewritePaths } = require('@tests/mocks');

describe('utils/jumper/lib/getPatientTemplateData', () => {
  let getPatientTemplateData;

  let q;
  let args;
  let finished;

  let fetchAndCacheHeading;
  let getPatientDataFromCache;

  let qewdSession;

  function fetchAndCacheHeadingFakeFactory(data) {
    return (patientId, heading, qewdSession, callback) => callback(data);
  }

  // TODO: ak p5 update results
  function getPatientDataFromCacheFake(patientId, heading, format, qewdSession, callback) {
    if (format === 'fhir') {
      callback({
        resourceType: 'Bundle',
        total: 'count',
        entry: 'results'
      });
    } else {
      callback({
        format: format,
        results: 'results'
      });
    }
  }

  beforeAll(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    q = new Worker();

    args = {
      patientId: 9999999000,
      templateName: 'IDCR - Adverse Reaction List.v1',
      req: {
        qewdSession: q.sessions.create('app'),
        query: {}
      },
      session: {
        nhsNumber: 9434765919,
        role: 'IDCR'
      }
    };
    finished = jasmine.createSpy();

    fetchAndCacheHeading = jasmine.createSpy();
    mockery.registerMock('@openehr/fetchAndCacheHeading', fetchAndCacheHeading);

    getPatientDataFromCache = jasmine.createSpy();
    mockery.registerMock('./getPatientDataFromCache', getPatientDataFromCache);

    delete require.cache[require.resolve('@jumper/getPatientTemplateData')];
    getPatientTemplateData = require('@jumper/getPatientTemplateData');

    qewdSession = args.req.qewdSession;
    rewritePaths(q);

  });

  afterEach(() => {
    mockery.deregisterAll();
    q.db.reset();
  });

  it('should return invalid or missing patientId error', () => {
    args.patientId = 'foo';

    getPatientTemplateData.call(q, args, finished);

    expect(finished).toHaveBeenCalledWith({
      error: 'patientId foo is invalid'
    });
  });

  it('should override patientId for PHR users', () => {
    args.session.role = 'phrUser';

    getPatientTemplateData.call(q, args, finished);

    expect(fetchAndCacheHeading).toHaveBeenCalledWithContext(
      q, 9434765919, 'allergies', qewdSession, jasmine.any(Function)
    );
  });

  it('should return template name not defined or empty error', () => {
    delete args.templateName;

    getPatientTemplateData.call(q, args, finished);

    expect(finished).toHaveBeenCalledWith({
      error: 'Template Name not defined or empty'
    });
  });

  it('should return template is not available error', () => {
    args.templateName = 'foo';

    getPatientTemplateData.call(q, args, finished);

    expect(finished).toHaveBeenCalledWith({
      error: 'Template is not available for use with this API'
    });
  });

  it('should return empty array when no results could be returned for heading', () => {
    const data = { ok: false };
    fetchAndCacheHeading.and.callFake(fetchAndCacheHeadingFakeFactory(data));

    getPatientTemplateData.call(q, args, finished);

    expect(fetchAndCacheHeading).toHaveBeenCalledWithContext(
      q, 9999999000, 'allergies', qewdSession, jasmine.any(Function)
    );
    expect(finished).toHaveBeenCalledWith([]);
  });

  describe('format', () => {
    beforeEach(() => {
      const data = { ok: true };
      fetchAndCacheHeading.and.callFake(fetchAndCacheHeadingFakeFactory(data));
      getPatientDataFromCache.and.callFake(getPatientDataFromCacheFake);
    });

    it('should return patient data from cache in openehr format', () => {
      getPatientTemplateData.call(q, args, finished);

      expect(fetchAndCacheHeading).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', qewdSession, jasmine.any(Function)
      );
      expect(getPatientDataFromCache).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', 'openehr', qewdSession, jasmine.any(Function)
      );
      expect(finished).toHaveBeenCalledWith({
        format: 'openehr',
        results: 'results'
      });
    });

    it('should return patient data from cache in pulsetile format', () => {
      args.req.query.format = 'pulsetile';

      getPatientTemplateData.call(q, args, finished);

      expect(fetchAndCacheHeading).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', qewdSession, jasmine.any(Function)
      );
      expect(getPatientDataFromCache).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', 'pulsetile', qewdSession, jasmine.any(Function)
      );
      expect(finished).toHaveBeenCalledWith({
        format: 'pulsetile',
        results: 'results'
      });
    });

    it('should return patient data from cache in fhir format', () => {
      args.req.query.format = 'fhir';

      getPatientTemplateData.call(q, args, finished);

      expect(fetchAndCacheHeading).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', qewdSession, jasmine.any(Function)
      );
      expect(getPatientDataFromCache).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', 'fhir', qewdSession, jasmine.any(Function)
      );
      expect(finished).toHaveBeenCalledWith({
        resourceType: 'Bundle',
        total: 'count',
        entry: 'results'
      });
    });

    it('should return patient data from cache in default (openehr) format', () => {
      args.req.query.format = 'quux';

      getPatientTemplateData.call(q, args, finished);

      expect(fetchAndCacheHeading).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', qewdSession, jasmine.any(Function)
      );
      expect(getPatientDataFromCache).toHaveBeenCalledWithContext(
        q, 9999999000, 'allergies', 'openehr', qewdSession, jasmine.any(Function)
      );
      expect(finished).toHaveBeenCalledWith({
        format: 'openehr',
        results: 'results'
      });
    });
  });
});
