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

const request = require('request');
const config = require('../config');
const logger = require('../core/logger');
const debug = require('debug')('helm:openehr:services:ehr-rest');

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) return reject(err);

      return resolve(body);
    });
  });
}

// NOTE: Ehr-Session header must capitalized

class EhrRestService {
  constructor(ctx, host, hostConfig) {
    this.ctx = ctx;
    this.host = host;
    this.hostConfig = hostConfig;
  }

  /**
   * Sends a request to start a new session
   *
   * @return {Promise.<Object>}
   */
  async startSession() {
    logger.info(`services/ehrRestService|${this.host}|startSession`);

    const options = {
      url: `${this.hostConfig.url}/rest/v1/session`,
      method: 'POST',
      qs: {
        username: this.hostConfig.username,
        password: this.hostConfig.password
      },
      headers: {
        'x-max-session': config.openehr.sessionMaxNumber,
        'x-session-timeout': config.openehr.sessionTimeout
      },
      json: true
    };

    return await requestAsync(options);
  }

  /**
   * Sends a request to expire existing session
   *
   * @param  {string} sessionId
   * @return {Promise}
   */
  async stopSession(sessionId) {
    logger.info(`services/ehrRestService|${this.host}|stopSession`, { sessionId });

    const options = {
      url: `${this.hostConfig.url}/rest/v1/session`,
      method: 'DELETE',
      headers: {
        'Ehr-Session': sessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  /**
   * Sends a request to get Ehr Id
   *
   * @param  {string} sessionId
   * @param  {string|int} patientId
   * @return {Promise.<string>}
   */
  async getEhr(sessionId, patientId) {
    logger.info(`services/ehrRestService|${this.host}|getEhr`, { sessionId, patientId });

    const options = {
      url: `${this.hostConfig.url}/rest/v1/ehr`,
      method: 'GET',
      qs: {
        subjectId: patientId,
        subjectNamespace: 'uk.nhs.nhs_number'
      },
      headers: {
        'Ehr-Session': sessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  /**
   * Sends a request to create Ehr Id
   *
   * @param  {string} sessionId
   * @param  {string|int} patientId
   * @return {Promise.<string>}
   */
  async postEhr(sessionId, patientId) {
    logger.info(`services/ehrRestService|${this.host}|getEhr`, { sessionId, patientId });

    const options = {
      url: `${this.hostConfig.url}/rest/v1/ehr`,
      method: 'POST',
      qs: {
        subjectId: patientId,
        subjectNamespace: 'uk.nhs.nhs_number'
      },
      body: {
        subjectId: patientId,
        subjectNamespace: 'uk.nhs.nhs_number',
        queryable: 'true',
        modifiable: 'true'
      },
      headers: {
        'Ehr-Session': sessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  /**
   * Sends a request to create a new heading record
   *
   * @param  {string} sessionId
   * @param  {string} ehrId
   * @param  {string} templateId
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async postHeading(sessionId, ehrId, templateId, data) {
    logger.info(`services/ehrRestService|${this.host}|postEhr`, { sessionId, ehrId, templateId, data: typeof data });

    debug('data: %j', data);

    const options = {
      url: `${this.hostConfig.url}/rest/v1/composition`,
      method: 'POST',
      qs: {
        templateId: templateId,
        ehrId: ehrId,
        format: 'FLAT'
      },
      body: data,
      headers: {
        'Ehr-Session': sessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  /**
   * Sends a request to update an existing heading record
   *
   * @param  {string} sessionId
   * @param  {string} compositionId
   * @param  {string} templateId
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async putHeading(sessionId, compositionId, templateId, data) {
    logger.info(`services/ehrRestService|${this.host}|putHeading`, { sessionId, compositionId, templateId, data: typeof data });

    debug('data: %j', data);

    const options = {
      url: `${this.hostConfig.url}/rest/v1/composition/${compositionId}`,
      method: 'PUT',
      qs: {
        templateId: templateId,
        format: 'FLAT'
      },
      body: data,
      headers: {
        'Ehr-Session': sessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  /**
   * Sends a request to retrieve heading records
   *
   * @param  {string} sessionId
   * @param  {string} query
   * @return {Promise.<Object[]>}
   */
  async query(sessionId, query) {
    logger.info(`services/ehrRestService|${this.host}|query`, { sessionId, query });

    const options = {
      url: `${this.hostConfig.url}/rest/v1/query`,
      method: 'GET',
      qs: {
        aql: query
      },
      headers: {
        'Ehr-Session': sessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  /**
   * Sends a request to delete an existing heading record
   *
   * @param  {string} sessionId
   * @param  {string} compositionId
   * @return {Promise.<Object>}
   */
  async deleteHeading(sessionId, compositionId) {
    logger.info(`services/ehrRestService|${this.host}|deleteHeading`, { sessionId, compositionId });

    const options = {
      url: `${this.hostConfig.url}/rest/v1/composition/${compositionId}`,
      method: 'DELETE',
      headers: {
        'Ehr-Session': sessionId
      },
      json: true
    };

    return await requestAsync(options);
  }
}

module.exports = EhrRestService;
