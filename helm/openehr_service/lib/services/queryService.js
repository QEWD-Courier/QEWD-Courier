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

  16 April 2019

*/

'use strict';

const { logger } = require('../core');
const { QueryFormat } = require('../shared/enums');

class QueryService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new QueryService(ctx);
  }

  /**
   * Sends a get query
   *
   * @param  {string} host
   * @param  {string} query
   * @param  {Object} options
   * @param  {string} options.format
   * @return {Promise.<Object[]>}
   */
  async query(host, query, { format = QueryFormat.AQL } = {}) {
    logger.info('services/queryService|query', { host, query, format });

    const { ehrSessionService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);

    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.query(sessionId, query, { format });
    logger.debug('responseObj:', { responseObj });

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.resultSet
      ? responseObj.resultSet
      : [];
  }

  /**
   * Sends a post query
   *
   * @param  {string} host
   * @param  {string} query
   * @param  {Object} options
   * @param  {string} options.format
   * @return {Promise.<Object[]>}
   */
  async postQuery(host, query, { format = QueryFormat.AQL } = {}) {
    logger.info('services/queryService|postQuery', { host, query, format });

    const { ehrSessionService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);

    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.postQuery(sessionId, query, { format });
    logger.debug('responseObj:', { responseObj });

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.resultSet
      ? responseObj.resultSet
      : [];
  }
}

module.exports = QueryService;
