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

const uuid = require('uuid/v4');
const { logger } = require('../core');
const { BadRequestError } = require('../errors');

class RespectFormVersionService {
  constructor(ctx) {
    this.ctx = ctx;
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

    const { respectFormDb } = this.ctx.db;

    return respectFormDb.getByPatientId(patientId);
  }

  /**
   * Gets respect form version
   *
   * @param  {string|int} patientId
   * @param  {string} sourceId
   * @param  {int} version
   * @return {Object[]}
   */
  get(patientId, sourceId, version) {
    logger.info('services/respectFormVersionService|get', { patientId, sourceId, version });

    const { respectFormDb } = this.ctx.db;

    if (!respectFormDb.byPatientId.exists(patientId)) {
      throw new BadRequestError('The selected patient does not have any Respect Forms');
    }

    if (!respectFormDb.bySourceId.exists(sourceId)) {
      throw new BadRequestError('The specified sourceId does not exist');
    }

    if (!respectFormDb.byVersion.exists(sourceId, version)) {
      throw new BadRequestError('The specified sourceId and version does not exist');
    }

    const compositionId = respectFormDb.byVersion.getCompositionId(sourceId, version);
    const data = respectFormDb.byId.get(compositionId, version);

    return data;
  }

  create(patientId, data) {
    logger.info('services/respectFormVersionService|create', { patientId, data });

    const { respectFormDb } = this.ctx.db;

    const compositionId = respectFormDb.byId.nextId();
    const version = respectFormDb.byId.nextVersion(compositionId);

    data.uuid = uuid();
    data.patientId = patientId;

    respectFormDb.byId.set(compositionId, version, data);
  }


  create2(patientId, sourceId, data) {
    logger.info('services/respectFormVersionService|create2', { patientId, sourceId, data });

    const { respectFormDb } = this.ctx.db;

    if (!respectFormDb.byPatientId.exists(patientId)) {
      throw new BadRequestError('The selected patient does not have any Respect Forms');
    }

    if (!respectFormDb.bySourceId.exists(sourceId)) {
      throw new BadRequestError('The specified sourceId does not exist');
    }

    const compositionId = respectFormDb.byVersion.getCompositionIdBySourceId(sourceId);
    const version = respectFormDb.byId.nextVersion(compositionId);

    data.uuid = sourceId;
    data.patientId = patientId;

    respectFormDb.byId.set(compositionId, version, data);
  }

  update(patientId, sourceId, version, data) {
    logger.info('services/respectFormVersionService|update', { patientId, sourceId, version, data });

    const { respectFormDb } = this.ctx.db;

    if (!respectFormDb.byPatientId.exists(patientId)) {
      throw new BadRequestError('The selected patient does not have any Respect Forms');
    }

    if (!respectFormDb.bySourceId.exists(sourceId)) {
      throw new BadRequestError('The specified sourceId does not exist');
    }

    if (!respectFormDb.byVersion.exists(sourceId, version)) {
      throw new BadRequestError('The specified sourceId and version does not exist');
    }

    const compositionId = respectFormDb.byVersion.getCompositionId(sourceId, version);

    data.uuid = sourceId;
    data.patientId = patientId;

    // just in case - so old data isn't merged
    respectFormDb.byId.delete(compositionId, version);
    respectFormDb.byId.set(compositionId, version, data);
  }
}

module.exports = RespectFormVersionService;
