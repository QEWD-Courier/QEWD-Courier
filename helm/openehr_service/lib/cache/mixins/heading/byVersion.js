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

  17 April 2019

*/

'use strict';

const { logger } = require('../../../core');

module.exports = (adapter) => {
  return {

    /**
     * Gets data
     *
     * @param  {string} sourceId
     * @param  {int} version
     * @return {Object}
     */
    get: (sourceId, version) => {
      logger.info('cache/headingCache|byVersion|get', { sourceId, version });

      const key = ['headings', 'bySourceId', sourceId, 'versions', version];

      return adapter.getObjectWithArrays(key);
    },

    /**
     * Sets data
     *
     * @param  {string} sourceId
     * @param  {int} version
     * @param  {Object} data
     * @return {void}
     */
    set: (sourceId, version, data) => {
      logger.info('cache/headingCache|byVersion|set', { sourceId, version, data });

      const key = ['headings', 'bySourceId', sourceId, 'versions', version];
      adapter.putObject(key, data);
    },

    /**
     * Deletes data
     *
     * @param  {string} sourceId
     * @param  {int} version
     * @return {void}
     */
    delete: (sourceId, version) => {
      logger.info('cache/headingCache|byVersion|delete', { sourceId, version });

      const key = ['headings', 'bySourceId', sourceId, 'versions', version];
      adapter.delete(key);
    },

    /**
     * Gets all versions
     *
     * @param  {string} sourceId
     * @return {int[]}
     */
    getAllVersions: (sourceId) => {
      logger.info('cache/headingCache|byVersion|getAllVersions', { sourceId });

      const versions = [];
      const qewdSession = adapter.qewdSession;
      const bySourceId = qewdSession.data.$(['headings', 'bySourceId', sourceId, 'versions']);

      bySourceId.forEachChild({ direction: 'reverse' }, (version) => {
        versions.push(parseInt(version, 10));
      });

      return versions;
    }
  };
};
