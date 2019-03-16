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

describe('utils/jumper/lib/buildRippleToOpenEHR', () => {
  let buildRippleToOpenEHR;
  let buildInverse;
  let jumperPath;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    jumperPath = '/path/to/jumper/templates/allergies';

    buildInverse = jasmine.createSpy();
    mockery.registerMock('./buildInverse', buildInverse);

    delete require.cache[require.resolve('@jumper/buildRippleToOpenEHR')];
    buildRippleToOpenEHR = require('@jumper/buildRippleToOpenEHR');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should build inverse with correct parameters', () => {
    buildRippleToOpenEHR(jumperPath);
    expect(buildInverse).toHaveBeenCalledWith(
      'openEHR_to_Ripple.json',
      'Ripple_to_OpenEHR.json',
      jumperPath
    );
  });
});
