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

  13 February 2018

*/

'use strict';

const transform = require('qewd-transform-json').transform;
const { logger } = require('../core');
const { ResourceFormat } = require('../shared/enums');
const { getHeadingTemplate, headingHelpers } = require('../shared/headings');
const { parseRef } = require('../shared/utils');
const debug = require('debug')('ripple-cdr-discovery:services:heading');

class HeadingService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new HeadingService(ctx);
  }

  /**
   * Gets formatted data by source id
   *
   * @param {string|number} nhsNumber
   * @param {string} heading
   * @param {string} sourceId
   * @param {string|null} format
   * @returns {Object}
   */
  getBySourceId(nhsNumber, heading, sourceId, format = ResourceFormat.PULSETILE) {
    logger.info('services/headingService|getBySourceId', { nhsNumber, heading, sourceId, format });

    const reference = sourceId.split('Discovery-')[1];
    const { resourceName, uuid } = parseRef(reference, { separator: '_' });

    const { resourceCache } = this.ctx.cache;
    const { resourceService } = this.ctx.services;

    const resource = resourceCache.byUuid.get(resourceName, uuid);
    const practitioner = resourceService.getPractitioner(resourceName, uuid);
    resource.nhsNumber = nhsNumber;
    resource.practitionerName = practitioner
      ? practitioner.name.text
      : 'Not known';

    const { source, destination } = this.ctx.getTransformationConfig(format);
    const template = getHeadingTemplate(heading, source, destination);
    const helpers = headingHelpers();
    const result = transform(template, resource, helpers);

    debug('result: %j', result);

    return result;
  }

  /**
   * Gets summary
   *
   * @param {string|number} nhsNumber
   * @param {string} heading
   * @param {string|null} format
   * @returns {Object[]}
   */
  getSummary(nhsNumber, heading, format = ResourceFormat.PULSETILE) {
    logger.info('services/headingService|getSummary', { nhsNumber, heading, format });

    const resourceName = this.ctx.headingsConfig[heading];

    const { source, destination } = this.ctx.getTransformationConfig(format);
    const template = getHeadingTemplate(heading, source, destination);
    const helpers = headingHelpers();

    const { patientCache, resourceCache } = this.ctx.cache;
    const { resourceService } = this.ctx.services;

    const results = [];
    const uuids = patientCache.byResource.getUuidsByResourceName(nhsNumber, resourceName);

    uuids.forEach((uuid) => {
      const resource = resourceCache.byUuid.get(resourceName, uuid);
      const practitioner = resourceService.getPractitioner(resourceName, uuid);

      resource.nhsNumber = nhsNumber;
      resource.practitionerName = practitioner
        ? practitioner.name.text
        : 'Not known';

      const result = transform(template, resource, helpers);
      debug('uuid: %s, result: %j', uuid, result);

      results.push(result);
    });

    return results;
  }
}

module.exports = HeadingService;
