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

  16 March 2019

*/

'use strict';

const { Worker } = require('@tests/mocks');
const addPatientDataToCache = require('@jumper/addPatientDataToCache');

describe('utils/jumper/lib/addPatientDataToCache', () => {
  let q;
  let results;
  let patientId;
  let host;
  let heading;

  let qewdSession;
  let qewdSessionData;
  let headingCache;

  function seeds() {
    headingCache.$(['bySourceId', 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6']).setDocument({
      data: {
        foo: 'bar'
      }
    });
  }

  beforeEach(() => {
    q = new Worker();


    results = [
      {
        uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        context: {
          start_time: {
            value: '2018-01-15T12:47:11UTC'
          }
        }
      }
    ];

    patientId = 9999999000;
    host = 'ethercis';
    heading = 'allergies';

    qewdSession = q.sessions.create('app');
    qewdSessionData = qewdSession.data;
    headingCache = qewdSession.data.$('headings');

    seeds();
  });

  afterEach(() => {
    q.db.reset();
  });

  it('should add patient data to cache', () => {
    const sourceId = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';
    const date = 1516009631000;

    addPatientDataToCache.call(q, results, patientId, host, heading, qewdSessionData);


    const cacheBySourceId = headingCache.$(['bySourceId', sourceId]);
    expect(cacheBySourceId.getDocument()).toEqual({
      uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
      patientId: 9999999000,
      heading: 'allergies',
      host: 'ethercis',
      date: 1516009631000,
      jumperFormatData: {
        uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        context: {
          start_time: {
            value: '2018-01-15T12:47:11UTC'
          }
        }
      }
    });


    const cacheByPatientId = headingCache.$(['byPatientId', patientId, heading]);
    expect(cacheByPatientId.$(['byDate', date, sourceId]).value).toBe('');
    expect(cacheByPatientId.$(['byHost', host, sourceId]).value).toBe('');

    const cacheByHeading = headingCache.$('byHeading');
    expect(cacheByHeading.$([heading, sourceId]).value).toBe('');
  });

  it('should get rid of standard data cache (temporary)', () => {
    const sourceId = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';

    addPatientDataToCache.call(q, results, patientId, host, heading, qewdSessionData);

    expect(headingCache.$(['bySourceId', sourceId, 'data']).exists).toBeFalsy();
  });

  it('should add patient data to cache when date is not UTC', () => {

    results = [
      {
        uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        context: {
          start_time: {
            value: '2018-01-01T12:00:00Z'
          }
        }
      }
    ];


    const sourceId = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';
    const date = 1514808000000;

    addPatientDataToCache.call(q, results, patientId, host, heading, qewdSessionData);


    const cacheBySourceId = headingCache.$(['bySourceId', sourceId]);
    expect(cacheBySourceId.getDocument()).toEqual({
      uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
      patientId: 9999999000,
      heading: 'allergies',
      host: 'ethercis',
      date: 1514808000000,
      jumperFormatData: {
        uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        context: {
          start_time: {
            value: '2018-01-01T12:00:00Z'
          }
        }
      }
    });

    const cacheByPatientId = headingCache.$(['byPatientId', patientId, heading]);
    expect(cacheByPatientId.$(['byDate', date, sourceId]).value).toBe('');
    expect(cacheByPatientId.$(['byHost', host, sourceId]).value).toBe('');

    const cacheByHeading = headingCache.$('byHeading');
    expect(cacheByHeading.$([heading, sourceId]).value).toBe('');
  });

  it('should add patient data to cache when no date', () => {
    results = [
      {
        uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
      }
    ];

    const sourceId = 'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6';

    addPatientDataToCache.call(q, results, patientId, host, heading, qewdSessionData);

    const cacheBySourceId = headingCache.$(['bySourceId', sourceId]);
    expect(cacheBySourceId.getDocument()).toEqual({
      uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
      patientId: 9999999000,
      heading: 'allergies',
      host: 'ethercis',
      jumperFormatData: {
        uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
      }
    });

    const cacheByPatientId = headingCache.$(['byPatientId', patientId, heading]);
    expect(cacheByPatientId.$('byDate').getDocument()).toEqual({});
    expect(cacheByPatientId.$(['byHost', host, sourceId]).value).toBe('');

    const cacheByHeading = headingCache.$('byHeading');
    expect(cacheByHeading.$([heading, sourceId]).value).toBe('');
  });
});
