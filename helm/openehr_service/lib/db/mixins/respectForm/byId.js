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

  27 March 2019

*/

'use strict';

const { logger } = require('../../../core');

module.exports = (db) => {
  return {

    /**
     * Gets next compositionid
     *
     * @return {int}
     */
    nextCompositionId() {
      logger.debug('db/respectFormDb/mixins/respectForm/byId|nextCompositionId');

      return db.respectForm.$('next_id').increment();
    },

    /**
     * Gets next version
     *
     * @param  {int} id
     * @return {int}
     */
    nextVersion(id) {
      logger.debug('db/respectFormDb/mixins/respectForm/byId|nextVersion', { id });

      return db.respectForm.$(['by_id', id, 'next_version']).increment();
    },

    /**
     * Gets data by composition id and version
     *
     * @param  {int} id
     * @param  {int} version
     * @return {Object}
     */
    get: (id, version) => {
      logger.debug('db/respectFormDb/mixins/respectForm/byId|get', { id, version });

      return db.respectForm.$(['by_id', id, 'version', version]).getDocument(true);
    },

    /**
     * Sets data by composition id and version
     *
     * @param  {int} id
     * @param  {int} version
     * @return {void}
     */
    set: (id, version, data) => {
      logger.debug('db/respectFormDb/mixins/respectForm/byId|set', { id, version, data });

      db.respectForm.$(['by_id', id, 'version', version]).setDocument(data);
    },

    /**
     * Deletes data by composition id and version
     *
     * @param  {int} id
     * @param  {int} version
     * @return {void}
     */
    delete: (id, version) => {
      logger.debug('db/respectFormDb/mixins/respectForm/byId|delete', { id, version });

      db.respectForm.$(['by_id', id, 'version', version]).delete();
    },
  };
};
