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

  16 March 2019

*/

'use strict';

const { lazyLoadAdapter } = require('../shared/utils');
const NullCacheAdapter = require('./nullAdapter');
const QewdCacheAdapter = require('./qewdAdapter');
const logger = require('./logger');

class CacheRegistry {
  constructor(ctx) {
    this.ctx = ctx;
    this.adapter = ctx.qewdSession
      ? new QewdCacheAdapter(ctx.qewdSession)
      : new NullCacheAdapter;
  }

  initialise(id) {
    logger.info('core/cache|initialise', { id });

    const Cache = require(`../cache/${id}`);

    if (!Cache.create) {
      throw new Error(`${id} cache class does not support lazy load initialisation.`);
    }

    return Cache.create(this.adapter);
  }

  static create(ctx) {
    return lazyLoadAdapter(new CacheRegistry(ctx));
  }
}

module.exports = CacheRegistry;

