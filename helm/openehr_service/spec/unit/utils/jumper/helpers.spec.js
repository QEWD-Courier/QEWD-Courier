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

const helpers = require('@jumper/helpers');

describe('utils/jumper/lib/helpers', () => {

  describe('#getStartDateTime', () => {
    it('should return date in Europe/London timezone', () => {
      const expected = '2018-06-01T07:25:15+01:00';

      const date = 1527811200000; // 1 July 2018 00:00:00
      const time = 23115000; // 06:25:15 in ms
      const actual = helpers.getStartDateTime(date, time);

      expect(actual).toBe(expected);
    });
  });

  describe('#msAfterMidnight', () => {
    it('should return milliseconds after midnight', () => {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60 * 1000; // current machine timezone offset in ms
      const expected = 39042000; // 10 hrs 50 mins 42 secs in ms

      const actual = helpers.msAfterMidnight('2017-06-13T10:50:42.000Z');

      expect(actual + offset).toBe(expected);
    });
  });

  describe('#getNarrative', () => {
    it('should return correct result', () => {
      const expected = 'fooRoute: bar; Dose: baz; Timing: quux';

      const actual = helpers.getNarrative('foo', 'bar', 'baz', 'quux');

      expect(actual).toBe(expected);
    });
  });

  describe('#fromNarrative', () => {
    it('should return correct values', () => {
      const expected = [
        'baz',
        '',
        'bar',
        'baz',
        ''
      ];

      const testCases = [
        'foo - bar - baz quux',
        'foo - ',
        'foo - bar',
        'fooRoute: bar; Dose: baz; Timing: quux',
        'fooRoute: bar'
      ];

      const actual = testCases.map(x => helpers.fromNarrative(x));

      expect(actual).toEqual(expected);
    });
  });

  describe('#toInteger', () => {
    it('should return correct values', () => {
      const expected = [
        10,
        20
      ];

      const testCases = [
        '10',
        20
      ];

      const actual = testCases.map(x => helpers.toInteger(x));

      expect(actual).toEqual(expected);
    });
  });

  describe('#trueOnly', () => {
    it('should return correct values', () => {
      const expected = [
        true,
        '<!delete>'
      ];

      const testCases = [
        true,
        false
      ];

      const actual = testCases.map(x => helpers.trueOnly(x));

      expect(actual).toEqual(expected);
    });
  });

  describe('#fhirReference', () => {
    it('should return correct values', () => {
      const expected = [
        'Practitioner/foo',
        'foo'
      ];

      const testCases = [
        ['foo', 'Practitioner', false],
        ['Practitioner/foo', 'Practitioner', true]
      ];

      const actual = testCases.map(args => helpers.fhirReference.apply(null, args));

      expect(actual).toEqual(expected);
    });
  });

  describe('#rippleDateTime', () => {
    beforeAll(() => {
      jasmine.clock().install();

      const nowTime = Date.UTC(2018, 0, 1); // 1514764800000, now
      jasmine.clock().mockDate(new Date(nowTime));
    });

    afterAll(() => {
      jasmine.clock().uninstall();
    });

    it('should return correct values', () => {
      const expected = [
        '2018-01-01T00:00:00.000Z',
        '2018-06-01T00:00:00.000Z',
        '',
        1530437415000,
        1533195045000
      ];

      const testCases = [
        [],
        [1527811200000], // 1 July 2018 00:00:00
        ['', true],
        ['2018-07-01T12:30:15UTC', true],
        ['2018-08-02T15:30:45+08:00', true],
      ];

      const actual = testCases.map(args => helpers.rippleDateTime.apply(null, args));

      expect(actual).toEqual(expected);
    });
  });

  describe('#getUid', () => {
    it('should return correct value', () => {
      const expected = 'marand-0493561a-4279-45b6-ab17-e3cd3ffd7a70';

      const actual = helpers.getUid('0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1', 'marand');

      expect(actual).toEqual(expected);
    });
  });

  describe('#fhirSnomed', () => {
    it('should return correct value', () => {
      const expected = [
        '<!delete>',
        'http://snomed.info/sct',
        'foo',
        'SNOMED-CT',
        'baz'
      ];

      const testCases = [
        [''],
        ['SNOMED-CT'],
        ['foo'],
        ['http://snomed.info/sct', true],
        ['baz', true]
      ];

      const actual = testCases.map(args => helpers.fhirSnomed.apply(null, args));
      expect(actual).toEqual(expected);
    });
  });

  describe('#dvText', () => {
    it('should return correct value', () => {
      const expected = [
        { result: '<!delete>' },
        { result: 'foo' },
        { result: '<!delete>' },
        { result: '<!delete>' },
        { result: 'foo', inputObj: {} },
        { result: 'foo', inputObj: { code: ''} },
        { result: '<!delete>' },
        { result: 'foo', inputObj: { terminology: ''} },
        { result: '<!delete>' }
      ];

      const testCases = [
        '',
        'foo',
        {},
        { value: '' },
        { value: 'foo' },
        { value: 'foo', code: '' },
        { value: 'foo', code: 'baz' },
        { value: 'foo', terminology: '' },
        { value: 'foo', terminology: 'quux' }
      ];

      testCases.forEach((inputObj, i) => {
        const expectedResult = expected[i].result;
        const expectedInputObj = expected[i].inputObj;

        const actual = helpers.dvText(inputObj);

        expect(actual).toEqual(expectedResult);
        if (expectedInputObj) {
          expect(inputObj).toEqual(expectedInputObj);
        }
      });
    });
  });
});
