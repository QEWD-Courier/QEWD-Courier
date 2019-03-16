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

const tools = require('@openehr/tools');

describe('utils/openehr/tools', () => {
  describe('#isPatientIdValid', () => {
    it('should return patientId must be defined', () => {
      const expected = {
        error: 'patientId undefined must be defined'
      };

      const actual = tools.isPatientIdValid();

      expect(actual).toEqual(expected);
    });

    it('should return patientId is invalid', () => {
      const expected = {
        error: 'patientId abcd is invalid'
      };

      const actual = tools.isPatientIdValid('abcd');

      expect(actual).toEqual(expected);
    });

    it('should return ok', () => {
      const expected = {
        ok: true
      };

      const actual = tools.isPatientIdValid('9999999000');

      expect(actual).toEqual(expected);
    });
  });
});
