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
const nock = require('nock');
const mockery = require('mockery');
const { Worker, rewritePaths } = require('@tests/mocks');
const openEHR = require('@openehr/openEHR');

describe('utils/jumper/lib/getHeadingFromOpenEHRServer', () => {
  let q;
  let qewdSession;
  let aql;

  let params;
  let callback;

  let getHeadingFromOpenEHRServer;
  let buildJSONFile;
  let mapRawJSON;
  let addPatientDataToCache;

  let openehrConfig;

  function httpQueryMock(data, statusCode) {
    nock('http://178.62.71.220:8080')
      .post('/rest/v1/query', {
        aql: aql
      })
      .matchHeader('ehr-session', '0f7192e9-168e-4dea-812a-3e1d236ae46d')
      .delayConnection(50)
      .reply(statusCode || 200, data);
  }

  function seeds() {
    const byPatientIdCache = qewdSession.data.$(['headings', 'byPatientId', 9999999000, 'problems']);
    byPatientIdCache.$(['byDate', 1514764800000, 'e5770469-7c26-47f7-afe0-57bce80eb2ee']).value = '';
    byPatientIdCache.$(['byHost', 'ethercis', 'e5770469-7c26-47f7-afe0-57bce80eb2ee']).value = '';
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
    qewdSession = q.sessions.create('app');

    aql = [
      'select a as data from EHR e[ehr_id/value=\'66f74ea6-d13a-4904-b069-44dad2fb6b0f\'] ',
      'contains COMPOSITION a[openEHR-EHR-COMPOSITION.adverse_reaction_list.v1] where ',
      'a/name/value=\'Adverse reaction list\''
    ].join('');

    params = {
      patientId: 9999999000,
      heading: 'allergies',
      host: 'ethercis',
      qewdSession: qewdSession,
      openEHR: openEHR,
      ehrId: '66f74ea6-d13a-4904-b069-44dad2fb6b0f',
      openEHRSession: {
        id: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      }
    };
    callback = jasmine.createSpy();

    spyOn(openEHR, 'request').and.callThrough();

    buildJSONFile = jasmine.createSpy();
    mockery.registerMock('./buildJsonFile', buildJSONFile);

    mapRawJSON = jasmine.createSpy();
    mockery.registerMock('./mapRawJSON', mapRawJSON);

    addPatientDataToCache = jasmine.createSpy();
    mockery.registerMock('./addPatientDataToCache', addPatientDataToCache);

    delete require.cache[require.resolve('@jumper/getHeadingFromOpenEHRServer')];
    getHeadingFromOpenEHRServer = require('@jumper/getHeadingFromOpenEHRServer');

    rewritePaths(q);
    seeds();

    openehrConfig = q.userDefined.globalConfig.openehr;
  });

  afterEach(() => {
    mockery.deregisterAll();
    q.db.reset();
  });

  it('should do nothing when heading already cached', () => {
    params.heading = 'problems';

    openEHR.init.call(q);
    getHeadingFromOpenEHRServer.call(q, params, callback);

    expect(openEHR.request).not.toHaveBeenCalled();
  });

  it('should send correct request to openEHR server', (done) => {
    httpQueryMock();

    openEHR.init.call(q);
    getHeadingFromOpenEHRServer.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();
      expect(openEHR.request).toHaveBeenCalledWith({
        host: 'ethercis',
        url: '/rest/v1/query',
        method: 'POST',
        options: {
          body: {
            aql: aql
          }
        },
        session: '0f7192e9-168e-4dea-812a-3e1d236ae46d',
        logResponse: false,
        processBody: jasmine.any(Function)
      });

      done();
    }, 100);
  });

  it('should return missing body error', (done) => {
    httpQueryMock('');

    openEHR.init.call(q);
    getHeadingFromOpenEHRServer.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();
      expect(openEHR.request).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({
        error: 'Missing body'
      });

      done();
    }, 100);
  });

  it('should return invalid body content error', (done) => {
    httpQueryMock('invalid content');

    openEHR.init.call(q);
    getHeadingFromOpenEHRServer.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();
      expect(openEHR.request).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({
        error: 'Invalid body content'
      });

      done();
    }, 100);
  });

  it('should return developer message error', (done) => {
    const data = {
      status: 404,
      developerMessage: 'Oops'
    };
    httpQueryMock(data, data.status);

    openEHR.init.call(q);
    getHeadingFromOpenEHRServer.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();
      expect(openEHR.request).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({
        error: 'Oops'
      });

      done();
    }, 100);
  });

  it('should do nothing when error returned', (done) => {
    const data = {
      error: {}
    };
    httpQueryMock(data);

    openEHR.init.call(q);
    getHeadingFromOpenEHRServer.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();
      expect(openEHR.request).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();

      done();
    }, 100);
  });

  describe('handle valid response', () => {
    let data;
    let resultArr;

    beforeEach(() => {
      data = {
        executedAQL: aql,
        resultSet: [
          {
            data: {
              '@class': 'COMPOSITION',
              composer: {
                name: 'Dr Tony Shannon',
                '@class': 'PARTY_IDENTIFIED'
              }
            }
          }
        ]
      };

      httpQueryMock(data);

      resultArr = [
        {
          composer: {
            value: 'Dr Tony Shannon'
          }
        }
      ];
      mapRawJSON.and.returnValue(resultArr);
    });

    it('should save a top level copy of the raw response', (done) => {
      openEHR.init.call(q);
      getHeadingFromOpenEHRServer.call(q, params, callback);

      setTimeout(() => {
        const headingPath = path.join(openehrConfig.paths.jumper_templates, 'allergies');

        expect(buildJSONFile).toHaveBeenCalledTimes(2);
        expect(buildJSONFile.calls.at(0).object).toBe(q);
        expect(buildJSONFile.calls.at(0).args).toEqual([data, headingPath, 'patient_data_raw_example_ethercis.json']);

        done();
      }, 100);
    });

    it('should save a top level copy of the formatted response', (done) => {
      openEHR.init.call(q);
      getHeadingFromOpenEHRServer.call(q, params, callback);

      setTimeout(() => {
        const headingPath = path.join(openehrConfig.paths.jumper_templates, 'allergies');

        expect(buildJSONFile).toHaveBeenCalledTimes(2);
        expect(buildJSONFile.calls.at(1).object).toBe(q);
        expect(buildJSONFile.calls.at(1).args).toEqual([resultArr, headingPath, 'patient_data_formatted_example_ethercis.json']);

        done();
      }, 100);
    });

    it('should NOT save a top level copy of the formatted/raw responses when the copy are already cached', (done) => {
      openEHR.init.call(q);
      getHeadingFromOpenEHRServer.call(q, params, callback);

      setTimeout(() => {
        buildJSONFile.calls.reset();

        httpQueryMock(data);
        getHeadingFromOpenEHRServer.call(q, params, callback);
      }, 100);

      setTimeout(() => {
        expect(buildJSONFile).not.toHaveBeenCalled();
        done();
      }, 200);
    });

    it('should add patient data to cache', (done) => {
      openEHR.init.call(q);
      getHeadingFromOpenEHRServer.call(q, params, callback);

      setTimeout(() => {
        expect(addPatientDataToCache).toHaveBeenCalledWith(
          resultArr, 9999999000, 'ethercis', 'allergies', qewdSession.data
        );

        done();
      }, 100);
    });
  });
});
