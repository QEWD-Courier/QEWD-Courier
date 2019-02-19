/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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

const { flatten } = require('../../lib/shared/utils');

describe('ripple-cdr-openehr/lib/routes', () => {
  let routes;

  function resolveHandler(url, method) {
    return routes[url][method.toUpperCase()];
  }

  beforeAll(() => {
    delete require.cache[require.resolve('../../lib/routes')];
    routes = require('../../lib/routes');
  });

  it('should return correct routes count', () => {
    const expected = 25;
    const actual = Object.keys(flatten(routes)).length;
    expect(actual).toBe(expected);
  });

  it('GET /api/openehr/check', () => {
    const expected = require('../../lib/handlers/checkNhsNumber');
    const actual = resolveHandler('/api/openehr/check', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/heading/:heading/fields/summary', () => {
    const expected = require('../../lib/handlers/headings/getSummaryFields');
    const actual = resolveHandler('/api/heading/:heading/fields/summary', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/my/heading/:heading', () => {
    const expected = require('../../lib/handlers/me/getHeadingSummary');
    const actual = resolveHandler('/api/my/heading/:heading', 'GET');
    expect(actual).toBe(expected);
  });

  it('POST /api/my/heading/:heading', () => {
    const expected = require('../../lib/handlers/me/postHeading');
    const actual = resolveHandler('/api/my/heading/:heading', 'POST');
    expect(actual).toBe(expected);
  });

  it('GET /api/my/heading/:heading/:sourceId', () => {
    const expected = require('../../lib/handlers/me/getHeadingDetail');
    const actual = resolveHandler('/api/my/heading/:heading/:sourceId', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/my/headings/synopsis', () => {
    const expected = require('../../lib/handlers/me/getSynopsis');
    const actual = resolveHandler('/api/my/headings/synopsis', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/headings/synopsis', () => {
    const expected = require('../../lib/handlers/patients/getSynopsis');
    const actual = resolveHandler('/api/patients/:patientId/headings/synopsis', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/synopsis/:heading', () => {
    const expected = require('../../lib/handlers/patients/getHeadingSynopsis');
    const actual = resolveHandler('/api/patients/:patientId/synopsis/:heading', 'GET');
    expect(actual).toBe(expected);
  });

  it('POST /api/patients/:patientId/top3Things', () => {
    const expected = require('../../lib/handlers/top3Things/post');
    const actual = resolveHandler('/api/patients/:patientId/top3Things', 'POST');
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/top3Things', () => {
    const expected = require('../../lib/handlers/top3Things/getSummary');
    const actual = resolveHandler('/api/patients/:patientId/top3Things', 'GET');
    expect(actual).toBe(expected);
  });

  it('PUT /api/patients/:patientId/top3Things/:sourceId', () => {
    const expected = require('../../lib/handlers/top3Things/post');
    const actual = resolveHandler('/api/patients/:patientId/top3Things/:sourceId', 'PUT');
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/top3Things/:sourceId', () => {
    const expected = require('../../lib/handlers/top3Things/getDetail');
    const actual = resolveHandler('/api/patients/:patientId/top3Things/:sourceId', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/hscn/:site/top3Things/:patientId', () => {
    const expected = require('../../lib/handlers/top3Things/getHscnDetail');
    const actual = resolveHandler('/api/hscn/:site/top3Things/:patientId', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/:heading', () => {
    const expected = require('../../lib/handlers/patients/getHeadingSummary');
    const actual = resolveHandler('/api/patients/:patientId/:heading', 'GET');
    expect(actual).toBe(expected);
  });

  it('POST /api/patients/:patientId/:heading', () => {
    const expected = require('../../lib/handlers/patients/postHeading');
    const actual = resolveHandler('/api/patients/:patientId/:heading', 'POST');
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/:heading/:sourceId', () => {
    const expected = require('../../lib/handlers/patients/getHeadingDetail');
    const actual = resolveHandler('/api/patients/:patientId/:heading/:sourceId', 'GET');
    expect(actual).toBe(expected);
  });

  it('PUT /api/patients/:patientId/:heading/:sourceId', () => {
    const expected = require('../../lib/handlers/patients/putHeading');
    const actual = resolveHandler('/api/patients/:patientId/:heading/:sourceId', 'PUT');
    expect(actual).toBe(expected);
  });

  it('DELETE /api/patients/:patientId/:heading/:sourceId', () => {
    const expected = require('../../lib/handlers/patients/deleteHeading');
    const actual = resolveHandler('/api/patients/:patientId/:heading/:sourceId', 'DELETE');
    expect(actual).toBe(expected);
  });

  it('GET /api/feeds', () => {
    const expected = require('../../lib/handlers/feeds/getSummary');
    const actual = resolveHandler('/api/feeds', 'GET');
    expect(actual).toBe(expected);
  });

  it('POST /api/feeds', () => {
    const expected = require('../../lib/handlers/feeds/post');
    const actual = resolveHandler('/api/feeds', 'POST');
    expect(actual).toBe(expected);
  });

  it('GET /api/feeds/:sourceId', () => {
    const expected = require('../../lib/handlers/feeds/getDetail');
    const actual = resolveHandler('/api/feeds/:sourceId', 'GET');
    expect(actual).toBe(expected);
  });

  it('PUT /api/feeds/:sourceId', () => {
    const expected = require('../../lib/handlers/feeds/put');
    const actual = resolveHandler('/api/feeds/:sourceId', 'PUT');
    expect(actual).toBe(expected);
  });

  it('GET /discovery/merge/:heading', () => {
    const expected = require('../../lib/handlers/discovery/merge');
    const actual = resolveHandler('/discovery/merge/:heading', 'GET');
    expect(actual).toBe(expected);
  });

  it('DELETE /api/discovery/revert/:patientId/:heading', () => {
    const expected = require('../../lib/handlers/discovery/revert');
    const actual = resolveHandler('/api/discovery/revert/:patientId/:heading', 'DELETE');
    expect(actual).toBe(expected);
  });

  it('DELETE /api/discovery/revert/:patientId/:heading', () => {
    const expected = require('../../lib/handlers/discovery/revertAll');
    const actual = resolveHandler( '/api/discovery/revert/all', 'DELETE');
    expect(actual).toBe(expected);
  });
});
