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

const transform = require('qewd-transform-json').transform;
const { headingHelpers } = require('@lib/shared/headings');
const { flatten } = require('@lib/shared/utils');

describe('headings', () => {
  const host = 'marand';
  const headings = [
    'allergies',
    'counts',
    'appointments',
    'clinicalnotes',
    'contacts',
    'eolcareplans',
    'events',
    'laborders',
    'labresults',
    'mdtreports',
    'medications',
    'personalnotes',
    'problems',
    'procedures',
    'procedures',
    'proms',
    'referrals',
    'top3Things',
    'vaccinations',
    'vitalsigns'
  ];

  function loadConfig(heading) {
    let config;

    try {
      config = require(`./${heading}/config.json`);
    } catch (err) {
      config = {};
    }

    return config;
  }

  function getTestCases(config, method) {
    const optional = config[method] || [];
    const all = [''].concat(optional);

    return all.map(x => ({
      name: x ? `(${x})` : '',
      path: x ? `${method}_${x}` : method
    }));
  }

  beforeAll(() => {
    jasmine.clock().install();

    const nowTime = Date.UTC(2018, 5, 1); // 1527811200000, now
    jasmine.clock().mockDate(new Date(nowTime));

    // disable test env to test headings
    process.env.NODE_ENV = '';
  });

  afterAll(() => {
    jasmine.clock().uninstall();

    // set test env back
    process.env.NODE_ENV = 'test';
  });

  headings.forEach(heading => {
    const targetObj = require(`@headings/${heading}/${heading}`);
    const config = loadConfig(heading);

    describe(`headings/${heading}`, () => {
      if (targetObj.get) {
        const testCases = getTestCases(config, 'get');

        testCases.forEach(testCase => {
          it(`should process get transform template ${testCase.name}`, () => {
            const expected = require(`./${heading}/${testCase.path}/expected.json`);
            const input = require(`./${heading}/${testCase.path}/input.json`);

            const helpersFns = headingHelpers(host, heading, 'get');
            const actual = transform(targetObj.get.transformTemplate, input, helpersFns);

            expect(actual).toEqual(expected);
          });
        });
      }

      if (targetObj.post) {
        const testCases = getTestCases(config, 'post');

        testCases.forEach(testCase => {
          it(`should process post transform template ${testCase.name}`, () => {
            const expected = require(`./${heading}/${testCase.path}/expected.json`);
            const input = require(`./${heading}/${testCase.path}/input.json`);

            const helpersFns = headingHelpers(host, heading, 'post');
            const output = transform(targetObj.post.transformTemplate, input, helpersFns);
            const actual = flatten(output);

            expect(actual).toEqual(expected);
          });
        });
      }
    });
  });
});
