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
const TokenService = require('@lib/services/tokenService');

describe('ripple-cdr-lib/lib/services/tokenService', () => {
  let ctx;
  let nowTime;

  let authRestService;
  let tokenService;
  let tokenCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    tokenService = new TokenService(ctx);
    tokenCache = ctx.cache.tokenCache;
    authRestService = ctx.services.authRestService;

    ctx.services.freeze();

    nowTime = Date.UTC(2018, 0, 1); // 1514764800000, now
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(nowTime));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = TokenService.create(ctx, ctx.serversConfig);

      expect(actual).toEqual(jasmine.any(TokenService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#authenticate', () => {
    it('should return cached token', async () => {
      const expected = 'foo.bar.baz';

      const token = {
        jwt: 'foo.bar.baz',
        createdAt: nowTime - 30 * 1000 // 30 seconds ago
      };
      tokenCache.get.and.returnValue(token);

      const actual = await tokenService.get();

      expect(tokenCache.get).toHaveBeenCalled();
      expect(actual).toEqual(expected);
    });

    it('should return a new token when cached token expired', async () => {
      const expected = 'quux.foo.quux';

      const token = {
        jwt: 'foo.bar.baz',
        createdAt: nowTime - 2 * 60 * 1000 // 2 minutes ago
      };
      tokenCache.get.and.returnValue(token);
      const data = {
        access_token: 'quux.foo.quux'
      };
      authRestService.authenticate.and.resolveValue(data);

      const actual = await tokenService.get();

      expect(tokenCache.get).toHaveBeenCalled();
      expect(authRestService.authenticate).toHaveBeenCalled();
      expect(tokenCache.set).toHaveBeenCalledWith({
        jwt: 'quux.foo.quux',
        createdAt: 1514764800000
      });
      expect(actual).toEqual(expected);
    });

    it('should return a new token', async () => {
      const expected = 'foo.bar.baz';

      const data = {
        access_token: 'foo.bar.baz'
      };
      authRestService.authenticate.and.resolveValue(data);

      const actual = await tokenService.get();

      expect(tokenCache.get).toHaveBeenCalled();
      expect(authRestService.authenticate).toHaveBeenCalled();
      expect(tokenCache.set).toHaveBeenCalledWith({
        jwt: 'foo.bar.baz',
        createdAt: 1514764800000
      });
      expect(actual).toEqual(expected);
    });

    it('should delete existing token when error occurred', async () => {
      const expected = new Error('Some unknown error');

      authRestService.authenticate.and.rejectValue(new Error('Some unknown error'));

      const actual = tokenService.get();

      await expectAsync(actual).toBeRejectedWith(expected);

      expect(tokenCache.get).toHaveBeenCalled();
      expect(authRestService.authenticate).toHaveBeenCalled();
      expect(tokenCache.delete).toHaveBeenCalled();
    });
  });
});
