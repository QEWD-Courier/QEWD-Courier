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
const template = require('qewd-template');
const { Worker } = require('@tests/mocks');
const { getHeadingQuery } = require('@lib/shared/headings');
const fetchAndCacheHeading = require('@openehr/fetchAndCacheHeading');

describe('utils/openehr/fetchAndCacheHeading', () => {
  let q;
  let patientId;
  let heading;
  let qewdSession;
  let callback;

  const aql = {};
  const fakeResponses = {
    marand: {
      session: {
        sessionId: '182bdb28-d257-4a99-9a41-441c49aead0c'
      },
      ehr: {
        ehrId: '41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4'
      }
    },
    ethercis: {
      session: {
        sessionId: 'ae3886df-21e2-4249-97d6-d0612ae8f8be'
      },
      ehr: {
        ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      }
    }
  };

  function getHostConfig(host) {
    return q.userDefined.globalConfig.openehr.servers[host];
  }

  function httpSessionMock(host, data) {
    const { url, username, password } = getHostConfig(host);

    nock(url)
      .post(`/rest/v1/session?username=${username}&password=${password}`)
      .matchHeader('x-max-session', 75)
      .matchHeader('x-session-timeout', 120000)
      .reply(200, data || {});
  }

  function httpEhrMock(host, patientId, sessionId, data) {
    const { url } = getHostConfig(host);

    nock(url)
      .get(`/rest/v1/ehr?subjectId=${patientId}&subjectNamespace=uk.nhs.nhs_number`)
      .matchHeader('ehr-session', sessionId)
      .reply(200, data || {});
  }

  function httpQueryMock(host, heading, sessionId, ehrId) {
    const { url } = getHostConfig(host);
    const subs = { ehrId };
    const aqlQuery = template.replace(aql[heading], subs);

    nock(url)
      .get('/rest/v1/query')
      .query({
        aql: aqlQuery
      })
      .matchHeader('ehr-session', sessionId)
      .reply(200, {});
  }

  beforeAll(() => {
    [
      'procedures'
    ].forEach(x => aql[x] = getHeadingQuery(x));
  });

  beforeEach(() => {
    q = new Worker();

    patientId = 9999999000;
    heading = 'procedures';
    qewdSession = q.sessions.create('app');
    callback = jasmine.createSpy();
  });

  afterEach(() => {
    q.db.reset();
  });

  it('should fetch and cache heading', (done) => {
    const { marand, ethercis } = fakeResponses;

    httpSessionMock('marand', marand.session);
    httpSessionMock('ethercis', ethercis.session);

    httpEhrMock('marand', patientId, marand.session.sessionId, marand.ehr);
    httpEhrMock('ethercis', patientId, ethercis.session.sessionId, ethercis.ehr);

    httpQueryMock('marand', heading,  marand.session.sessionId, marand.ehr.ehrId);
    httpQueryMock('ethercis', heading,  ethercis.session.sessionId, ethercis.ehr.ehrId);

    fetchAndCacheHeading.call(q, patientId, heading, qewdSession, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();
      expect(callback).toHaveBeenCalledWith({ok: true});

      done();
    }, 100);
  });
});
