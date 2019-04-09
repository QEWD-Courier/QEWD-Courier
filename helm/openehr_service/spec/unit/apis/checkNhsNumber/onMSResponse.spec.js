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

 10 April 2019

*/

'use strict';

const mockery = require('mockery');
const { MasterMock } = require('@tests/mocks');

describe('apis/onMsResponse', () => {
  let q;
  let onMsResponse;

  let message;
  let jwt;
  let forward;
  let sendBack;

  let DiscoveryDispatcher;
  let discoveryDispatcher;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    q = new MasterMock();

    message = {
      path: '/api/openehr/check',
      status: 'loading_data',
      new_patient: true,
      nhsNumber: 9999999000,
      ewd_application: 'openehr_service',
      token: 'foo.bar.baz'
    };
    jwt = 'foo.bar.baz';
    forward = jasmine.createSpy();
    sendBack = jasmine.createSpy();

    discoveryDispatcher = jasmine.createSpyObj('discovery', ['syncAll']);
    DiscoveryDispatcher = jasmine.createSpy().and.returnValue(discoveryDispatcher);
    mockery.registerMock('../../lib/dispatchers/discovery', DiscoveryDispatcher);

    delete require.cache[require.resolve('@apis/checkNhsNumber/onMSResponse')];
    onMsResponse = require('@apis/checkNhsNumber/onMSResponse');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should do nothing when DDS missed', () => {
    delete q.userDefined.globalConfig.DDS;

    const actual = onMsResponse.call(q, message, forward, sendBack);

    expect(DiscoveryDispatcher).not.toHaveBeenCalled();
    expect(actual).toBe(false);
  });

  it('should do nothing when DDS not enabled', () => {
    q.userDefined.globalConfig.DDS.enabled = false;

    const actual = onMsResponse.call(q, message, forward, sendBack);

    expect(DiscoveryDispatcher).not.toHaveBeenCalled();
    expect(actual).toBe(false);
  });

  it('should do nothing when status is ready', () => {
    message.status = 'ready';

    const actual = onMsResponse.call(q, message, forward, sendBack);

    expect(DiscoveryDispatcher).not.toHaveBeenCalled();
    expect(actual).toBe(false);
  });

  it('should do nothing when responseNo > 1', () => {
    message.responseNo = 2;

    const actual = onMsResponse.call(q, message, forward, sendBack);

    expect(DiscoveryDispatcher).not.toHaveBeenCalled();
    expect(actual).toBe(false);
  });

  it('should sync headings using discovery dispather', () => {
    const actual = onMsResponse.call(q, message, jwt, forward, sendBack);

    expect(DiscoveryDispatcher).toHaveBeenCalledWith(q);
    expect(discoveryDispatcher.syncAll).toHaveBeenCalledWith(
      9999999000,
      ['procedures', 'vaccinations', 'finished'],
      'foo.bar.baz',
      forward
    );

    expect(actual).toBe(false);
  });
});
