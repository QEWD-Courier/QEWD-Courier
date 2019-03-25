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

  25 March 2019

*/

'use strict';

const { logger } = require('../core');
const { byId, byPatientId, bySourceId, byVersion } = require('./mixins/patient');

/*
  QEWD Document Storage:

  RespectForm('next_id') = next id counter
  RespectForm('by_id', id, 'version', versionNo) <= data
  RespectForm('by_id', id, 'next_version')
  RespectFormIndex('by_patientId', patientId, id) = ''
  RespectFormIndex('by_uid', uid, versionNo) = id   // composition id

*/

class RespectFormDb {
  constructor(ctx) {
    this.ctx = ctx;

    this.respectForm = ctx.worker.db.use('RespectForm');
    this.respectFormIndex = ctx.worker.db.use('RespectFormIndex');

    this.byId = byId(this);
    this.byPatientId = byPatientId(this);
    this.bySourceId = bySourceId(this);
    this.byVersion = byVersion(this);
  }

  static create(ctx) {
    return new RespectFormDb(ctx);
  }

  /**
   * Gets respect form versions by patient id
   *
   * @param  {string|int} patientId
   * @return {Object[]}
   */
  getByPatientId(patientId) {
    logger.info('db/respectFormDb|getByPatientId', { patientId });

    const results = [];

    const byPatientId = this.respectFormIndex.$(['by_patientId']);
    const byId = this.respectForm.$(['by_id']);

    byPatientId.$(patientId).forEachChild((id) => {
      byId.$([id, 'version']).forEachChild((versionNo, node) => {
        const author = node.$('author').value;
        const dateCreated = node.$('dateCompleted').value;
        const status = node.$('status').value;
        const sourceId = node.$('uuid').value; // defined and added when originally posted

        results.push({
          version: versionNo,
          author: author,
          dateCreated: dateCreated,
          status: status,
          sourceId: sourceId,
          source: 'ethercis'
        });
      });
    });

    return results;
  }
}

module.exports = RespectFormDb;
