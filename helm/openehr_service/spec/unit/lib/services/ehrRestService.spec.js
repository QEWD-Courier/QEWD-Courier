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

  17 April 2019

*/

'use strict';

const nock = require('nock');
const { ExecutionContextMock } = require('@tests/mocks');
const EhrRestService = require('@lib/services/ehrRestService');

describe('lib/services/ehrRestService', () => {
  let ctx;

  let host;
  let hostConfig;
  let ehrRestService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    host = 'ethercis';
    hostConfig = {
      url: 'http://178.62.71.220:8080',
      username: 'bar',
      password: 'quux',
      platform: 'ethercis'
    };
    ehrRestService = new EhrRestService(ctx, host, hostConfig);
  });

  describe('#startSession', () => {
    it('should send request to start session', async () => {
      const expected = {
        foo: 'bar'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/session?username=bar&password=quux')
        .matchHeader('x-max-session', 75)
        .matchHeader('x-session-timeout', 120000)
        .reply(200, { foo: 'bar' });

      const actual = await ehrRestService.startSession();

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to start session and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/session?username=bar&password=quux')
        .matchHeader('x-max-session', 75)
        .matchHeader('x-session-timeout', 120000)
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         await ehrRestService.startSession();
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });

    it('should send request to start session and handle html error response', async () => {
      const expected = {
        'message': '<html>some text</html>'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/session?username=bar&password=quux')
        .matchHeader('x-max-session', 75)
        .matchHeader('x-session-timeout', 120000)
        .reply(403, '<html>some text</html>');

       try {
         await ehrRestService.startSession();
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });


  describe('#stopSession', () => {
    it('should send request to stop session', async () => {
      const expected = {
        foo: 'bar'
      };

      nock('http://178.62.71.220:8080')
        .delete('/rest/v1/session')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, { foo: 'bar' });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const actual = await ehrRestService.stopSession(sessionId);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to stop session and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .delete('/rest/v1/session')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         await ehrRestService.stopSession(sessionId);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#getEhr', () => {
    it('should send request to get ehr id', async () => {
      const expected = {
        ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      };

      nock('http://178.62.71.220:8080')
        .get('/rest/v1/ehr?subjectId=9999999000&subjectNamespace=uk.nhs.nhs_number')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, { ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f' });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const patientId = 9999999000;
      const actual = await ehrRestService.getEhr(sessionId, patientId);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request  to get ehr id and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .get('/rest/v1/ehr?subjectId=9999999000&subjectNamespace=uk.nhs.nhs_number')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const patientId = 9999999000;
         await ehrRestService.getEhr(sessionId, patientId);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#postEhr', () => {
    it('should send request to post ehr id', async () => {
      const expected = {
        ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/ehr?subjectId=9999999000&subjectNamespace=uk.nhs.nhs_number', {
          subjectId: 9999999000,
          subjectNamespace: 'uk.nhs.nhs_number',
          queryable: 'true',
          modifiable: 'true'
        })
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, { ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f' });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const patientId = 9999999000;
      const actual = await ehrRestService.postEhr(sessionId, patientId);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to post ehr idand handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/ehr?subjectId=9999999000&subjectNamespace=uk.nhs.nhs_number', {
          subjectId: 9999999000,
          subjectNamespace: 'uk.nhs.nhs_number',
          queryable: 'true',
          modifiable: 'true'
        })
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const patientId = 9999999000;
         await ehrRestService.postEhr(sessionId, patientId);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#getComposition', () => {
    it('should send request to get composition record', async () => {
      const expected = {
        composition: {
          foo: 'bar'
        }
      };

      nock('http://178.62.71.220:8080')
        .get('/rest/v1/composition/0f7192e9-168e-4dea-812a-3e1d236ae46d?format=FLAT')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, {
          composition: {
            foo: 'bar'
          }
        });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const actual = await ehrRestService.getComposition(sessionId, compositionId);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to get composition record and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .get('/rest/v1/composition/0f7192e9-168e-4dea-812a-3e1d236ae46d?format=FLAT')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d';
         await ehrRestService.getComposition(sessionId, compositionId);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#postComposition', () => {
    it('should send request to post composition record', async () => {
      const expected = {
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/composition?templateId=RIPPLE%20-%20Personal%20Notes.v1&ehrId=74b6a24b-bd97-47f0-ac6f-a632d0cac60f&format=FLAT', {
          'ctx/composer_name': 'Dr Tony Shannon',
          'ctx/health_care_facility|id': '999999-345',
          'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
          'ctx/id_namespace': 'NHS-UK',
          'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
          'ctx/language': 'en',
          'ctx/territory': 'GB',
          'ctx/time': '2019-01-01T00:00:00Z',
          'personal_notes/clinical_synopsis:0/_name|value': 'foo',
          'personal_notes/clinical_synopsis:0/notes': 'bar'
        })
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, {
          compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
        });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const ehrId = '74b6a24b-bd97-47f0-ac6f-a632d0cac60f';
      const templateId = 'RIPPLE - Personal Notes.v1';
      const data = {
        'ctx/composer_name': 'Dr Tony Shannon',
        'ctx/health_care_facility|id': '999999-345',
        'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
        'ctx/id_namespace': 'NHS-UK',
        'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
        'ctx/language': 'en',
        'ctx/territory': 'GB',
        'ctx/time': '2019-01-01T00:00:00Z',
        'personal_notes/clinical_synopsis:0/_name|value': 'foo',
        'personal_notes/clinical_synopsis:0/notes': 'bar'
      };
      const actual = await ehrRestService.postComposition(sessionId, ehrId, templateId, data);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to post composition record and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/composition?templateId=RIPPLE%20-%20Personal%20Notes.v1&ehrId=74b6a24b-bd97-47f0-ac6f-a632d0cac60f&format=FLAT')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, {
          compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const ehrId = '74b6a24b-bd97-47f0-ac6f-a632d0cac60f';
         const templateId = 'RIPPLE - Personal Notes.v1';
         const data = {};
         await ehrRestService.postComposition(sessionId, ehrId, templateId, data);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#putComposition', () => {
    it('should send request to put composition record', async () => {
      const expected = {
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
      };

      nock('http://178.62.71.220:8080')
        .put('/rest/v1/composition/0f7192e9-168e-4dea-812a-3e1d236ae46d?templateId=RIPPLE%20-%20Personal%20Notes.v1&format=FLAT', {
          'ctx/composer_name': 'Dr Tony Shannon',
          'ctx/health_care_facility|id': '999999-345',
          'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
          'ctx/id_namespace': 'NHS-UK',
          'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
          'ctx/language': 'en',
          'ctx/territory': 'GB',
          'ctx/time': '2019-01-01T00:00:00Z',
          'personal_notes/clinical_synopsis:0/_name|value': 'foo',
          'personal_notes/clinical_synopsis:0/notes': 'bar'
        })
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, {
          compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
        });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const templateId = 'RIPPLE - Personal Notes.v1';
      const data = {
        'ctx/composer_name': 'Dr Tony Shannon',
        'ctx/health_care_facility|id': '999999-345',
        'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
        'ctx/id_namespace': 'NHS-UK',
        'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
        'ctx/language': 'en',
        'ctx/territory': 'GB',
        'ctx/time': '2019-01-01T00:00:00Z',
        'personal_notes/clinical_synopsis:0/_name|value': 'foo',
        'personal_notes/clinical_synopsis:0/notes': 'bar'
      };
      const actual = await ehrRestService.putComposition(sessionId, compositionId, templateId, data);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to put composition record and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .put('/rest/v1/composition/0f7192e9-168e-4dea-812a-3e1d236ae46d?templateId=RIPPLE%20-%20Personal%20Notes.v1&format=FLAT', {
          'ctx/composer_name': 'Dr Tony Shannon',
          'ctx/health_care_facility|id': '999999-345',
          'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
          'ctx/id_namespace': 'NHS-UK',
          'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
          'ctx/language': 'en',
          'ctx/territory': 'GB',
          'ctx/time': '2019-01-01T00:00:00Z',
          'personal_notes/clinical_synopsis:0/_name|value': 'foo',
          'personal_notes/clinical_synopsis:0/notes': 'bar'
        })
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d';
         const templateId = 'RIPPLE - Personal Notes.v1';
         const data = {
           'ctx/composer_name': 'Dr Tony Shannon',
           'ctx/health_care_facility|id': '999999-345',
           'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
           'ctx/id_namespace': 'NHS-UK',
           'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
           'ctx/language': 'en',
           'ctx/territory': 'GB',
           'ctx/time': '2019-01-01T00:00:00Z',
           'personal_notes/clinical_synopsis:0/_name|value': 'foo',
           'personal_notes/clinical_synopsis:0/notes': 'bar'
         };
         await ehrRestService.putComposition(sessionId, compositionId, templateId, data);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#query', () => {
    it('should send get request to query records', async () => {
      const expected = {
        resultSet: [
          {
            foo: 'bar'
          }
        ]
      };

      nock('http://178.62.71.220:8080')
        .get('/rest/v1/query?aql=quux')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, {
          resultSet: [
            {
              foo: 'bar'
            }
          ]
        });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const query = 'quux';
      const actual = await ehrRestService.query(sessionId, query);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send get request to query records and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .get('/rest/v1/query?aql=quux')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const query = 'quux';
         await ehrRestService.query(sessionId, query);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#postQuery', () => {
    it('should send post request to query records', async () => {
      const expected = {
        resultSet: [
          {
            foo: 'bar'
          }
        ]
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/query', {
          aql: 'quux'
        })
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, {
          resultSet: [
            {
              foo: 'bar'
            }
          ]
        });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const query = 'quux';
      const actual = await ehrRestService.postQuery(sessionId, query);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to query records and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .post('/rest/v1/query', {
          aql: 'quux'
        })
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const query = 'quux';
         await ehrRestService.postQuery(sessionId, query);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });

  describe('#deleteComposition', () => {
    it('should send request to delete composition record', async () => {
      const expected = {
        foo: 'bar'
      };

      nock('http://178.62.71.220:8080')
        .delete('/rest/v1/composition/0f7192e9-168e-4dea-812a-3e1d236ae46d')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .reply(200, {
          foo: 'bar'
        });

      const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
      const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const actual = await ehrRestService.deleteComposition(sessionId, compositionId);

      expect(nock).toHaveBeenDone();
      expect(actual).toEqual(expected);
    });

    it('should send request to delete composition record and handle error', async () => {
      const expected = {
        'message': 'something awful',
        'code': 'AWFUL_ERROR'
      };

      nock('http://178.62.71.220:8080')
        .delete('/rest/v1/composition/0f7192e9-168e-4dea-812a-3e1d236ae46d')
        .matchHeader('ehr-session', '03391e86-5085-4b99-89ff-79209f8d1f20')
        .replyWithError({
          'message': 'something awful',
          'code': 'AWFUL_ERROR'
        });

       try {
         const sessionId = '03391e86-5085-4b99-89ff-79209f8d1f20';
         const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d';
         await ehrRestService.deleteComposition(sessionId, compositionId);
       } catch (err) {
         expect(err).toEqual(expected);
       }
    });
  });
});
