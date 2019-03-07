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

  12 January 2018

*/

'use strict';

const { lazyLoadAdapter } = require('../shared/utils');
const logger = require('./logger');

class ServiceRegistry {
  constructor(ctx) {
    this.ctx = ctx;
  }

  initialise(id) {
    logger.info('core/services|initialise', { id });

    const Service = require(`../services/${id}`);

    if (!Service.create) {
      throw new Error(`${id} service does not support lazy load initialisation.`);
    }

    return Service.create(this.ctx);
  }

  static create(ctx) {
    return lazyLoadAdapter(new ServiceRegistry(ctx));
  }
}

module.exports = ServiceRegistry;
