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

  25 January 2019

*/

'use strict';

const { lazyLoadAdapter } = require('../../lib/shared/utils');

function getMethods(id, dir) {
  const Target = require(`../../lib/${dir}/${id}`);

  return Reflect
    .ownKeys(Target.prototype)
    .filter(x => x !== 'constructor');
}

function getMixins(id, dir) {
  try {
    const name = id.split(/(?=[A-Z])/g)[0];
    const mixins = require(`../../lib/${dir}/mixins/${name}`);

    return mixins;
  } catch (err) {
    return {};
  }
}

function createSpyObj(baseName, methodNames) {
  // methodNames must contain at least one method defined
  // otherwise target be undefined
  if (methodNames.length === 0) {
    methodNames.push(Date.now().toString());
  }

  return jasmine.createSpyObj(baseName, methodNames);
}

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
