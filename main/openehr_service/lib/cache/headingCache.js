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

  15 April 2019

*/

'use strict';

const { logger } = require('../core');
const { byDate, byHeading, byHost, bySourceId, byVersion, fetchCount } = require('./mixins/heading');

class HeadingCache {
  constructor(adapter) {
    this.adapter = adapter;
    this.byDate = byDate(adapter);
    this.byHeading = byHeading(adapter);
    this.byHost = byHost(adapter);
    this.bySourceId = bySourceId(adapter);
    this.byVersion = byVersion(adapter);
    this.fetchCount = fetchCount(adapter);
  }

  static create(adapter) {
    return new HeadingCache(adapter);
  }

  /**
   * Deletes heading cache
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @return {void}
   */
  deleteAll(host, patientId, heading) {
    logger.info('cache/headingCache|deleteAll', { host, patientId, heading });

    const qewdSession = this.adapter.qewdSession;
    const byPatientHeading = qewdSession.data.$(['headings', 'byPatientId', patientId, heading]);

    if (byPatientHeading.exists) {
      const byDate = byPatientHeading.$('byDate');
      const bySourceId = qewdSession.data.$(['headings', 'bySourceId']);

      byPatientHeading.$(['byHost', host]).forEachChild((sourceId, node) => {
        const date = bySourceId.$([sourceId, 'date']).value;
        bySourceId.$(sourceId).delete();
        byDate.$([date, sourceId]).delete();
        node.delete();
      });
    }
  }
}

module.exports = HeadingCache;
