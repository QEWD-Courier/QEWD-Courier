/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  12 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const AuthRestService = require('@lib/services/authRestService');
const nock = require('nock');

describe('ripple-cdr-lib/lib/services/authRestService', () => {
  let ctx;
  let authService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    authService = new AuthRestService(ctx, ctx.serversConfig);
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = AuthRestService.create(ctx, ctx.serversConfig);

      expect(actual).toEqual(jasmine.any(AuthRestService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  xit('should return token', async () => {
    const expected = {
      access_token: 'foo.bar.baz'
    };

    nock('https://devauth.discoverydataservice.net')
      .post('/auth/realms/endeavour/protocol/openid-connect/token', [
        'username=xxxxxxxx',
        'password=yyyyyyyyyyy', //@TODO how handle real credentials?
        'client_id=eds-data-checker',
        'grant_type=password'
      ].join('&'))
      .reply(200, {
        access_token: 'foo.bar.baz'
      });

    const actual = await authService.authenticate();

    expect(nock).toHaveBeenDone();
    expect(actual).toEqual(expected);
  });

  xit('should throw error', async () => {
    nock('https://devauth.discoverydataservice.net')
      .log(console.log)
      .post('/auth/realms/endeavour/protocol/openid-connect/token', [
        'username=xxxxxxxx',
        'password=yyyyyyyyyyy', //@TODO how handle real credentials?
        'client_id=eds-data-checker',
        'grant_type=password'
      ].join('&'))
      .replyWithError({
        message: 'Error while trying to get auth token',
        code: 500
      });

    const actual = authService.authenticate();

    await expectAsync(actual).toBeRejectedWith({
      message: 'Error while trying to get auth token',
      code: 500
    });

    expect(nock).toHaveBeenDone();
  });
});
