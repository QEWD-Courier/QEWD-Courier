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

  12 February 2019

*/

'use strict';

function getHeadingTemplate(headingName, source, destination) {
  return require(`../../templates/${headingName}/${source}_to_${destination}.json`);
}

function headingHelpers() {
  const helpers = {
    getUid: function(uid, host) {
      return host + '-' + uid.split('::')[0];
    },
    fhirDateTime: (d) => {
      return new Date(d).toISOString();
    },
    convertToString: (input) => {
      return input.toString();
    },
    useSnomed: function(arr, property) {
      var obj;
      var value = '';
      for (var i = 0; i < arr.length; i++) {
        obj = arr[i];
        if (obj.system && obj.system.indexOf('snomed') !== -1) {
          if (obj[property]) {
            value = obj[property];
            break;
          }
        }
      }

      return value.toString();
    }
  };

  return helpers;
}

module.exports = {
  getHeadingTemplate,
  headingHelpers
};
