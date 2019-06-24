/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Dmitry Solyannik <dmitry.solyannik@gmail.com>                    |
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

const { ExecutionContextMock } = require('@tests/mocks');
const { UnprocessableEntityError } = require('@lib/errors');
const SearchService = require('@lib/services/searchService');

describe('lib/services/searchService', () => {
  let ctx;
  let searchService;
  
  let ehrSessionService;
  let ethercisEhrRestService;
  
  beforeEach(() => {
    
    ctx = new ExecutionContextMock();
    searchService = new SearchService(ctx);
    
    ehrSessionService = ctx.services.ehrSessionService;
    ethercisEhrRestService = ctx.rest.ethercis;
    
    ehrSessionService.start.and.resolveValue({
      sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
    });
    
    ctx.freeze();
  });
  
  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = SearchService.create(ctx);
      
      expect(actual).toEqual(jasmine.any(SearchService));
      expect(actual.ctx).toBe(ctx);
    });
  });
  
  describe('#query', () => {
    it('should return one search result by heading', async () => {
      const result = [
        {
          "nhsNo": "9999999801",
          "ehrId": "9b4289e7-b1df-4357-a913-bbdd1de5625a"
        }
      ];
      const host = 'ethercis';
      const heading = 'allergies';
      const queryText = 'cat';
      ethercisEhrRestService.query.and.resolveValue({
        resultSet: [
          {
            "nhsNo": "9999999801",
            "ehrId": "9b4289e7-b1df-4357-a913-bbdd1de5625a"
          }
        ]
      });
      
      const actual = await searchService.query(host, heading, queryText);
      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(actual).toEqual(result);
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');
    });
    it('should return empty response if ethercis returns empty result', async () => {
      const result = [];
      const host = 'ethercis';
      const heading = 'allergies';
      const queryText = 'cat';
      ethercisEhrRestService.query.and.resolveValue(null);
  
      const actual = await searchService.query(host, heading, queryText);
      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(actual).toEqual(result);
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');
    });
  });
  
});
