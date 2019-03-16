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

const path = require('path');
const fs = require('fs');
const dateTime = require('./dateTime');
const debug = require('debug')('helm:openehr:shared:headings');

const headings = {};
const aql = {};

function getHeadingDir() {
  return process.env.NODE_ENV === 'test'
    ? '../../spec/fixtures/headings'
    : '../../headings';
}

function loadHeadingModule(heading) {
  debug('loading heading: %s', heading);

  const headingsDir = getHeadingDir();

  try {
    return require(`${headingsDir}/${heading}/${heading}`);
  } catch (err) {
    debug('error loading heading %s module: %s', heading, err);
  }
}

function headingHelpers(host, heading, method = 'get') {

  const helpers = {
    now: function() {
      return dateTime.now();
    },
    getRippleTime: function(date) {
      return dateTime.getRippleTime(date, host);
    },
    msAtMidnight: function(date) {
      return dateTime.msAtMidnight(date, host, true);
    },
    msSinceMidnight: function(date) {
      const d = new Date(date).getTime() - 3600000;
      return dateTime.msSinceMidnight(d, host, true);
    },
    msAfterMidnight: function(date) {
      const d = new Date(date).getTime();
      return dateTime.msSinceMidnight(d, host);
    },
    getSource: function() {
      return host;
    },
    getCountsSource: function() {
      return host + '-counts';
    },
    getUid: function(uid) {
      return uid.split('::')[0];
    },
    integer: function(value) {
      return parseInt(value, 10);
    }
  };

  // augment with heading-specific helper methods

  if (!headings[heading]) {
    headings[heading] = loadHeadingModule(heading);
  }

  if (headings[heading][method] && headings[heading][method].helperFunctions) {
    const helperFunctions = headings[heading][method].helperFunctions;
    Object.keys(helperFunctions).forEach((name) => {
      helpers[name] = helperFunctions[name];
    });
  }

  return helpers;
}

function getHeadingAql(heading) {
  if (!aql[heading]) {
    const headingsDir = getHeadingDir();
    const filename = path.join(__dirname, `${headingsDir}/${heading}/${heading}.aql`);
    debug('loading aql file: %s', filename);
    aql[heading] = fs.existsSync(filename)
      ? fs.readFileSync(filename).toString().split(/\r?\n/).join(' ')
      : '';
  }

  return aql[heading];
}

function getHeadingDefinition(heading) {
  if (!headings[heading]) {
    headings[heading] = loadHeadingModule(heading);
  }

  return headings[heading];
}

function getHeadingMap(heading, method = 'get') {
  if (!headings[heading]) {
    headings[heading] = loadHeadingModule(heading);
  }

  return headings[heading] && headings[heading][method];
}

module.exports = {
  headingHelpers,
  getHeadingAql,
  getHeadingDefinition,
  getHeadingMap
};
