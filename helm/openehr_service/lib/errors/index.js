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

const BadRequestError = require('./BadRequestError');
const EhrIdNotFoundError = require('./EhrIdNotFoundError');
const EhrSessionError = require('./EhrSessionError');
const ForbiddenError = require('./ForbiddenError');
const NotFoundError = require('./NotFoundError');
const UnprocessableEntityError = require('./UnprocessableEntityError');

function qewdifyError(err) {
  return {
    error: err.userMessage || err.message
  };
}

function parseEthercisError(response) {
  if (response.headers['x-error-message']) {
    return {
      code: response.headers['x-error-code'],
      message: response.headers['x-error-message']
    };
  }

  if (response.body && typeof response.body === 'string' && response.body.substring(0, 6) === '<html>') {
    return {
      message: response.body
    };
  }

  return null;
}

function getResponseError(err = new Error('Unknown error')) {
  const resultError = err.error ? err : qewdifyError(err);

  return resultError;
}

module.exports = {
  BadRequestError,
  EhrIdNotFoundError,
  EhrSessionError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
  getResponseError,
  parseEthercisError,
  qewdifyError
};
