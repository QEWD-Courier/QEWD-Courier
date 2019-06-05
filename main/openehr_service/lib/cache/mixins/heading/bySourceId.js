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

const { logger } = require('../../../core');
const debug = require('debug')('helm:openehr:cache:heading:bySourceId');

module.exports = (adapter) => {
  return {

    /**
     * Gets data
     *
     * @param  {string} sourceId
     * @return {Object}
     */
    get: (sourceId) => {
      logger.info('cache/headingCache|bySourceId|get', { sourceId });

      const key = ['headings', 'bySourceId', sourceId];

      return adapter.getObjectWithArrays(key);
    },

    /**
     * Sets data
     *
     * @param  {string} sourceId
     * @param  {Object} data
     * @return {void}
     */
    set: (sourceId, data) => {
      logger.info('cache/headingCache|bySourceId|set', { sourceId, data: typeof data });

      debug('data: %j', data);

      const key = ['headings', 'bySourceId', sourceId];
      adapter.putObject(key, data);
    },

    /**
     * Deletes data
     *
     * @param  {string} sourceId
     * @return {void}
     */
    delete: (sourceId) => {
      logger.info('cache/headingCache|bySourceId|delete', { sourceId });

      const key = ['headings', 'bySourceId', sourceId];
      adapter.delete(key);
    }
  };
};
