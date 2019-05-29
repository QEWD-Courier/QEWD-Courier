/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
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

  26 March 2019

*/

'use strict';

const { lazyLoadAdapter } = require('@lib/shared/utils');
const { getMethods, getMixins, createSpyObj } = require('@tests/helpers/utils');

class CacheRegistryMock {
  constructor() {
    this.freezed = false;
  }

  initialise(id) {
    if (this.freezed) return;

    const methods = getMethods(id, 'cache');
    const spyObj = createSpyObj(id, methods);

    const mixins = getMixins(id, 'cache');
    Object.keys(mixins).forEach(key => {
      const mixin = mixins[key]();
      const mixinMethods = Reflect.ownKeys(mixin);

      spyObj[key] = createSpyObj(key, mixinMethods);
    });

    return spyObj;
  }

  freeze() {
    this.freezed = true;
  }

  static create() {
    return lazyLoadAdapter(new CacheRegistryMock());
  }
}

module.exports = CacheRegistryMock;
