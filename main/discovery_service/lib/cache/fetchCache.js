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

  11 February 2019

*/

'use strict';

const { logger } = require('../core');

class FetchCache {
  constructor(adapter) {
    this.adapter = adapter;
  }

  static create(adapter) {
    return new FetchCache(adapter);
  }

  /**
   * Checks if fetching cache exists for reference or not
   *
   * @param {string} reference
   * @return {bool}
   */
  exists(reference) {
    logger.info('cache/fetchCache|exists', { reference });

    const key = ['fetchingResource', reference];

    return this.adapter.exists(key);
  }

  /**
   * Sets fetching status for a reference
   *
   * @param {string} reference
   * @return {bool}
   */
  set(reference) {
    logger.info('cache/fetchCache|exists', { reference });

    const key = ['fetchingResource', reference];
    this.adapter.put(key, true);
  }

  /**
   * Deletes all fetching cache
   *
   * @return {void}
   */
  deleteAll() {
    logger.info('cache/fetchCache|deleteAll');

    const key = ['fetchingResource'];
    this.adapter.delete(key);
  }
}

module.exports = FetchCache;
