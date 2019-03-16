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

const moment = require('moment-timezone');
const config = require('../config');

function format(date) {
  if (typeof date !== 'object') date = new Date(date);

  return moment(date).tz(config.timezone).format();
}

function now() {
  return format(new Date());
}

function isDST(date) {
  if (typeof date !== 'object') date = new Date(date);

  return moment(date).tz(config.timezone).isDST();
}

function toSqlPASFormat(date) {
  if (typeof date !== 'object') date = new Date(date);

  return moment(date).tz(config.timezone).format('YYYY-MM-DD');
}

function toGMT(date) {
  // if a date is in summer time, return as GMT, ie with an hour deducted
  let result = date;
  if (moment(date).tz(config.timezone).isDST()) result = new Date(date.getTime() - 3600000);

  return result;
}

function getRippleTime(date, host) {
  if (date === '') return date;

  let dt = new Date(date);
  if (host === 'ethercis') dt = toGMT(dt);

  return dt.getTime();
}

function msSinceMidnight(date, host, GMTCheck) {
  let e = new Date(date);

  if (GMTCheck) e = toGMT(e);

  return e.getTime() - e.setHours(0,0,0,0);
}

function msAtMidnight(date, host, GMTCheck) {
  let e = new Date(date);

  if (GMTCheck) e = toGMT(e);

  return e.setHours(0,0,0,0);
}

module.exports = {
  format: format,
  now: now,
  isDST: isDST,
  toGMT: toGMT,
  msSinceMidnight: msSinceMidnight,
  msAtMidnight: msAtMidnight,
  getRippleTime: getRippleTime,
  toSqlPASFormat: toSqlPASFormat
};
