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

  17 April 2019

*/

module.exports = {
  name: 'respectforms',
  textFieldName: 'dateCreated',
  headingTableFields: ['author', 'dateCreated', 'status'],

  get: {
    transformTemplate: {
      author: '{{nss_respect_form["composer|name"]}}',
      dateCreated: '=> getRippleTime(nss_respect_form.context.start_time)',
      status: '{{nss_respect_form.context.status}}'
    }
  },

  post: {
    templateId: 'RESPECT_NSS-v0',

    helperFunctions: {
      formatDate: function(date) {
        return new Date(date).toISOString();
      }
    },

    transformTemplate: {
      nss_respect_form: {
        'composer|name': '{{author}}',
        context: {
          start_time: '=> formatDate(dateCreated)',
          status: '{{status}}'
        }
      }
    }
  }
};
