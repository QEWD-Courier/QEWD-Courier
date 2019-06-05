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

  9 April 2019

*/

'use strict';

const uuid = require('uuid/v4');
const { logger } = require('../core');
const { NotFoundError } = require('../errors');

class PhrFeedService {
  constructor(ctx) {
    this.ctx = ctx;
    this.phrFeedDb = this.ctx.db.phrFeedDb;
  }

  static create(ctx) {
    return new PhrFeedService(ctx);
  }

  /**
   * Gets phr feed by source id
   *
   * @param  {string} sourceId
   * @return {Object}
   */
  getBySourceId(sourceId) {
    logger.info('services/phrFeedService|getBySourceId', { sourceId });

    const dbData = this.phrFeedDb.getBySourceId(sourceId);

    if (!dbData) {
      throw new NotFoundError('Invalid sourceId');
    }

    return dbData;
  }

  /**
   * Gets phr feeds by nhs number
   *
   * @param  {string|int} nhsNumber
   * @return {Object[]}
   */
  getByNhsNumber(nhsNumber) {
    logger.info('services/phrFeedService|getByNhsNumber', { nhsNumber });

    const dbData = this.phrFeedDb.getByNhsNumber(nhsNumber);

    return dbData.map(x =>
      ({
        name: x.name,
        landingPageUrl: x.landingPageUrl,
        rssFeedUrl: x.rssFeedUrl,
        sourceId: x.sourceId
      })
    );
  }

  /**
   * Creates a new phr feed
   *
   * @param  {string|int} nhsNumber
   * @param  {Object} feed
   * @return {Object}
   */
  create(nhsNumber, feed) {
    logger.info('services/phrFeedService|create', { nhsNumber, feed });

    let dbData = null;

    dbData = this.phrFeedDb.getByName(nhsNumber, feed.name);
    if (dbData) {
      return dbData.sourceId;
    }

    dbData = this.phrFeedDb.getByLandingPageUrl(nhsNumber, feed.landingPageUrl);
    if (dbData) {
      return dbData.sourceId;
    }

    const sourceId = uuid();
    const now = new Date().getTime();
    dbData = {
      ...feed,
      nhsNumber,
      sourceId,
      dateCreated: now
    };

    this.phrFeedDb.insert(dbData);

    return sourceId;
  }

  /**
   * Updates an existing phr feed by source id
   *
   * @param  {string|int} nhsNumber
   * @param  {string} sourceId
   * @param  {Object} feed
   * @return {void}
   */
  update(nhsNumber, sourceId, feed) {
    logger.info('services/phrFeedService|update', { nhsNumber, sourceId, feed });

    const now = new Date().getTime();
    const dbData = {
      ...feed,
      nhsNumber,
      sourceId,
      dateCreated: now
    };

    this.phrFeedDb.update(sourceId, dbData);
  }
}

module.exports = PhrFeedService;
