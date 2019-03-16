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

const { ExecutionContextMock } = require('@tests/mocks');
const config = require('@lib/config');
const { EhrSessionError } = require('@lib/errors');
const EhrSessionService = require('@lib/services/ehrSessionService');

describe('lib/services/ehrSessionService', () => {
  let ctx;
  let nowTime;
  let ehrSessionService;

  let sessionCache;
  let ethercisEhrRestService;

  beforeEach(() => {
    nowTime = Date.UTC(2019, 0, 1); // 1546300800000, now
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(nowTime));

    ctx = new ExecutionContextMock();
    ehrSessionService = new EhrSessionService(ctx);

    sessionCache = ctx.cache.sessionCache;
    ethercisEhrRestService = ctx.rest.ethercis;

    ctx.freeze();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = EhrSessionService.create(ctx);

      expect(actual).toEqual(jasmine.any(EhrSessionService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#start', () => {
    it('should return cached session', async () => {
      const expected = {
        sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
      };

      sessionCache.get.and.returnValue({
        id: '03134cc0-3741-4d3f-916a-a279a24448e5',
        creationTime: nowTime - config.openehr.sessionTimeout / 2
      });

      const host = 'ethercis';
      const actual = await ehrSessionService.start(host);

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');
      expect(actual).toEqual(expected);
    });

    it('should delete expired cached session', async () => {
      const expected = {
        sessionId: 'e5770469-7c26-47f7-afe0-57bce80eb2ee'
      };

      spyOn(ehrSessionService, 'stop');

      sessionCache.get.and.returnValue({
        id: '03134cc0-3741-4d3f-916a-a279a24448e5',
        creationTime: nowTime - config.openehr.sessionTimeout * 2
      });
      ethercisEhrRestService.startSession.and.resolveValue({
        sessionId: 'e5770469-7c26-47f7-afe0-57bce80eb2ee'
      });

      const host = 'ethercis';
      const actual = await ehrSessionService.start(host);

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');
      expect(ethercisEhrRestService.startSession).toHaveBeenCalled();
      expect(sessionCache.set).toHaveBeenCalledWith('ethercis', {
        id: 'e5770469-7c26-47f7-afe0-57bce80eb2ee',
        creationTime: 1546300800000
      });

      expect(actual).toEqual(expected);
    });

    it('should send a request to start a new session, cache and return it', async () => {
      const expected = {
        sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
      };

      ethercisEhrRestService.startSession.and.resolveValue({
        sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
      });

      const host = 'ethercis';
      const actual = await ehrSessionService.start(host);

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.startSession).toHaveBeenCalled();
      expect(sessionCache.set).toHaveBeenCalledWith('ethercis', {
        id: '03134cc0-3741-4d3f-916a-a279a24448e5',
        creationTime: 1546300800000
      });

      expect(actual).toEqual(expected);
    });

    it('should throw ehr session error (no response)', async () => {
      const host = 'ethercis';
      const actual = ehrSessionService.start(host);

      await expectAsync(actual).toBeRejectedWith(
        new EhrSessionError('Unable to establish a session with ethercis')
      );

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.startSession).toHaveBeenCalled();
    });

    it('should throw ehr session error (bad response)', async () => {
      ethercisEhrRestService.startSession.and.resolveValue({});

      const host = 'ethercis';
      const actual = ehrSessionService.start(host);

      await expectAsync(actual).toBeRejectedWith(
        new EhrSessionError('Unable to establish a session with ethercis')
      );

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.startSession).toHaveBeenCalled();
    });
  });

  describe('#stop', () => {
    it('should return false when session is not over the timeout', async () => {
      const expected = false;

      sessionCache.get.and.returnValue({
        id: '03134cc0-3741-4d3f-916a-a279a24448e5',
        creationTime: nowTime - config.openehr.sessionTimeout / 2
      });

      const host = 'ethercis';
      const sessionId = '03134cc0-3741-4d3f-916a-a279a24448e5';
      const actual = await ehrSessionService.stop(host, sessionId);

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');

      expect(actual).toEqual(expected);
    });

    it('should delete session when session expired', async () => {
      const expected = true;

      sessionCache.get.and.resolveValue({
        id: '03134cc0-3741-4d3f-916a-a279a24448e5',
        creationTime: nowTime - config.openehr.sessionTimeout * 2
      });

      const host = 'ethercis';
      const sessionId = '03134cc0-3741-4d3f-916a-a279a24448e5';
      const actual = await ehrSessionService.stop(host, sessionId);

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');
      expect(sessionCache.delete).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.stopSession).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should send a request to stop a session and return true (no session in cache)', async () => {
      const expected = true;

      const host = 'ethercis';
      const sessionId = '03134cc0-3741-4d3f-916a-a279a24448e5';
      const actual = await ehrSessionService.stop(host, sessionId);

      expect(sessionCache.get).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.stopSession).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });
  });
});
