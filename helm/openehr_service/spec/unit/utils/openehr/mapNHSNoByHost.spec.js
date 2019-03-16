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
const { Worker } = require('@tests/mocks');
const mapNHSNoByHost = require('@openehr/mapNhsNoByHost');

describe('utils/openehr/mapNHSNoByHost', () => {
  let q;

  function httpSessionMock(data) {
    nock('https://test.operon.systems')
      .post('/rest/v1/session?username=foo&password=123456')
      .matchHeader('x-max-session', 75)
      .matchHeader('x-session-timeout', 120000)
      .reply(200, data);
  }

  function httpEhrMock(sessionId, data) {
    nock('https://test.operon.systems')
      .get('/rest/v1/ehr?subjectId=9999999000&subjectNamespace=uk.nhs.nhs_number')
      .matchHeader('ehr-session', sessionId)
      .reply(200, data || {});
  }

  beforeEach(() => {
    q = new Worker();
  });

  afterEach(() => {
    q.db.reset();
  });

  it('should return ehrId', (done) => {
    const session = {
      sessionId: '03391e86-5085-4b99-89ff-79209f8d1f20'
    };
    const data = {
      ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
    };

    httpSessionMock(session);
    httpEhrMock(session.sessionId, data);

    const nhsNo = 9999999000;
    const host = 'marand';

    mapNHSNoByHost.call(q, nhsNo, host, null, (actual) => {
      expect(actual).toBe('74b6a24b-bd97-47f0-ac6f-a632d0cac60f');

      done();
    });
  });
});
