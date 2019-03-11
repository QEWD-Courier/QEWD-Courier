/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

  11 February 2019

*/

'use strict';

const { logger } = require('../core');
const request = require('request');
const debug = require('debug')('ripple-cdr-discovery:services:resource-rest');

function parseJsonFormatter(result) {
  let jsonResult;

  try {
    jsonResult = JSON.parse(result);
  } catch (err) {
    jsonResult = {};
  }

  return jsonResult;
}

function requestAsync(args, { formatter } = {}) {
  return new Promise((resolve, reject) => {
    request(args, (err, response, body) => {
      if (err) return reject(err);

      debug('body: %s', body);

      if (formatter) {
        return resolve(formatter(body));
      }

      return resolve(body);
    });
  });
}

/**
 * Discovery API REST service
 */
class ResourceRestService {
  constructor(ctx, hostConfig) {
    this.ctx = ctx;
    this.hostConfig = hostConfig;
  }

  static create(ctx) {
    return new ResourceRestService(ctx, ctx.serversConfig);
  }

  /**
   * Sends a request to get patients for NHS number
   *
   * @param  {int|string} nhsNumber
   * @param  {string} token
   * @return {Promise.<Object>}
   */
  async getPatients(nhsNumber, token) {
    logger.info('services/resourceRestService|getPatients', { nhsNumber, token: typeof token });

    debug('token: %s', token);

    const args = {
      url: `${this.hostConfig.api.host + this.hostConfig.api.paths.getPatientsByNHSNumber}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      qs: {
        nhsNumber: nhsNumber
      }
    };

    debug('args: %j', args);

    return requestAsync(args, { formatter: parseJsonFormatter });
  }

  /**
   * Sends a request to get resources for patients
   *
   * @param  {Object} data
   * @param  {string} token
   * @return {Promise.<Object>}
   */
  async getPatientResources(data, token) {
    logger.info('services/resourceRestService|getPatientResources', { data: typeof data, token: typeof token });

    debug('data: %j', data);
    debug('token: %s', token);

    const args = {
      url: `${this.hostConfig.api.host + this.hostConfig.api.paths.getPatientResources}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    };

    debug('args: %j', args);

    return requestAsync(args, { formatter: parseJsonFormatter });
  }

  /**
   * Sends a request to get referenced resource
   *
   * @param  {string} reference
   * @param  {string} token
   * @return {Promise.<Object>}
   */
  async getResource(reference, token) {
    logger.info('services/resourceRestService|getResource', { reference, token: typeof token });

    debug('token: %s', token);

    const args = {
      url: `${this.hostConfig.api.host + this.hostConfig.api.paths.getResource}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      qs: {
        reference: reference
      }
    };

    debug('args: %j', args);

    const result = await requestAsync(args);

    return result === ''
      ? {}
      : parseJsonFormatter(result);
  }
}

module.exports = ResourceRestService;
