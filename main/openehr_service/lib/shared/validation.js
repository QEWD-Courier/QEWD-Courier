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

const validUrl = require('valid-url');

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

function isFeedPayloadValid(payload) {
  if (!payload.author || payload.author === '') {
    return respondErr('Author missing or empty');
  }

  if (!payload.name || payload.name === '') {
    return respondErr('Feed name missing or empty');
  }

  if (!payload.landingPageUrl || payload.landingPageUrl === '') {
    return respondErr('Landing page URL missing or empty');
  }

  if (!validUrl.isWebUri(payload.landingPageUrl)) {
    return respondErr('Landing page URL is invalid');
  }

  if (!payload.rssFeedUrl || payload.rssFeedUrl === '') {
    return respondErr('RSS Feed URL missing or empty');
  }

  if (!validUrl.isWebUri(payload.rssFeedUrl)) {
    return respondErr('RSS Feed URL is invalid');
  }

  return {
    ok: true
  };
}

function isEmpty(obj) {
  if (!obj) return true;
  if (typeof obj !== 'object') return true;

  for (let name in obj) {
    if (obj.hasOwnProperty(name)) {
      return false;
    }
  }

  return true;
}

function isTop3ThingsPayloadValid(payload) {
  if (!payload.name1 || payload.name1 === '') {
    return respondErr('You must specify at least 1 Top Thing');
  }

  if (!payload.description1 || payload.description1 === '') {
    return respondErr('You must specify at least 1 Top Thing');
  }

  if (!payload.name2 || payload.name2 === '') {
    if (payload.description2 && payload.description2 !== '') {
      return respondErr('A Description for the 2nd Top Thing was defined, but its summary name was not defined');
    }
    payload.name2 = '';
    payload.description2 = '';
  } else {
    payload.description2 = payload.description2 || '';
  }

  if (!payload.name3 || payload.name3 === '') {
    if (payload.description3 && payload.description3 !== '') {
      return respondErr('A Description for the 3rd Top Thing was defined, but its summary name was not defined');
    }
    payload.name3 = '';
    payload.description3 = '';
  } else {
    payload.description3 = payload.description3 || '';
  }

  return {
    ok: true
  };
}

/**
 * Returns true if heading valid. Otherwise returns an error
 *
 * @param  {Object}  headingsConfig
 * @param  {string}  heading
 * @return {Boolean}
 */
function isHeadingValid(headingsConfig, heading) {
  if (!heading || !headingsConfig[heading]) {
    return respondErr(`Invalid or missing heading: ${heading}`);
  }

  return {
    ok: true
  };
}

function isGuid(s) {
  const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return regexGuid.test(s);
}

/**
 * Returns true if site valid. Otherwise returns error
 *
 * @param  {Object}  sitesConfig
 * @param  {string}  site
 * @return {Boolean}
 */
function isSiteValid(sitesConfig, site) {
  if (!site || !sitesConfig[site]) {
    return respondErr('Invalid site');
  }

  return {
    ok: true
  };
}

function isSourceIdValid(sourceId) {
  if (!sourceId) return respondErr(`sourceId ${sourceId} must be defined`);

  const pieces = sourceId.split('-');
  if (pieces.length !== 6) return respondErr(`sourceId ${sourceId} is invalid`);

  // remove host name element
  pieces.shift();

  const guid = pieces.join('-');
  if (!isGuid(guid)) return respondErr(`sourceId ${sourceId} is invalid`);

  return {
    ok: true
  };
}

module.exports = {
  isNumeric,
  isPatientIdValid,
  isFeedPayloadValid,
  isEmpty,
  isTop3ThingsPayloadValid,
  isHeadingValid,
  isGuid,
  isSiteValid,
  isSourceIdValid,
  respondErr
};
