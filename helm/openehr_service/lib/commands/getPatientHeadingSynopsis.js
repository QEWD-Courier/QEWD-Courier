/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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

  9 April 2019

*/

'use strict';

const { BadRequestError } = require('../errors');
const { isHeadingValid, isPatientIdValid } = require('../shared/validation');
const { Role } = require('../shared/enums');
const debug = require('debug')('helm:openehr:commands:get-patient-heading-synopsis');

class GetPatientHeadingSynopsisCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} heading
   * @param  {Object} query
   * @return {Object}
   */
  async execute(patientId, heading, query) {
    debug('patientId: %s, heading: %s, query: %j', patientId, heading, query);
    debug('role: %s', this.session.role);

    // override patientId for PHR Users - only allowed to see their own data
    if (this.session.role === Role.PHR_USER) {
      patientId = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    if (!heading) {
      throw new BadRequestError('Heading missing or empty');
    }

    // if (heading === Heading.TOP_3_THINGS) {
    //   const { top3ThingsService } = this.ctx.services;
    //   const synopsis = top3ThingsService.getLatestSynopsisByPatientId(patientId);
    //
    //   return {
    //     heading,
    //     synopsis
    //   };
    //
    // }

    const headingValid = isHeadingValid(this.ctx.headingsConfig, heading);
    if (!headingValid.ok) {
      return [];
    }

    const { headingService } = this.ctx.services;
    const result = await headingService.fetchOne(patientId, heading);
    if (!result.ok) {
      debug('No results could be returned from the OpenEHR servers for heading %s', heading);

      return [];
    }

    debug('heading %s for %s is cached', heading, patientId);

    const synopsisConfig = this.ctx.synopsisConfig;
    debug('synopsis config: %j', synopsisConfig);

    const synopsisCount = query.maximum || synopsisConfig.maximum;
    debug('synopsis max count: %s', synopsisCount);

    const { results } = await headingService.getSynopsis(patientId, heading, synopsisCount);
    debug('results:%j', results);

    return {
      heading,
      synopsis: results
    };
  }
}

module.exports = GetPatientHeadingSynopsisCommand;
