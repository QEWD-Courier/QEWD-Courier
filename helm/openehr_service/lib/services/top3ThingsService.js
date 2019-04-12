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

  12 April 2019

*/

'use strict';

const uuid = require('uuid/v4');
const { logger } = require('../core');
const P = require('bluebird');
const { Heading, Top3ThingFormat } = require('../shared/enums');
const { UnprocessableEntityError } = require('../errors');
const { headingHelpers, getHeadingMap } = require('../shared/headings');
const { transform } = require('qewd-transform-json');

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

  /**
   * @TODO Need to think about refactoring this method to style of all architecture concept
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {int} limit
   * @returns {Promise<*[]>}
   */
  async getLatestTop3ThingsSynopsis(patientId, heading) {
    logger.info('services/headingService|getSynopsis', { patientId, heading});
    const { headingService } = this.ctx.services;

    const { results } = await headingService.getSummary(patientId, heading);

    return this.formatResultTop3ThingsLatest(results, Top3ThingFormat.LATEST);
  }

  async getLatest(patientId, heading) {
    const { headingService } = this.ctx.services;
    const host = this.ctx.defaultHost;

    const top3Things = await headingService.query(host, patientId, heading);
    if (top3Things && top3Things.length === 0) {
      return [];
    }

    const transformData = await P.mapSeries(top3Things, x => this.transformTop3ThingsHscn(x, host));
    const result = this.formatResultTop3ThingsLatest(transformData, Top3ThingFormat.HSCN);

    return result;
  }

  /**
   * @TODO Need to think about refactoring this method to style of all architecture concept
   * Transform data for top3things
   * @param {object} record
   * @param {string} host
   * @returns {Promise<void>}
   */
  async transformTop3ThingsHscn(record, host) {
    const heading = Heading.TOP_3_THINGS;
    const helpers = headingHelpers(host, heading, 'get');
    const headingMap = getHeadingMap(heading, 'get');

    if (!headingMap) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no GET definition available`);
    }

    return transform(headingMap.transformTemplate, record, helpers);
  }


  /**
   * @TODO Need to think about refactoring this method to style of all architecture concept
   * Get the latest data from array
   * @param {array} result
   * @param {string} format
   * @returns {*}
   */
  formatResultTop3ThingsLatest(result, format) {
    if (result && result.length === 0) {
      return [];
    }

    let data = result.sort((n, p) => new Date(p.dateCreated).getTime() - new Date(n.dateCreated).getTime())[0];

    return format === Top3ThingFormat.LATEST ? [
      {
        sourceId: data.sourceId,
        text: data.name1
      }, {
        sourceId: data.sourceId,
        text: data.name2
      }, {
        sourceId: data.sourceId,
        text: data.name3
      }
    ] : format === Top3ThingFormat.HSCN ? {
      source: data.source,
      sourceId: data.sourceId,
      dateCreated: data.dateCreated,
      name1: data.name1,
      description1: data.description1,
      name2: data.name2,
      description2: data.description2,
      name3: data.name3,
      description3: data.description3,
    } : [];
  }
}

module.exports = Top3ThingsService;
