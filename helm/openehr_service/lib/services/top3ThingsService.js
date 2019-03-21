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

const uuid = require('uuid/v4');
const { logger } = require('../core');

class Top3ThingsService {
  constructor(ctx) {
    this.ctx = ctx;
    this.top3ThingsDb = this.ctx.db.top3ThingsDb;
  }

  static create(ctx) {
    return new Top3ThingsService(ctx);
  }

  /**
   * Gets latest top3 things summary by patient id
   *
   * @param  {string|int} patientId
   * @return {Object[]}
   */
  getLatestSummaryByPatientId(patientId) {
    logger.info('services/top3ThingsService|getLatestSummaryByPatientId', { patientId });

    const sourceId = this.top3ThingsDb.getLatestSourceId(patientId);
    if (!sourceId) {
      return [];
    }

    const top3Things = this.top3ThingsDb.getBySourceId(sourceId);

    return [
      {
        source: 'QEWDDB',
        sourceId: sourceId,
        dateCreated: top3Things.date,
        name1: top3Things.data.name1,
        name2: top3Things.data.name2,
        name3: top3Things.data.name3
      }
    ];
  }

  /**
   * Gets latest top3 things synopsis by patient id
   *
   * @param  {string|int} patientId
   * @return {Object[]}
   */
  getLatestSynopsisByPatientId(patientId) {
    logger.info('services/top3ThingsService|getLatestSynopsisByPatientId', { patientId });

    const sourceId = this.top3ThingsDb.getLatestSourceId(patientId);
    if (!sourceId) {
      return [];
    }

    const top3Things = this.top3ThingsDb.getBySourceId(sourceId);

    return [
      {
        sourceId: sourceId,
        text: top3Things.data.name1
      },
      {
        sourceId: sourceId,
        text: top3Things.data.name2
      },
      {
        sourceId: sourceId,
        text: top3Things.data.name3
      }
    ];
  }

  /**
   * Gets latest top3 things detail by patient id
   *
   * @param  {string|int} patientId
   * @return {Object[]}
   */
  getLatestDetailByPatientId(patientId) {
    logger.info('services/top3ThingsService|getLatestDetailByPatientId', { patientId });

    const sourceId = this.top3ThingsDb.getLatestSourceId(patientId);
    if (!sourceId) {
      return [];
    }

    const top3Things = this.top3ThingsDb.getBySourceId(sourceId);

    return {
      source: 'QEWDDB',
      sourceId: sourceId,
      dateCreated: top3Things.date,
      name1: top3Things.data.name1,
      description1: top3Things.data.description1,
      name2: top3Things.data.name2,
      description2: top3Things.data.description2,
      name3: top3Things.data.name3,
      description3: top3Things.data.description3
    };
  }

  /**
   * Creates new top3 things
   *
   * @param  {string|int} patientId
   * @param  {Object} data
   * @return {string}
   */
  create(patientId, data) {
    logger.info('services/top3ThingsService|create', { patientId, data });

    const sourceId = uuid();
    const now = new Date().getTime();

    const top3Things = {
      patientId,
      date: now,
      data
    };

    this.top3ThingsDb.insert(patientId, sourceId, top3Things);
    this.top3ThingsDb.setLatestSourceId(patientId, sourceId);

    return sourceId;
  }
}

module.exports = Top3ThingsService;
