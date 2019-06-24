/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Dmitry Solyannik <dmitry.solyannik@gmail.com>                    |
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

const template = require('qewd-template');
const { logger } = require('../core');
const { getHeadingQuery } = require('../shared/headings');

class SearchService {
  constructor(ctx) {
    this.ctx = ctx;
  }
  
  static create(ctx) {
    return new SearchService(ctx);
  }
  
  async query(host, heading, queryText) {
    
    
    const { ehrSessionService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    
    const templateId = `${heading}_search`;
    const headingQuery = getHeadingQuery(heading, { templateId });
    const { like, wildcard } = this.ctx.serversConfig[host];
    
    const subs = {
      queryText: (wildcard + queryText + wildcard) || '',
      like: like
    };
    
    const query = template.replace(headingQuery, subs);
    logger.debug('query:', { query });
    
    const ehrRestService = this.ctx.rest[host];
    const responseObj = await ehrRestService.query(sessionId, query);
    logger.debug('responseObj:', { responseObj });
    
    await ehrSessionService.stop(host, sessionId);
    
    return responseObj && responseObj.resultSet
      ? responseObj.resultSet
      : [];
  }
  
}
module.exports = SearchService;

