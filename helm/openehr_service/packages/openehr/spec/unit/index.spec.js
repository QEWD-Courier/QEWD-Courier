/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

 7 February 2019

*/

'use strict';

const mockery = require('mockery');
const router = require('qewd-router');
const { ExecutionContext } = require('../../lib/core');
const { Heading } = require('../../lib/shared/enums');
const { ExecutionContextMock, MasterMock, Worker } = require('../mocks');

describe('ripple-cdr-openehr/lib/index', () => {
  let q;
  let target;

  function loadModule() {
    delete require.cache[require.resolve('../../lib')];
    return require('../../lib');
  }

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  describe('init', () => {
    let routes;

    beforeAll(() => {
      delete require.cache[require.resolve('../../lib/routes')];
      routes = require('../../lib/routes');
    });

    beforeEach(() => {
      spyOn(router, 'addMicroServiceHandler');
    });

    it('should add microservice handlers', () => {
      target = loadModule();
      target.init.call(q);

      expect(router.addMicroServiceHandler).toHaveBeenCalledWith(routes, target);
    });
  });

  describe('beforeMicroServiceHandler', () => {
    let req;
    let finished;
    let ctx;

    beforeEach(() => {
      q = new Worker();

      req = {
        path: '',
        session: {
          role: 'admin'
        }
      };
      finished = jasmine.createSpy();

      ctx = new ExecutionContextMock(q);
      spyOn(ExecutionContext, 'fromRequest').and.returnValue(ctx);

      target = loadModule();
    });

    afterEach(() => {
      q.db.reset();
    });

    it('should return true when access to /api/hscn/* endpoints', () => {
      const expected = true;

      req.path = '/api/hscn/ltht/top3Things/9999999111';

      const actual = target.beforeMicroServiceHandler.call(q, req, finished);

      expect(req.ctx instanceof ExecutionContext).toBe(true);
      expect(actual).toEqual(expected);
    });

    it('should return false when authorization failed', () => {
      const expected = false;

      q.jwt.handlers.validateRestRequest.and.returnValue(false);

      const actual = target.beforeMicroServiceHandler.call(q, req, finished);

      expect(q.jwt.handlers.validateRestRequest).toHaveBeenCalledWithContext(q, req, finished);
      expect(req.ctx).toBeUndefined();

      expect(actual).toEqual(expected);
    });

    it('should return true when access to not /api/my/* endpoints', () => {
      const expected = true;

      q.jwt.handlers.validateRestRequest.and.returnValue(true);

      req.path = '/api/feeds';
      const actual = target.beforeMicroServiceHandler.call(q, req, finished);

      expect(q.jwt.handlers.validateRestRequest).toHaveBeenCalledWithContext(q, req, finished);
      expect(req.ctx).toBe(ctx);

      expect(actual).toEqual(expected);
    });

    it('should return true when phr user access to /api/my* endpoints', () => {
      const expected = true;

      q.jwt.handlers.validateRestRequest.and.returnValue(true);

      req.path = '/api/my/headings/synopsis';
      req.session.role = 'phrUser';
      const actual = target.beforeMicroServiceHandler.call(q, req, finished);

      expect(q.jwt.handlers.validateRestRequest).toHaveBeenCalledWithContext(q, req, finished);
      expect(req.ctx).toBe(ctx);

      expect(actual).toEqual(expected);
    });

    it('should return true and respond with unauthorised request error when non phr user access to /api/my/*', () => {
      const expected = false;

      q.jwt.handlers.validateRestRequest.and.returnValue(true);

      req.path = '/api/my/headings/synopsis';
      const actual = target.beforeMicroServiceHandler.call(q, req, finished);

      expect(q.jwt.handlers.validateRestRequest).toHaveBeenCalledWithContext(q, req, finished);
      expect(req.ctx).toBeUndefined();
      expect(finished).toHaveBeenCalledWith({
        error: 'Unauthorised request'
      });

      expect(actual).toEqual(expected);
    });
  });

  describe('workerResponseHandlers', () => {
    let message;
    let send;

    let DiscoveryDispatcher;
    let discoveryDispatcher;

    beforeEach(() => {
      q = new MasterMock();

      discoveryDispatcher = jasmine.createSpyObj('discovery', ['syncAll']);
      DiscoveryDispatcher = jasmine.createSpy().and.returnValue(discoveryDispatcher);
      mockery.registerMock('./dispatchers/discovery', DiscoveryDispatcher);
    });

    describe('restRequest', () => {
      let restRequest;

      describe('/api/openehr/check', () => {
        beforeEach(() => {
          message = {
            path: '/api/openehr/check',
            status: 'loading_data',
            new_patient: true,
            nhsNumber: 9999999000,
            ewd_application: 'ripple-cdr-openehr',
            token: 'foo.bar.baz'
          };
          send = jasmine.createSpy();

          target = loadModule();
          restRequest = target.workerResponseHandlers.restRequest;
        });

        it('should do nothing when status is ready', () => {
          message.status = 'ready';
          const actual = restRequest.call(q, message, send);
          expect(actual).toBeUndefined();
        });

        it('should do nothing when responseNo > 1', () => {
          message.responseNo = 2;
          const actual = restRequest.call(q, message, send);
          expect(actual).toBeUndefined();
        });

        it('should sync headings using discovery dispather', () => {
          q.userDefined.synopsis.headings.push(Heading.TOP_3_THINGS);

          restRequest.call(q, message, send);

          expect(DiscoveryDispatcher).toHaveBeenCalledWith(q);
          expect(discoveryDispatcher.syncAll).toHaveBeenCalledWith(
            9999999000,
            ['procedures', 'vaccinations', 'finished'],
            'foo.bar.baz'
          );
        });
      });
    });
  });
});
