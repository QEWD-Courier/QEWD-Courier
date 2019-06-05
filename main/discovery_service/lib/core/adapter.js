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

  12 January 2018

*/

'use strict';

const logger = require('./logger');

class QewdCacheAdapter {
  constructor(qewdSession) {
    this.qewdSession = qewdSession;
  }

  exists(key) {
    logger.debug('core/adapter|exists', { key });

    return this.qewdSession.data.$(key).exists;
  }

  get(key) {
    logger.debug('core/adapter|get', { key });

    return this.qewdSession.data.$(key).exists
      ? this.qewdSession.data.$(key).value
      : null;
  }

  getObject(key) {
    logger.debug('core/adapter|getObject', { key });

    return this.qewdSession.data.$(key).exists
      ? this.qewdSession.data.$(key).getDocument()
      : null;
  }

  getObjectWithArrays(key) {
    logger.debug('core/adapter|getObjectWithArrays', { key });

    return this.qewdSession.data.$(key).exists
      ? this.qewdSession.data.$(key).getDocument(true)
      : null;
  }

  put(key, value) {
    logger.debug('core/adapter|put', { key, value });

    this.qewdSession.data.$(key).value = value;
  }

  putObject(key, value) {
    logger.debug('core/adapter|putObject', { key, value });

    this.qewdSession.data.$(key).setDocument(value);
  }

  delete(key) {
    logger.debug('core/adapter|delete', { key });

    this.qewdSession.data.$(key).delete();
  }
}

module.exports = QewdCacheAdapter;
