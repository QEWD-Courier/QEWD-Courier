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
const nock = require('nock');
const { Worker } = require('@tests/mocks');
const sendHeadingData = require('@jumper/sendHeadingData');

describe('utils/jumper/lib/sendHeadingData', () => {
  let q;

  let params;
  let callback;

  let openEHR;

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

    delete require.cache[require.resolve('@openehr/openEHR')];
    openEHR = require('@openehr/openEHR');

    params = {
      openEHR: openEHR,
      heading: 'allergies',
      host: 'ethercis',
      openEhrSessionId: '2c9a7b22-4cdd-484e-a8b5-759a70443be3',
      flatJSON: {
        'ctx/composer_name': 'Dr Tony Shannon'
      }
    };
    callback = jasmine.createSpy();
  });

  afterEach(() => {
    mockery.deregisterAll();
    q.db.reset();
  });

  it('should send heading data (POST)', (done) => {
    params.method = 'post';
    params.ehrId = '0a8696e3-6c93-4131-9dd4-38609e5b5ec9';

    const data = {foo: 'bar'};
    nock('http://178.62.71.220:8080')
      .post('/rest/v1/composition', {
        'ctx/composer_name': 'Dr Tony Shannon'
      })
      .query({
        templateId: 'IDCR - Adverse Reaction List.v1',
        ehrId: '0a8696e3-6c93-4131-9dd4-38609e5b5ec9',
        format: 'FLAT'
      })
      .matchHeader('ehr-session', '2c9a7b22-4cdd-484e-a8b5-759a70443be3')
      .reply(200, data);

    openEHR.init.call(q);
    sendHeadingData.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();

      expect(callback).toHaveBeenCalledWith({
        data: {
          foo: 'bar'
        }
      });
      done();
    }, 100);
  });

  it('should send heading data (PUT)', (done) => {
    params.method = 'put';
    params.compositionId = 'ae3886df-21e2-4249-97d6-d0612ae8f8be';

    const data = {foo: 'bar'};
    nock('http://178.62.71.220:8080')
      .put('/rest/v1/composition/ae3886df-21e2-4249-97d6-d0612ae8f8be', {
        'ctx/composer_name': 'Dr Tony Shannon'
      })
      .query({
        templateId: 'IDCR - Adverse Reaction List.v1',
        format: 'FLAT'
      })
      .matchHeader('ehr-session', '2c9a7b22-4cdd-484e-a8b5-759a70443be3')
      .reply(200, data);

    openEHR.init.call(q);
    sendHeadingData.call(q, params, callback);

    setTimeout(() => {
      expect(nock).toHaveBeenDone();

      expect(callback).toHaveBeenCalledWith({
        data: {
          foo: 'bar'
        }
      });
      done();
    }, 100);
  });
});
