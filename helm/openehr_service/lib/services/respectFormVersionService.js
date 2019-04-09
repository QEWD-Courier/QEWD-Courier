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

  27 March 2019

*/

'use strict';

const uuid = require('uuid/v4');
const { logger } = require('../core');
const { respondErr } = require('../shared/validation');

class RespectFormVersionService {
  constructor(ctx) {
    this.ctx = ctx;
    this.respectFormDb = this.ctx.db.respectFormDb;
  }

  static create(ctx) {
    return new RespectFormVersionService(ctx);
  }

  /**
   * Gets respect form versions by patient id
   *
   * @param  {string|int} patientId
   * @return {Object[]}
   */
  getByPatientId(patientId) {
    logger.info('services/respectFormVersionService|getByPatientId', { patientId });

    return this.respectFormDb.getByPatientId(patientId);
  }

  /**
   * Validates get
   *
   * @param  {int|string} patientId
   * @param  {string} sourceId
   * @param  {int} version
   * @return {Object}
   */
  validateGet(patientId, sourceId, version) {
    logger.info('services/respectFormVersionService|validateGet', { patientId, sourceId, version });

    if (!this.respectFormDb.byPatientId.exists(patientId)) {
      return respondErr('The selected patient does not have any Respect Forms');
    }

    if (!this.respectFormDb.bySourceId.exists(sourceId)) {
      return respondErr('The specified sourceId does not exist');
    }

    if (!this.respectFormDb.byVersion.exists(sourceId, version)) {
      return respondErr('The specified sourceId and version does not exist');
    }

    return {
      ok: true
    };
  }

  /**
   * Gets respect form version
   *
   * @param  {string} sourceId
   * @param  {int} version
   * @return {Object[]}
   */
  get(sourceId, version) {
    logger.info('services/respectFormVersionService|get', { sourceId, version });

    const compositionId = this.respectFormDb.byVersion.getCompositionId(sourceId, version);
    const data = this.respectFormDb.byId.get(compositionId, version);

    return data;
  }

  /**
   * Validates create
   *
   * @param  {int|string} patientId
   * @param  {string} sourceId
   * @return {Object}
   */
  validateCreate(patientId, sourceId) {
    logger.info('services/respectFormVersionService|validateCreate', { patientId, sourceId });

    if (!this.respectFormDb.byPatientId.exists(patientId)) {
      return respondErr('The selected patient does not have any Respect Forms');
    }

    if (!this.respectFormDb.bySourceId.exists(sourceId)) {
      return respondErr('The specified sourceId does not exist');
    }

    return {
      ok: true
    };
  }

  /**
   * Creates a new respect form version
   *
   * @param  {int|string} patientId
   * @param  {string} sourceId
   * @param  {Object} data
   * @return {Object}
   */
  create(patientId, sourceId, data) {
    logger.info('services/respectFormVersionService|create', { patientId, sourceId, data });

    const compositionId = sourceId
      ? this.respectFormDb.bySourceId.getCompositionId(sourceId)
      : this.respectFormDb.byId.nextCompositionId();
    const version = this.respectFormDb.byId.nextVersion(compositionId);

    data.uuid = sourceId || uuid();
    data.patientId = patientId;

    this.respectFormDb.byId.set(compositionId, version, data);
  }

  /**
   * Validates update
   *
   * @param  {int|string} patientId
   * @param  {string} sourceId
   * @param  {int} version
   * @return {Object}
   */
  validateUpdate(patientId, sourceId, version) {
    logger.info('services/respectFormVersionService|validateUpdate', { patientId, sourceId, version });

    if (!this.respectFormDb.byPatientId.exists(patientId)) {
      return respondErr('The selected patient does not have any Respect Forms');
    }

    if (!this.respectFormDb.bySourceId.exists(sourceId)) {
      return respondErr('The specified sourceId does not exist');
    }

    if (!this.respectFormDb.byVersion.exists(sourceId, version)) {
      return respondErr('The specified sourceId and version does not exist');
    }

    return {
      ok: true
    };
  }

  /**
   * Updates existing respect form version
   *
   * @param  {int|string} patientId
   * @param  {string} sourceId
   * @param  {string} version
   * @param  {Object} data
   * @return {Object}
   */
  update(patientId, sourceId, version, data) {
    logger.info('services/respectFormVersionService|update', { patientId, sourceId, version, data });

    const compositionId = this.respectFormDb.byVersion.getCompositionId(sourceId, version);

    data.uuid = sourceId;
    data.patientId = patientId;

    // just in case - so old data isn't merged
    this.respectFormDb.byId.delete(compositionId, version);
    this.respectFormDb.byId.set(compositionId, version, data);
  }
}

module.exports = RespectFormVersionService;
