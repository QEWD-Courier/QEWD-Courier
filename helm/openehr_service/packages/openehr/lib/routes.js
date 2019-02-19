/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
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

  7 February 2019

*/

'use strict';

const checkNhsNumber = require('./handlers/checkNhsNumber');
const { postFeed, putFeed, getFeedSummary, getFeedDetail } = require('./handlers/feeds');
const { getTop3ThingsSummary, getTop3ThingsDetail, postTop3Things, getTop3ThingsHscnDetail } = require('./handlers/top3Things');
const { mergeDiscoveryData, revertDiscoveryData, revertAllDiscoveryData } = require('./handlers/discovery');
const { getHeadingSummaryFields } = require('./handlers/headings');

const getMyHeadingDetail = require('./handlers/me/getHeadingDetail');
const getMyHeadingSummary = require('./handlers/me/getHeadingSummary');
const getMySynopsis = require('./handlers/me/getSynopsis');
const postMyPatientHeading = require('./handlers/me/postHeading');

const deletePatientHeading = require('./handlers/patients/deleteHeading');
const getPatientHeadingDetail = require('./handlers/patients/getHeadingDetail');
const getPatientHeadingSummary = require('./handlers/patients/getHeadingSummary');
const getPatientHeadingSynopsis = require('./handlers/patients/getHeadingSynopsis');
const getPatientSynopsis = require('./handlers/patients/getSynopsis');
const postPatientHeading = require('./handlers/patients/postHeading');
const putPatientHeading = require('./handlers/patients/putHeading');

module.exports = {
  '/api/openehr/check': {
    GET: checkNhsNumber
  },
  '/api/heading/:heading/fields/summary': {
    GET: getHeadingSummaryFields
  },
  '/api/my/heading/:heading': {
    GET: getMyHeadingSummary,
    POST: postMyPatientHeading
  },
  '/api/my/heading/:heading/:sourceId': {
    GET: getMyHeadingDetail
  },
  '/api/my/headings/synopsis': {
    GET: getMySynopsis
  },
  '/api/patients/:patientId/headings/synopsis': {
    GET: getPatientSynopsis
  },
  '/api/patients/:patientId/synopsis/:heading': {
    GET: getPatientHeadingSynopsis
  },
  '/api/patients/:patientId/top3Things': {
    POST: postTop3Things,
    GET: getTop3ThingsSummary
  },
  '/api/patients/:patientId/top3Things/:sourceId': {
    PUT: postTop3Things,
    GET: getTop3ThingsDetail
  },
  '/api/hscn/:site/top3Things/:patientId': {
     GET: getTop3ThingsHscnDetail
  },
  '/api/patients/:patientId/:heading': {
    GET:  getPatientHeadingSummary,
    POST: postPatientHeading
  },
  '/api/patients/:patientId/:heading/:sourceId': {
    GET: getPatientHeadingDetail,
    PUT: putPatientHeading,
    DELETE: deletePatientHeading
  },
  '/api/feeds': {
    GET: getFeedSummary,
    POST: postFeed
  },
  '/api/feeds/:sourceId': {
    GET: getFeedDetail,
    PUT: putFeed
  },
  '/discovery/merge/:heading': {
    GET: mergeDiscoveryData
  },
  '/api/discovery/revert/:patientId/:heading': {
    DELETE: revertDiscoveryData
  },
  '/api/discovery/revert/all': {
    DELETE: revertAllDiscoveryData
  }
};

