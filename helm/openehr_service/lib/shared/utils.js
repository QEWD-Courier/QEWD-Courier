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

  16 April 2019

*/

'use strict';

const traverse = require('traverse');
const objectPath = require('object-path');
const { isNumeric } = require('./validation');

function buildCompositionId(uuid, host, version) {
  return `${uuid}::${host}::${version}`;
}

function buildSourceId(host, compositionId) {
  return `${host}-${compositionId.split('::')[0]}`;
}

function flatten(obj) {
  const flatObj = {};

  traverse(obj).map(function (node) {
    if (this.isLeaf) {
      let flatPath = '';
      let slash = '';
      let colon = '';

      const lastPathIndex = this.path.length - 1;
      const pathArr = this.path;

      pathArr.forEach(function (path, index) {
        if (isNumeric(path)) {
          flatPath = flatPath + colon + path;
        } else {
          if (index === lastPathIndex && path[0] === '|' && isNumeric(pathArr[index -1])) {
            slash = '';
          }
          flatPath = flatPath + slash + path;
        }

        slash = '/';
        colon = ':';
      });

      flatObj[flatPath] = node;
    }
  });

  return flatObj;
}

function flatMap(arr, callback) {
  return arr.reduce((acc, x, i) => acc.concat(callback(x, i)), []);
}

function equals(l, r) {
  return l.toString() === r.toString();
}

function lazyLoadAdapter(target) {
  if (!target.initialise) {
    throw new Error('target must has initialise method defined.');
  }

  return new Proxy(target, {
    get: (obj, prop) => {
      if (typeof prop === 'symbol' || prop === 'inspect' || Reflect.has(obj, prop)) {
        return Reflect.get(obj, prop);
      }

      Reflect.set(obj, prop, obj.initialise(prop));

      return obj[prop];
    }
  });
}

function parseAccessToken(authorization = '') {
  return authorization.split('AccessToken ')[1];
}

function parseJsonFormatter(result) {
  let jsonResult;

  try {
    jsonResult = JSON.parse(result);
  } catch (err) {
    jsonResult = {};
  }

  return jsonResult;
}

function parseCompositionId(compositionId) {
  try {
    const [ uuid, host, version ] = compositionId.split('::');

    return {
      uuid,
      host,
      version
    };
  } catch (err) {
    return {};
  }
}

function parseSourceId(sourceId) {
  try {
    const [ source, ...others ] = sourceId.split('-');

    return {
      source,
      uuid: others.join('-')
    };
  } catch (err) {
    return {};
  }
}

function unflatten(flatObj) {
  return Object.keys(flatObj).reduce((acc, key) => {
    const paths = key.split(/:|\//).map(x => isNaN(Number(x))
      ? x
      : Number(x)
    );

    objectPath.set(acc, paths, flatObj[key]);

    return acc;
  }, {});
}

module.exports = {
  buildCompositionId,
  buildSourceId,
  flatten,
  flatMap,
  equals,
  lazyLoadAdapter,
  parseAccessToken,
  parseJsonFormatter,
  parseCompositionId,
  parseSourceId,
  unflatten
};
