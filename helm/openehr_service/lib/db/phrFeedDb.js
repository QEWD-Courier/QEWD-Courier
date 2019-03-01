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

const { logger } = require('../core');
const debug = require('debug')('ripple-cdr-openehr:db:phr-feeds');

class PhrFeedDb {
  constructor(ctx) {
    this.ctx = ctx;
    this.phrFeeds = ctx.worker.db.use('PHRFeeds');
  }

  static create(ctx) {
    return new PhrFeedDb(ctx);
  }

  /**
   * Gets phr feed by source id
   *
   * @param  {string|int} sourceId
   * @return {Object|null}
   */
  getBySourceId(sourceId) {
    logger.info('db/phrFeedDb|getBySourceId', { sourceId });

    const node = this.phrFeeds.$(['bySourceId', sourceId]);

    return node.exists ? node.getDocument() : null;
  }

  /**
   * Gets phr feed by name
   *
   * @param  {string} email
   * @param  {string} name
   * @return {Object|null}
   */
  getByName(email, name) {
    logger.info('db/phrFeedDb|getByName', { email, name });

    const byEmailNode = this.phrFeeds.$(['byEmail', email]);
    const bySourceIdNode = this.phrFeeds.$('bySourceId');

    let dbFeed = null;

    if (byEmailNode.exists) {
      byEmailNode.forEachChild((sourceId) => {
        const data = bySourceIdNode.$(sourceId).getDocument();
        if (data.name === name) {
          dbFeed = {
            ...data,
            sourceId
          };

          return true; // stop loop
        }
      });
    }

    return dbFeed;
  }

  /**
   * Gets phr feed by landing page url
   *
   * @param  {string} email
   * @param  {string} landingPageUrl
   * @return {Object|null}
   */
  getByLandingPageUrl(email, landingPageUrl) {
    logger.info('db/phrFeedDb|getByLandingPageUrl', { email, landingPageUrl });

    const byEmailNode = this.phrFeeds.$(['byEmail', email]);
    const bySourceIdNode = this.phrFeeds.$('bySourceId');

    let dbFeed = null;

    if (byEmailNode.exists) {
      byEmailNode.forEachChild((sourceId) => {
        const data = bySourceIdNode.$(sourceId).getDocument();
        if (data.landingPageUrl === landingPageUrl) {
          dbFeed = {
            ...data,
            sourceId
          };

          return true; // stop loop
        }
      });
    }

    return dbFeed;
  }

  /**
   * Gets phr feeds by email
   *
   * @param  {string} email
   * @return {Object[]}
   */
  getByEmail(email) {
    logger.info('db/phrFeedDb|getByEmail', { email });

    const byEmailNode = this.phrFeeds.$(['byEmail', email]);
    const bySourceIdNode = this.phrFeeds.$('bySourceId');

    const dbFeeds = [];
    const names = {};
    const urls = {};

    if (byEmailNode.exists) {
      byEmailNode.forEachChild((sourceId) => {
        const dbData = bySourceIdNode.$(sourceId).getDocument();

        // duplicate - delete it
        if (names[dbData.name]) {
          debug('duplicate phr feed found by name', dbData.name);
          byEmailNode.$(sourceId).delete();
          bySourceIdNode.$(sourceId).delete();
          return;
        }

        // duplicate found - delete it
        if (urls[dbData.landingPageUrl]) {
          debug('duplicate phr feed found by landing page url', dbData.landingPageUrl);
          byEmailNode.$(sourceId).delete();
          bySourceIdNode.$(sourceId).delete();
          return;
        }

        names[dbData.name] = true;
        urls[dbData.landingPageUrl] = true;

        dbFeeds.push({
          ...dbData,
          sourceId
        });
      });
    }

    return dbFeeds;
  }

  /**
   * Inserts a new db record
   *
   * @param  {Object} data
   * @return {void}
   */
  insert(data) {
    logger.info('db/phrFeedDb|insert', { data });

    this.phrFeeds.$(['byEmail', data.email, data.sourceId]).value = 'true';
    this.phrFeeds.$(['bySourceId', data.sourceId]).setDocument(data);
  }

  /**
   * Updates an existing db record
   *
   * @param  {string} sourceId
   * @param  {Object} data
   * @return {void}
   */
  update(sourceId, data) {
    logger.info('db/phrFeedDb|update', { sourceId, data });

    this.phrFeeds.$(['bySourceId', sourceId]).delete();
    this.phrFeeds.$(['bySourceId', sourceId]).setDocument(data);
  }
}

module.exports = PhrFeedDb;
