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

  11 May 2019

*/

'use strict';

const P = require('bluebird');
const path = require('path');
const fs = require('fs');
const { logger } = require('../core');
const { ExtraHeading } = require('../shared/enums');
const uuid = require('uuid/v4');

class SeedDispatcher {
  constructor(q) {
    this.q = q;
  }
  
  /**
   * Gets discovery data
   *
   * @private
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {string} jwt
   * @param  {Function} forward
   * @return {Promise.<Object>}
   */
  async getDiscoveryDataFromJson(patientId, heading, jwt, forward) {
    
    logger.info('dispatchers/seedDispatcher|getDiscoveryDataFromJson', { patientId, heading });
  
    if (heading === ExtraHeading.FINISHED) {
          return {
            message: {
              status: 'complete',
              results: []
            }
          };
        }
    
    return new Promise((resolve, reject) => {
      if (heading === ExtraHeading.FINISHED) {
        return resolve({
          message: {
            status: 'complete',
            results: []
          }
        });
      }
      const file = path.resolve(__dirname, `../../seeds/${heading}.json`);
      fs.readFile(file, 'utf-8', (err, data) => {
        if (err) return reject(err);
        let headingData = JSON.parse(data);
        headingData = headingData.map(v => {
          const pieces = v.sourceId.split('_');
          v.sourceId = `${pieces[0]}_${uuid()}`;
          v.patientId = patientId;
          return v;
        });
        
        return resolve(headingData);
      });
      
    });
  }
  
  /**
   * Merge discovery data in worker process
   *
   * @private
   * @param  {string|int} patientId
   * @param  {Object} heading
   * @param  {Object} data
   * @param  {string} jwt
   * @return {Promise.<Object>}
   */
  async mergeDiscoveryData(patientId, heading, data, jwt) {
    logger.info('dispatchers/seedDispatcher|mergeDiscoveryData', { patientId, heading, data });
    
    
    return new Promise((resolve, reject) => {
      const token = this.q.jwt.handlers.getProperty('uid', jwt);
      const messageObj = {
        application: 'openehr_service',
        type: 'restRequest',
        path: `/discovery/merge/${heading}`,
        pathTemplate: '/discovery/merge/:heading',
        method: 'GET',
        headers: {
          authorization: `Bearer ${jwt}`
        },
        args: {
          heading: heading
        },
        data: data,
        patientId: patientId,
        token: token
      };
      
      logger.debug('message: %j', messageObj);
      
      this.q.handleMessage(messageObj, (responseObj) => {
        logger.debug('heading %s has been merged into EtherCIS', heading);
        if (responseObj.error) return reject(responseObj);
        
        return resolve(responseObj.message);
      });
    });
  }
  
  /**
   * Sync single heading data using discovery microservice
   *
   * @private
   * @param  {array} nhsNumbers
   * @param  {string} heading
   * @param  {string} jwt
   * @param  {Function} forward
   * @return {Promise}
   */
  async sync(nhsNumbers, heading, jwt, forward) {
    logger.info('dispatchers/seedDispatcher|sync', { nhsNumbers, heading });
    
    try {
      await P.each(nhsNumbers, async (x) => {
        const discoveryData = await this.getDiscoveryDataFromJson(x.nhsNumber, heading, jwt, forward);
        await this.mergeDiscoveryData(x.nhsNumber, heading, discoveryData, jwt);
      });
    } catch (err) {
      logger.error('dispatchers/seedDispatcher|sync|err:', err);
    }
  }
  
  /**
   * Dispatches sync all headings data using discovery microservice
   *
   * @public
   * @param  {array} nhsNumbers
   * @param  {string[]} headings
   * @param  {string} jwt
   * @param  {Function} forward
   * @return {Promise}
   */
  async syncAll(nhsNumbers, headings, jwt, forward) {
    logger.info('dispatchers/seedDispatcher|syncAll', { nhsNumbers, headings, jwt });
    
    // handle each heading one at a time in sequence - this serialised processing
    // prevents EtherCIS being overwhelmed with API requests
    
    await P.each(headings, (heading) => this.sync(nhsNumbers, heading, jwt, forward));
    logger.info('discovery data loaded into EtherCIS');
  }
}

module.exports = SeedDispatcher;
