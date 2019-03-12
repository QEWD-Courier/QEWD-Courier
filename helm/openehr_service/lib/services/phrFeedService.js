/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

  1 March 2019

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
   * @return {Promise.<Object>}
   */
  async getBySourceId(sourceId) {
    logger.info('services/phrFeedService|getBySourceId', { sourceId });

    const dbData = await this.phrFeedDb.getBySourceId(sourceId);

    if (!dbData) {
      throw new NotFoundError('Invalid sourceId');
    }

    return dbData;
  }

  /**
   * Gets phr feeds by email
   *
   * @param  {string} email
   * @return {Promise.<Object[]>}
   */
  async getByEmail(email) {
    logger.info('services/phrFeedService|getByEmail', { email });

    const dbData = await this.phrFeedDb.getByEmail(email);

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
   * @param  {Object} feed
   * @return {Promise.<Object>}
   */
  async create(feed) {
    logger.info('services/phrFeedService|create', { feed });

    let dbData = null;

    dbData = await this.phrFeedDb.getByName(feed.email, feed.name);
    if (dbData) {
      return dbData.sourceId;
    }

    dbData = await this.phrFeedDb.getByLandingPageUrl(feed.email, feed.landingPageUrl);
    if (dbData) {
      return dbData.sourceId;
    }

    const sourceId = uuid();
    const now = new Date().getTime();
    dbData = {
      ...feed,
      sourceId,
      dateCreated: now
    };

    await this.phrFeedDb.insert(dbData);

    return sourceId;
  }

  /**
   * Updates an existing phr feed by source id
   *
   * @param  {Object} feed
   * @return {Promise.<Object>}
   */
  async update(sourceId, feed) {
    logger.info('services/phrFeedService|update', { sourceId, feed });

    const now = new Date().getTime();
    const dbData = {
      ...feed,
      sourceId,
      dateCreated: now
    };

    await this.phrFeedDb.update(sourceId, dbData);
  }
}

module.exports = PhrFeedService;
