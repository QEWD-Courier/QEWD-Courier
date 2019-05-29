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

  27 March 2019

*/

'use strict';

exports.uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

exports.clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

exports.isUuidV4 = function (s) {
  return exports.uuidV4Regex.test(s);
};

exports.getMethods = function (id, dir) {
  const Target = require(`@lib/${dir}/${id}`);

  return Reflect
    .ownKeys(Target.prototype)
    .filter(x => x !== 'constructor');
};

exports.getMixins = function (id, dir) {
  try {
    const name = id.split(/(?=[A-Z])/g).slice(0, -1).join('');
    const mixins = require(`@lib/${dir}/mixins/${name}`);

    return mixins;
  } catch (err) {
    return {};
  }
};

exports.createSpyObj = function (baseName, methodNames) {
  // methodNames must contain at least one method defined
  // otherwise target be undefined
  if (methodNames.length === 0) {
    methodNames.push(Date.now().toString());
  }

  return jasmine.createSpyObj(baseName, methodNames);
};
