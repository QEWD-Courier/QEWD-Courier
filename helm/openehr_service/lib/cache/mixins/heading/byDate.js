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

  21 March 2019

*/

'use strict';

const { logger } = require('../../../core');

module.exports = (adapter) => {
  return {

    /**
     * Sets a relation heading by date
     *
     * @param  {string|int} patientId
     * @param  {string} heading
     * @param  {int} date
     * @param  {string} sourceId
     * @return {void}
     */
    set: (patientId, heading, date, sourceId) => {
      logger.info('cache/headingCache|byDate|set', { patientId, heading, date, sourceId });

      const key = ['headings', 'byPatientId', patientId, heading, 'byDate', date, sourceId];
      adapter.put(key, 'true');
    },

    /**
     * Deletes a relation heading by date
     *
     * @param  {string|int} patientId
     * @param  {string} heading
     * @param  {string} sourceId
     * @param  {int} date
     * @return {void}
     */
    delete: (patientId, heading, sourceId, date) => {
      logger.info('cache/headingCache|byDate|delete', { patientId, heading, sourceId, date });

      const key = ['headings', 'byPatientId', patientId, heading, 'byDate', date, sourceId];
      adapter.delete(key);
    },

    /**
     * Gets all source ids
     *
     * @param  {string|int} patientId
     * @param  {string} heading
     * @param  {Object} options
     * @param  {string} options.direction
     * @param  {int} options.limit
     * @return {string[]}
     */
    getAllSourceIds: (patientId, heading, { direction = 'reverse', limit = 0 } = {}) => {
      logger.info('cache/headingCache|byDate|getAllSourceIds', { patientId, heading, direction, limit });

      const sourceIds = [];
      const qewdSession = adapter.qewdSession;
      const byDate = qewdSession.data.$(['headings', 'byPatientId', patientId, heading, 'byDate']);

      let count = 0;

      byDate.forEachChild({direction}, (date, node) => {
        node.forEachChild((sourceId) => {
          sourceIds.push(sourceId);
          count++;

          if (limit && count === limit) return true;
        });

        if (limit && count === limit) return true;
      });

      return sourceIds;
    }
  };
};
