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
const { ExecutionContext } = require('@lib/core');

describe('utils/openehr/openEHR', () => {
  let q;
  let openEHR;

  beforeEach(() => {
    q = new Worker();

    delete require.cache[require.resolve('@openehr/openEHR')];
    openEHR = require('@openehr/openEHR');
  });

  afterEach(() => {
    q.db.reset();
  });

  describe('#init', () => {
    it('should inititialize context with worker', () => {
      const adapter = openEHR.init.call(q);
      expect(adapter.ctx instanceof ExecutionContext).toBe(true);
      expect(adapter.ctx.worker).toBe(q);
    });
  });

  describe('#request', () => {
    beforeEach(() => {
      openEHR.init.call(q);
    });

    it('should process request', (done) => {
      const expected = {
        quux: 'bar',
        data: {
          foo: 'bar'
        }
      };

      const params = {
        host: 'ethercis',
        url: '/rest/v1/template/foo/introspect',
        method: 'GET',
        session: '03391e86-5085-4b99-89ff-79209f8d1f20',
        processBody: function (body, userObj) {
          userObj.data = body;
        },
        callback: (actual) => {
          expect(nock).toHaveBeenDone();
          expect(actual).toEqual(expected);

          done();
        }
      };
      const userObj = {
        quux: 'bar'
      };

      nock('http://178.62.71.220:8080')
        .get('/rest/v1/template/foo/introspect')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, { foo: 'bar' });

      openEHR.request(params, userObj);
    });
  });

  describe('#startSession', () => {
    beforeEach(() => {
      openEHR.init.call(q);
    });

    it('should start ehr session', (done) => {
      const expected = {
        id: '03391e86-5085-4b99-89ff-79209f8d1f20'
      };

      const host = 'ethercis';
      const qewdSession = q.sessions.create('foo-session');

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/session?username=bar&password=quux')
        .matchHeader('x-max-session', 75)
        .matchHeader('x-session-timeout', 120000)
        .reply(200, { sessionId: '03391e86-5085-4b99-89ff-79209f8d1f20' });

      openEHR.startSession(host, qewdSession, (actual) => {
        expect(nock).toHaveBeenDone();
        expect(actual).toEqual(expected);

        done();
      });
    });

    it('should start ehr session (no qewd session)', (done) => {
      const expected = {
        id: '03391e86-5085-4b99-89ff-79209f8d1f20'
      };

      const host = 'ethercis';
      const qewdSession = null;

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/session?username=bar&password=quux')
        .matchHeader('x-max-session', 75)
        .matchHeader('x-session-timeout', 120000)
        .reply(200, { sessionId: '03391e86-5085-4b99-89ff-79209f8d1f20' });

      openEHR.startSession(host, qewdSession, (actual) => {
        expect(nock).toHaveBeenDone();
        expect(actual).toEqual(expected);

        done();
      });
    });

    it('should start ehr session (error)', (done) => {
      const host = 'ethercis';
      const qewdSession = null;

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/session?username=bar&password=quux')
        .matchHeader('x-max-session', 75)
        .matchHeader('x-session-timeout', 120000)
        .replyWithError({
          message: 'custom error',
          code: 500
        });

      openEHR.startSession(host, qewdSession, (actual) => {
        expect(nock).toHaveBeenDone();
        expect(actual).toBeUndefined();

        done();
      });
    });
  });

  describe('#stopSession', () => {
    beforeEach(() => {
      openEHR.init.call(q);
    });

    it('should stop ehr session', (done) => {
      const host = 'ethercis';
      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const qewdSession = q.sessions.create('bar-session');

      nock('http://178.62.71.220:8080')
        .delete('/rest/v1/session')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(204);

      openEHR.stopSession(host, sessionId, qewdSession, () => {
        expect(nock).toHaveBeenDone();
        done();
      });
    });

    it('should stop ehr session (no qewd session)', (done) => {
      const host = 'ethercis';
      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const qewdSession = null;

      nock('http://178.62.71.220:8080')
        .delete('/rest/v1/session')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(204);

      openEHR.stopSession(host, sessionId, qewdSession, () => {
        expect(nock).toHaveBeenDone();
        done();
      });
    });

    it('should stop ehr session (error)', (done) => {
      const host = 'ethercis';
      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const qewdSession = null;

      nock('http://178.62.71.220:8080')
        .delete('/rest/v1/session')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          message: 'custom error',
          code: 500
        });

      openEHR.stopSession(host, sessionId, qewdSession, () => {
        expect(nock).toHaveBeenDone();
        done();
      });
    });
  });
});
