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

  16 March 2019

*/

'use strict';

const { BadRequestError, ForbiddenError } = require('../errors');
const { Heading, UserMode } = require('../shared/enums');
const { getHeadingDefinition } = require('../shared/headings');
const { isHeadingValid } = require('../shared/validation');
const debug = require('debug')('helm:openehr:commands:get-heading-summary-fields');

class GetHeadingSummaryFieldsCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  get blacklistHeadings() {
    return [
      Heading.FEEDS,
      Heading.TOP_3_THINGS
    ];
  }

  /**
   * @param  {string} heading
   * @return {Promise.<string[]>}
   */
  async execute(heading) {
    debug('heading: %s', heading);
    debug('user mode: %s', this.session.userMode);

    if (this.session.userMode !== UserMode.ADMIN) {
      throw new ForbiddenError('Invalid request');
    }

    if (heading && this.blacklistHeadings.includes(heading)) {
      throw new BadRequestError(`${heading} records are not maintained on OpenEHR`);
    }

    const headingValid = isHeadingValid(this.ctx.headingsConfig, heading);
    if (!headingValid.ok) {
      throw new BadRequestError(headingValid.error);
    }

    let headingConfig = this.ctx.getHeadingConfig(heading);
    if (headingConfig === true) {
      const headingDefinition = getHeadingDefinition(heading);
      headingConfig = {
        summaryTableFields: headingDefinition.headingTableFields
      };
    }

    return headingConfig.summaryTableFields;
  }
}

module.exports = GetHeadingSummaryFieldsCommand;
