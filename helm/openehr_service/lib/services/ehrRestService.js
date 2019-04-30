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

  17 April 2019

*/

'use strict';

const request = require('request');
const config = require('../config');
const logger = require('../core/logger');
const { parseEthercisError } = require('../errors');
const { QueryFormat } = require('../shared/enums');
const { parseJsonFormatter } = require('../shared/utils');

/**
 * NOTE: Ehr-Session header must capitalized
 */

function requestAsync(args) {
  const hasError = ({ headers, body }) =>
    headers['x-error-message']
    || body && typeof body === 'string' && body.substring(0, 6) === '<html>';

  return new Promise((resolve, reject) => {
    logger.debug('request args: %j', args);

    request(args, (err, response, body) => {
      if (err) {
        logger.error('services/ehrRestService|err:', err);
        return reject(err);
      }

      if (hasError(response)) {
        const error = parseEthercisError(response);
        logger.error('services/ehrRestService|err:', error);
        return reject(error);
      }

      return resolve(parseJsonFormatter(body));
    });
  });
}

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

    const args = {
      url: `${this.hostConfig.url}/rest/v1/session`,
      method: 'POST',
      qs: {
        username: this.hostConfig.username,
        password: this.hostConfig.password
      },
      headers: {
        'x-max-session': config.openehr.sessionMaxNumber,
        'x-session-timeout': config.openehr.sessionTimeout
      }
    };

    return await requestAsync(args);
  }

  /**
   * Sends a request to expire existing session
   *
   * @param  {string} sessionId
   * @return {Promise}
   */
  async stopSession(sessionId) {
    logger.info(`services/ehrRestService|${this.host}|stopSession`, { sessionId });

    const args = {
      url: `${this.hostConfig.url}/rest/v1/session`,
      method: 'DELETE',
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
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

    const args = {
      url: `${this.hostConfig.url}/rest/v1/ehr`,
      method: 'GET',
      qs: {
        subjectId: patientId,
        subjectNamespace: 'uk.nhs.nhs_number'
      },
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
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

    const data = {
      subjectId: patientId,
      subjectNamespace: 'uk.nhs.nhs_number',
      queryable: 'true',
      modifiable: 'true'
    };
    const args = {
      url: `${this.hostConfig.url}/rest/v1/ehr`,
      method: 'POST',
      qs: {
        subjectId: patientId,
        subjectNamespace: 'uk.nhs.nhs_number'
      },
      body: JSON.stringify(data),
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
  }

  /**
   * Sends a request to get an existing composition
   *
   * @param  {string} sessionId
   * @param  {string} compositionId
   * @param  {string} templateId
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async getComposition(sessionId, compositionId) {
    logger.info(`services/ehrRestService|${this.host}|getComposition`, { sessionId, compositionId });

    const args = {
      url: `${this.hostConfig.url}/rest/v1/composition/${compositionId}`,
      method: 'GET',
      qs: {
        format: 'FLAT'
      },
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
  }

  /**
   * Sends a request to create a new heading composition
   *
   * @param  {string} sessionId
   * @param  {string} ehrId
   * @param  {string} templateId
   * @param  {Object} data
   * @return {Promise.<Object>}
   */
  async postComposition(sessionId, ehrId, templateId, data) {
    logger.info(`services/ehrRestService|${this.host}|postComposition`, { sessionId, ehrId, templateId, data });

    const args = {
      url: `${this.hostConfig.url}/rest/v1/composition`,
      method: 'POST',
      qs: {
        templateId: templateId,
        ehrId: ehrId,
        format: 'FLAT'
      },
      body: JSON.stringify(data),
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
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
  async putComposition(sessionId, compositionId, templateId, data) {
    logger.info(`services/ehrRestService|${this.host}|putComposition`, { sessionId, compositionId, templateId, data });

    const args = {
      url: `${this.hostConfig.url}/rest/v1/composition/${compositionId}`,
      method: 'PUT',
      qs: {
        templateId: templateId,
        format: 'FLAT'
      },
      body: JSON.stringify(data),
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
  }

  /**
   * Sends a get query request
   *
   * @param  {string} sessionId
   * @param  {string} query
   * @param  {Object} options
   * @param  {Object} options.format
   * @return {Promise.<Object[]>}
   */
  async query(sessionId, query, { format = QueryFormat.AQL } = {}) {
    logger.info(`services/ehrRestService|${this.host}|query`, { sessionId, query, format });

    const qs = {
      [format]: query
    };
    const args = {
      url: `${this.hostConfig.url}/rest/v1/query`,
      method: 'GET',
      qs: qs,
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
  }

  /**
   * Sends a post query request
   *
   * @param  {string} sessionId
   * @param  {string} query
   * @param  {Object} options
   * @param  {Object} options.format
   * @return {Promise.<Object[]>}
   */
  async postQuery(sessionId, query, { format = QueryFormat.AQL } = {}) {
    logger.info(`services/ehrRestService|${this.host}|postQuery`, { sessionId, query, format });

    const data = {
      [format]: query
    };
    const args = {
      url: `${this.hostConfig.url}/rest/v1/query`,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
  }

  /**
   * Sends a request to delete an existing heading composition
   *
   * @param  {string} sessionId
   * @param  {string} compositionId
   * @return {Promise.<Object>}
   */
  async deleteComposition(sessionId, compositionId) {
    logger.info(`services/ehrRestService|${this.host}|deleteComposition`, { sessionId, compositionId });

    const args = {
      url: `${this.hostConfig.url}/rest/v1/composition/${compositionId}`,
      method: 'DELETE',
      headers: {
        'Ehr-Session': sessionId
      }
    };

    return await requestAsync(args);
  }
}

module.exports = EhrRestService;
