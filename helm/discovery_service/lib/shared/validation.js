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

function respondErr(err) {
  return {
    error: err
  };
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPatientIdValid(patientId) {
  if (!patientId || patientId === '') {
    return respondErr(`patientId ${patientId} must be defined`);
  }

  if (!isNumeric(patientId)) {
    return respondErr(`patientId ${patientId} is invalid`);
  }

  return {
    ok: true
  };
}

/**
 * Returns ok object if heading is valid. Otherwise returns error object
 *
 * @param  {Object} headingsConfig
 * @param  {string} heading
 * @return {Object}
 */
function isHeadingValid(headingsConfig, heading) {
  if (!heading || !headingsConfig[heading]) {
    return respondErr(`Invalid or missing heading: ${heading}`);
  }

  return {
    ok: true
  };
}

function isSourceIdValid(sourceId) {
  const isValid = sourceId? sourceId.indexOf('Discovery-') > -1 : false;

  return {
    ok: isValid
  };
}

module.exports = {
  isNumeric,
  isPatientIdValid,
  isHeadingValid,
  isSourceIdValid
};
