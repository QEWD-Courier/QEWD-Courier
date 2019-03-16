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

const nock = require('nock');
const { Worker, rewritePaths } = require('@tests/mocks');
const sendHeadingToOpenEHR = require('@jumper/sendHeadingToOpenEHR');

describe('utils/jumper/lib/sendHeadingToOpenEHR', () => {
  let q;
  let params;
  let callback;

  const fakeResponses = {
    session: {
      sessionId: '182bdb28-d257-4a99-9a41-441c49aead0c'
    },
    ehr: {
      ehrId: '41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4'
    },
    postHeading: {
      compositionUid: '61ee3e4e-b49e-431b-a34f-9f1fe6702b86'
    },
    putHeading: {
      compositionUid: '22f95845-8387-4650-83bc-a5642bf26ca5'
    }
  };
  const sessionId = fakeResponses.session.sessionId;
  const ehrId = fakeResponses.ehr.ehrId;

  function startSessionHttpMock(data) {
    nock('http://178.62.71.220:8080')
      .post('/rest/v1/session?username=bar&password=quux')
      .matchHeader('x-max-session', 75)
      .matchHeader('x-session-timeout', 120000)
      //.times(2)
      .reply(200, data || {});
  }

  function httpEhrMock(sessionId, data) {
    nock('http://178.62.71.220:8080')
      .get(`/rest/v1/ehr?subjectId=${params.patientId}&subjectNamespace=uk.nhs.nhs_number`)
      .matchHeader('ehr-session', sessionId)
      .reply(200, data || {});
  }

  function httpPostHeadingMock(sessionId, ehrId, data) {
    nock('http://178.62.71.220:8080')
      .post('/rest/v1/composition', {
        'ctx/composer_name': 'Dr Tony Shannon'
      })
      .query({
        templateId: 'IDCR - Adverse Reaction List.v1',
        ehrId: ehrId,
        format: 'FLAT'
      })
      .matchHeader('ehr-session', sessionId)
      .reply(200, data || {});
  }

  function httpPutHeadingMock(sessionId, ehrId, data) {
    nock('http://178.62.71.220:8080')
      .put('/rest/v1/composition/ae3886df-21e2-4249-97d6-d0612ae8f8be', {
        'ctx/composer_name': 'Dr Tony Shannon'
      })
      .query({
        templateId: 'IDCR - Adverse Reaction List.v1',
        format: 'FLAT'
      })
      .matchHeader('ehr-session', sessionId)
      .reply(200, data || {});
  }

  function seeds() {
    const patientId = params.patientId;
    const heading = params.heading;
    const qewdSession = params.qewdSession;

    const byPatientIdCache = qewdSession.data.$(['headings', 'byPatientId', patientId, heading]);
    byPatientIdCache.$(['byDate', 1514764800000, '0f7192e9-168e-4dea-812a-3e1d236ae46d']).value = '';
    byPatientIdCache.$(['byHost', 'ethercis', '0f7192e9-168e-4dea-812a-3e1d236ae46d']).value = '';

    const bySourceIdCache = qewdSession.data.$(['headings', 'bySourceId']);
    bySourceIdCache.$('0f7192e9-168e-4dea-812a-3e1d236ae46d').setDocument({date: 1514764800000});
  }

  function validateThatSessionCacheToBeDeleted() {
    const expected = {};

    const patientId = params.patientId;
    const heading = params.heading;
    const qewdSession = params.qewdSession;

    const byPatientIdCache = qewdSession.data.$(['headings', 'byPatientId', patientId, heading]);
    expect(byPatientIdCache.getDocument()).toEqual(expected);

    const bySourceIdCache = qewdSession.data.$(['headings', 'bySourceId']);
    expect(bySourceIdCache.getDocument()).toEqual(expected);
  }

  beforeEach(() => {
    q = new Worker();

    params = {
      defaultHost: 'ethercis',
      patientId: 9999999000,
      heading: 'allergies',
      flatJSON: {
        'ctx/composer_name': 'Dr Tony Shannon'
      },
      qewdSession: q.sessions.create('app')
    };
    callback = jasmine.createSpy();

    rewritePaths(q);
    seeds();
  });

  afterEach(() => {
    q.db.reset();
  });

  it('should return unable to establish a session with host error', (done) => {
    startSessionHttpMock();

    sendHeadingToOpenEHR.call(q, params);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();

      done();
    }, 100);
  });

  it('should return unable to establish a session with host error with callback', (done) => {
    startSessionHttpMock();

    sendHeadingToOpenEHR.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();
      expect(callback).toHaveBeenCalledWith({
        error: 'Unable to establish a session with ethercis'
      });

      done();
    }, 100);
  });

  describe('POST', () => {
    beforeEach(() => {
      params.method = 'post';
    });

    it('should return non ok', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPostHeadingMock(sessionId, ehrId, null);

      sendHeadingToOpenEHR.call(q, params);
      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();

        done();
      }, 100);
    });

    it('should return non ok with callback', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPostHeadingMock(sessionId, ehrId, null);

      sendHeadingToOpenEHR.call(q, params, callback);

      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();
        expect(callback).toHaveBeenCalledWith({
          ok: false
        });

        done();
      }, 100);
    });

    it('should send heading to OpenEHR and return correct response', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPostHeadingMock(sessionId, ehrId, fakeResponses.postHeading);

      sendHeadingToOpenEHR.call(q, params);

      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();

        done();
      }, 100);
    });

    it('should send heading to OpenEHR and return correct response with callback', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPostHeadingMock(sessionId, ehrId, fakeResponses.postHeading);

      sendHeadingToOpenEHR.call(q, params, callback);

      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();
        expect(callback).toHaveBeenCalledWith({
          ok: true,
          host: 'ethercis',
          heading: 'allergies',
          compositionUid: '61ee3e4e-b49e-431b-a34f-9f1fe6702b86'
        });

        done();
      }, 100);
    });
  });

  describe('PUT', () => {
    beforeEach(() => {
      params.method = 'put';
      params.compositionId = 'ae3886df-21e2-4249-97d6-d0612ae8f8be';
    });

    it('should return non ok', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPutHeadingMock(sessionId, ehrId, null);

      sendHeadingToOpenEHR.call(q, params);

      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();

        done();
      }, 100);
    });

    it('should return non ok with callback', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPutHeadingMock(sessionId, ehrId, null);

      sendHeadingToOpenEHR.call(q, params, callback);

      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();
        expect(callback).toHaveBeenCalledWith({
          ok: false
        });

        done();
      }, 100);
    });

    it('should send heading to OpenEHR and return correct response', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPutHeadingMock(sessionId, ehrId, fakeResponses.putHeading);

      sendHeadingToOpenEHR.call(q, params);

      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();

        done();
      }, 100);
    });

    it('should send heading to OpenEHR and return correct response with callback', (done) => {
      startSessionHttpMock(fakeResponses.session);

      // @openehr/mapNHSNoByHost doesn't support ehr session to be passed
      // so there is extra request to get ehr session
      startSessionHttpMock(fakeResponses.session);
      httpEhrMock(sessionId, fakeResponses.ehr);

      httpPutHeadingMock(sessionId, ehrId, fakeResponses.putHeading);

      sendHeadingToOpenEHR.call(q, params, callback);

      setTimeout(() => {
        expect(nock).toHaveBeenDone();
        validateThatSessionCacheToBeDeleted();
        expect(callback).toHaveBeenCalledWith({
          ok: true,
          host: 'ethercis',
          heading: 'allergies',
          compositionUid: '22f95845-8387-4650-83bc-a5642bf26ca5'
        });

        done();
      }, 100);
    });
  });
});
