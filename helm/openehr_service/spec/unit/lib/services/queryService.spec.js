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

  17 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const QueryService = require('@lib/services/queryService');

describe('lib/services/queryService', () => {
  let ctx;
  let queryService;

  let ehrSessionService;
  let ethercisEhrRestService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    queryService = new QueryService(ctx);

    ehrSessionService = ctx.services.ehrSessionService;
    ethercisEhrRestService = ctx.rest.ethercis;

    ehrSessionService.start.and.resolveValue({
      sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
    });

    ctx.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = QueryService.create(ctx);

      expect(actual).toEqual(jasmine.any(QueryService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#query', () => {
    it('should send a query to OpenEHR server and return data', async () => {
      const expected = [
        {
          foo: 'bar'
        }
      ];

      ethercisEhrRestService.query.and.resolveValue({
        resultSet: [
          {
            foo: 'bar'
          }
        ]
      });

      const host = 'ethercis';
      const query = 'foo';
      const actual = await queryService.query(host, query);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.query).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 'foo', { format: 'aql' });
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should send a query to get data to OpenEHR server and return empty', async () => {
      const expected = [];

      ethercisEhrRestService.query.and.resolveValue({});

      const host = 'ethercis';
      const query = 'foo';
      const actual = await queryService.query(host, query);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.query).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 'foo', { format: 'aql' });
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should send a query (custom format)', async () => {
      const expected = [];

      ethercisEhrRestService.query.and.resolveValue({});

      const host = 'ethercis';
      const query = 'foo';
      const format = 'sql';
      const actual = await queryService.query(host, query, { format });

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.query).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 'foo', { format: 'sql' });
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });
  });

  describe('#postQuery', () => {
    it('should send a query to OpenEHR server and return data', async () => {
      const expected = [
        {
          foo: 'bar'
        }
      ];

      ethercisEhrRestService.postQuery.and.resolveValue({
        resultSet: [
          {
            foo: 'bar'
          }
        ]
      });

      const host = 'ethercis';
      const query = 'foo';
      const actual = await queryService.postQuery(host, query);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.postQuery).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 'foo', { format: 'aql' });
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should send a query to get data to OpenEHR server and return empty', async () => {
      const expected = [];

      ethercisEhrRestService.postQuery.and.resolveValue({});

      const host = 'ethercis';
      const query = 'foo';
      const actual = await queryService.postQuery(host, query);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.postQuery).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 'foo', { format: 'aql' });
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should send a postQuery (custom format)', async () => {
      const expected = [];

      ethercisEhrRestService.postQuery.and.resolveValue({});

      const host = 'ethercis';
      const query = 'foo';
      const format = 'sql';
      const actual = await queryService.postQuery(host, query, { format });

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.postQuery).toHaveBeenCalledWith('03134cc0-3741-4d3f-916a-a279a24448e5', 'foo', { format: 'sql' });
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });
  });
});
