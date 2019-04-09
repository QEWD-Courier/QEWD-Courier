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
     * Checks if source id and version exists
     *
     * @param  {string} sourceId
     * @return {bool}
     */
    exists: (sourceId, version) => {
      logger.debug('db/respectFormDb/mixins/respectForm/byVersion|exists', { sourceId, version });

      return db.respectFormIndex.$(['by_uid', sourceId, version]).exists;
    },

    /**
     * Gets composition id by source id and version
     *
     * @param  {string} sourceId
     * @param  {int} version
     * @return {int}
     */
    getCompositionId: (sourceId, version) => {
      logger.debug('db/respectFormDb/mixins/respectForm/byVersion|getCompositionId', { sourceId, version });

      return db.respectFormIndex.$(['by_uid', sourceId, version]).value;
    }
  };
};
