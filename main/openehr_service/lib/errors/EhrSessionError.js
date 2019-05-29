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

  16 March 2019

*/

'use strict';

function EhrSessionError(message, userMessage, reason, meta, statusCode, code) {
  this.message = message || 'Unable to establish a session';
  this.stack = new Error().stack;
  this.errorType = this.name;
  this.statusCode = statusCode || 500;
  this.code = code || 'ServerError';
  this.userMessage = userMessage || this.message;
  this.meta = meta;
  this.reason = reason;
}

EhrSessionError.prototype = Object.create(Error.prototype);
EhrSessionError.prototype.name = 'EhrSessionError';

module.exports = EhrSessionError;
