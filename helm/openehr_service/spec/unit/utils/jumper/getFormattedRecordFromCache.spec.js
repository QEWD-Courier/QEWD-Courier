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

const { Worker, rewritePaths } = require('@tests/mocks');
const getFormattedRecordFromCache = require('@jumper/getFormattedRecordFromCache');

describe('utils/jumper/lib/getFormattedRecordFromCache', () => {
  let q;

  let sourceId;
  let format;
  let qewdSession;

  function seeds() {
    // not cached
    qewdSession.data.$(['headings', 'bySourceId', 'ethercis-260a7be5-e00f-4b1e-ad58-27d95604d010']).setDocument({
      heading: 'allergies',
      jumperFormatData: {
        name: 'baz'
      }
    });

    // cached
    qewdSession.data.$(['headings', 'bySourceId', 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be']).setDocument({
      heading: 'allergies',
      jumperFormatData: {
        name: 'foo'
      },
      pulsetile: {
        name: 'bar',
        cached: true
      },
      fhir: {
        name: 'quux',
        cached: true
      }

    });
  }

  beforeEach(() => {
    q = new Worker();

    sourceId = 'ethercis-260a7be5-e00f-4b1e-ad58-27d95604d010';
    format = '';
    qewdSession = q.sessions.create('app');

    rewritePaths(q);
    seeds();
  });

  afterEach(() => {
    q.db.reset();
  });

  it('should return nothing', () => {
    const actual = getFormattedRecordFromCache.call(q, sourceId, format, qewdSession);

    expect(actual).toBeUndefined();
  });

  describe('pulsetile', () => {
    beforeEach(() => {
      format = 'pulsetile';
    });

    it('should return formatted record and cache it', () => {
      const expected = {
        name: 'baz',
        desc: 'quuxx'
      };

      const actual = getFormattedRecordFromCache.call(q, sourceId, format, qewdSession);

      const cachedRecord = qewdSession.data.$(['headings', 'bySourceId', sourceId, format]);

      expect(actual).toEqual(expected);
      expect(cachedRecord.getDocument()).toEqual(expected);
    });

    it('should return cached record', () => {
      const expected = {
        name: 'bar',
        cached: true
      };

      sourceId = 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be';

      const actual = getFormattedRecordFromCache.call(q, sourceId, format, qewdSession);

      expect(actual).toEqual(expected);
    });
  });

  describe('fhir', () => {
    beforeEach(() => {
      format = 'fhir';
    });

    it('should return formatted record and cache it', () => {
      const expected = {
        name: 'baz',
        desc: 'quuxx'
      };

      const actual = getFormattedRecordFromCache.call(q, sourceId, format, qewdSession);

      const cachedRecord = qewdSession.data.$(['headings', 'bySourceId', sourceId, format]);

      expect(actual).toEqual(expected);
      expect(cachedRecord.getDocument()).toEqual(expected);
    });

    it('should return cached record', () => {
      const expected = {
        name: 'quux',
        cached: true
      };

      sourceId = 'ethercis-ae3886df-21e2-4249-97d6-d0612ae8f8be';

      const actual = getFormattedRecordFromCache.call(q, sourceId, format, qewdSession);

      expect(actual).toEqual(expected);
    });
  });

});
