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

  18 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { NotFoundError, UnprocessableEntityError } = require('@lib/errors');
const RespectFormsService = require('@lib/services/respectFormsService');

describe('lib/services/respectFormsService', () => {
  let ctx;
  let respectFormsService;

  let headingCache;

  let patientService;
  let queryService;
  let headingService;
  let ehrSessionService;
  let ethercisEhrRestService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    respectFormsService = new RespectFormsService(ctx);

    headingCache = ctx.cache.headingCache;

    patientService = ctx.services.patientService;
    queryService = ctx.services.queryService;
    headingService = ctx.services.headingService;
    ehrSessionService = ctx.services.ehrSessionService;
    ethercisEhrRestService = ctx.rest.ethercis;

    ehrSessionService.start.and.resolveValue({
      sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
    });

    ctx.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = RespectFormsService.create(ctx);

      expect(actual).toEqual(jasmine.any(RespectFormsService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getBySourceId', () => {
    it('should return empty object when no data in cache', async () => {
      const expected = {};

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const actual = await respectFormsService.getBySourceId(sourceId, version);

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
      expect(actual).toEqual(expected);
    });

    it('should throw unprocessable entity error when headings is not recognised', async () => {
      const dbData = {
        heading: 'test'
      };
      headingCache.byVersion.get.and.returnValue(dbData);

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const actual = respectFormsService.getBySourceId(sourceId, version);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading test not recognised')
      );

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
    });

    it('should throw unprocessable entity error when heading not recognised, or no GET definition availables', async () => {
      const dbData = {
        heading: 'respectforms-test',
        host: 'ethercis',
        data: {
          uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::3'
        }
      };

      headingCache.byVersion.get.and.returnValue(dbData);

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const actual = respectFormsService.getBySourceId(sourceId, version);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading respectforms-test not recognised, or no GET definition available')
      );

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
    });

    describe('pulsetile', () => {
      let dbData;

      beforeEach(() => {
        dbData = {
          heading: 'respectforms',
          pulsetile: {
            source: 'ethercis',
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            version: 3,
            author: 'Alexey K',
            dateCreated: 1546300800000,
            status: 'foo'
          }
        };
      });

      it('should return detail', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 3,
          author: 'Alexey K',
          dateCreated: 1546300800000,
          status: 'foo'
        };

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version);

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);

        expect(actual).toEqual(expected);
      });

      it('should return synopsis', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          version: 3,
          text: 1546300800000
        };

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'synopsis');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (no values)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          version: 3,
          text: ''
        };

        delete dbData.pulsetile.dateCreated;
        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'synopsis');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);

        expect(actual).toEqual(expected);
      });

      it('should return summary', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          version: 3,
          author: 'Alexey K',
          dateCreated: 1546300800000,
          status: 'foo'
        };

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'summary');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);

        expect(actual).toEqual(expected);
      });

      it('should return summary (no values)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          version: 3,
          author: '',
          dateCreated: '',
          status: ''
        };

        ['author', 'dateCreated', 'status'].forEach(x => delete dbData.pulsetile[x]);
        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'summary');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);

        expect(actual).toEqual(expected);
      });
    });

    describe('transform to pulsetile', () => {
      let dbData;

      beforeEach(() => {
        dbData = {
          heading: 'respectforms',
          host: 'ethercis',
          data: {
            nss_respect_form: {
              'composer|name': 'Alexey K',
              context: {
                start_time: '2019-04-16T00:00:00.000Z',
                status: 'foo'
              }
            }
          }
        };
      });

      it('should transform data to pulsetile and cache it', async () => {
        const expected = {
          heading: 'respectforms',
          host: 'ethercis',
          data: {
            nss_respect_form: {
              'composer|name': 'Alexey K',
              context: {
                start_time: '2019-04-16T00:00:00.000Z',
                status: 'foo'
              }
            }
          },
          pulsetile: {
            source: 'ethercis',
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            version: 3,
            author: 'Alexey K',
            dateCreated: 1555369200000,
            status: 'foo'
          }
        };

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        await respectFormsService.getBySourceId(sourceId, version);

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
        expect(headingCache.byVersion.set).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3, expected);
      });

      it('should return detail', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 3,
          author: 'Alexey K',
          dateCreated: 1555369200000,
          status: 'foo'
        };

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version);

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
        expect(headingCache.byVersion.set).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3, jasmine.any(Object));

        expect(actual).toEqual(expected);
      });

      it('should return synopsis', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 3,
          text: 1555369200000
        };

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'synopsis');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
        expect(headingCache.byVersion.set).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3, jasmine.any(Object));

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (no values)', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 3,
          text: ''
        };

        delete dbData.data.nss_respect_form.context.start_time;

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'synopsis');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
        expect(headingCache.byVersion.set).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3, jasmine.any(Object));

        expect(actual).toEqual(expected);
      });

      it('should return summary', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 3,
          author: 'Alexey K',
          dateCreated: 1555369200000,
          status: 'foo'
        };

        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'summary');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
        expect(headingCache.byVersion.set).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3, jasmine.any(Object));

        expect(actual).toEqual(expected);
      });

      it('should return summary (no values)', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 3,
          author: '',
          dateCreated: '',
          status: ''
        };

        delete dbData.data.nss_respect_form['composer|name'];
        delete dbData.data.nss_respect_form.context.start_time;
        delete dbData.data.nss_respect_form.context.status;


        headingCache.byVersion.get.and.returnValue(dbData);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const version = 3;
        const actual = await respectFormsService.getBySourceId(sourceId, version, 'summary');

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
        expect(headingCache.byVersion.set).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3, jasmine.any(Object));

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('#put', () => {
    it('should throw no existing heading record found error', async () => {
      const host = 'ethercis';
      const heading = 'respectforms';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const data = {
        foo: 'bar'
      };
      const actual = respectFormsService.put(host, heading, sourceId, version, data);

      await expectAsync(actual).toBeRejectedWith(
        new NotFoundError('No existing respectforms record found for sourceId: ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d and version: 3')
      );

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
    });

    it('should throw composition id not found error', async () => {
      headingCache.byVersion.get.and.resolveValue({});

      const host = 'ethercis';
      const heading = 'respectforms';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const data = {
        foo: 'bar'
      };
      const actual = respectFormsService.put(host, heading, sourceId, version, data);

      await expectAsync(actual).toBeRejectedWith(
        new NotFoundError('Composition Id not found for sourceId: ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d and version: 3')
      );

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
    });


    it('should throw unprocessable entity error when headings is not recognised', async () => {
      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.byVersion.get.and.returnValue(dbData);

      const host = 'ethercis';
      const heading = 'test';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const data = {
        foo: 'bar'
      };
      const actual = respectFormsService.put(host, heading, sourceId, version, data);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading test not recognised, or no POST definition available')
      );

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
    });

    it('should throw unprocessable entity error when no POST definition available', async () => {
      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.byVersion.get.and.returnValue(dbData);

      const host = 'ethercis';
      const heading = 'counts';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const data = {
        foo: 'bar'
      };
      const actual = respectFormsService.put(host, heading, sourceId, version, data);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading counts not recognised, or no POST definition available')
      );

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
    });

    it('should put heading record to OpenEHR server and return ok response', async () => {
      const expected = {
        ok: true,
        host: 'ethercis',
        heading: 'respectforms',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        action: 'foo'
      };

      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.byVersion.get.and.returnValue(dbData);
      ethercisEhrRestService.putComposition.and.resolveValue({
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        action: 'foo'
      });

      const host = 'ethercis';
      const heading = 'respectforms';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const data = {
        author: 'Alexey K',
        dateCreated: 1555369200000,
        status: 'foo'
      };
      const actual = await respectFormsService.put(host, heading, sourceId, version, data);

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
      expect(ethercisEhrRestService.putComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        'RESPECT_NSS-v0',
        {
          'nss_respect_form/composer|name': 'Alexey K',
          'nss_respect_form/context/start_time': '2019-04-15T23:00:00.000Z',
          'nss_respect_form/context/status': 'foo',
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should return non-ok response', async () => {
      const expected = {
        ok: false
      };

      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.byVersion.get.and.returnValue(dbData);
      ethercisEhrRestService.putComposition.and.resolveValue();

      const host = 'ethercis';
      const heading = 'respectforms';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const version = 3;
      const data = {
        author: 'Alexey K',
        dateCreated: 1555369200000,
        status: 'foo'
      };
      const actual = await respectFormsService.put(host, heading, sourceId, version, data);

      expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
      expect(ethercisEhrRestService.putComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        'RESPECT_NSS-v0',
        jasmine.any(Object)
      );

      expect(actual).toEqual(expected);
    });
  });

  describe('#fetchOne', () => {
    it('should fetch records for a respectforms', async () => {
      const expected = {
        ok: true
      };

      spyOn(respectFormsService, 'fetch');

      const patientId = 9999999000;
      const actual = await respectFormsService.fetchOne(patientId);

      expect(respectFormsService.fetch).toHaveBeenCalledTimes(2);
      expect(respectFormsService.fetch.calls.argsFor(0)).toEqual(['marand', 9999999000]);
      expect(respectFormsService.fetch.calls.argsFor(1)).toEqual(['ethercis', 9999999000]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#fetch', () => {
    it('should return null when heading cache already exists', async () => {
      const expected = null;

      headingCache.byHost.exists.and.returnValue(true);

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = await respectFormsService.fetch(host, patientId);

      expect(headingService.query).not.toHaveBeenCalled();
      expect(actual).toEqual(expected);
    });

    it('should return error when fetch failed', async () => {
      const expected = {
        ok: false,
        error: jasmine.any(Error)
      };

      headingCache.byHost.exists.and.returnValue(false);
      headingService.query.and.rejectValue(new Error('custom error'));

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = await respectFormsService.fetch(host, patientId);

      expect(actual).toEqual(expected);
    });

    it('should return ok and cache fetched records', async () => {
      const expected = {
        ok: true
      };

      headingCache.byHost.exists.and.returnValue(false);

      headingService.query.and.resolveValue([
        {
          uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
          date_created: '2018-02-01T12:00:00Z'
        }
      ]);
      queryService.postQuery.and.resolveValue([
        {
          id: '0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 1
        },
        {
          id: '0f7192e9-168e-4dea-812a-3e1d236ae46d',
          version: 2
        }
      ]);

      headingService.get.and.resolveValues(
        {
          'nss_respect_form/composer|name': 'Alexey K',
          'nss_respect_form/context/start_time': '2019-04-15T23:00:00.000Z',
          'nss_respect_form/context/status': 'foo',
        },
        {
          'nss_respect_form/composer|name': 'Alexey K',
          'nss_respect_form/context/start_time': '2019-04-15T23:00:00.000Z',
          'nss_respect_form/context/status': 'baz',
        }
      );

      const host = 'ethercis';
      const patientId = 9999999000;
      const actual = await respectFormsService.fetch(host, patientId);

      expect(headingCache.byHost.exists).toHaveBeenCalledWith(9999999000, 'respectforms', 'ethercis');

      expect(patientService.check).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(headingService.query).toHaveBeenCalledWith('ethercis', 9999999000, 'respectforms');
      expect(queryService.postQuery).toHaveBeenCalledWith(
        'ethercis',
        'SELECT * FROM compversion WHERE id = \'0f7192e9-168e-4dea-812a-3e1d236ae46d\'',
        {
          format: 'sql'
        }
      );

      expect(headingService.get).toHaveBeenCalledTimes(2);
      expect(headingService.get.calls.argsFor(0)).toEqual(['ethercis', '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1']);
      expect(headingService.get.calls.argsFor(1)).toEqual(['ethercis', '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::2']);

      expect(headingCache.byHost.set).toHaveBeenCalledWith(9999999000, 'respectforms', 'ethercis', 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(headingCache.byDate.set).toHaveBeenCalledWith(9999999000, 'respectforms', 1517486400000, 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

      expect(headingCache.byVersion.set).toHaveBeenCalledTimes(2);
      expect(headingCache.byVersion.set.calls.argsFor(0)).toEqual([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        1,
        {
          heading: 'respectforms',
          host: 'ethercis',
          patientId: 9999999000,
          uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
          version: 1,
          date: 1517486400000,
          data: {
           'nss_respect_form/composer|name': 'Alexey K',
           'nss_respect_form/context/start_time': '2019-04-15T23:00:00.000Z',
           'nss_respect_form/context/status': 'foo'
          }
        }
      ]);
      expect(headingCache.byVersion.set.calls.argsFor(1)).toEqual([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        2,
        {
          heading: 'respectforms',
          host: 'ethercis',
          patientId: 9999999000,
          uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::2',
          version: 2,
          date: 1517486400000,
          data:
           { 'nss_respect_form/composer|name': 'Alexey K',
             'nss_respect_form/context/start_time': '2019-04-15T23:00:00.000Z',
             'nss_respect_form/context/status': 'baz' },
           }
      ]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getSummary', () => {
    it('should return summary data', async () => {
      const expected = {
        results: [
          {
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            source: 'ethercis',
            version: 1,
            author: 'Alexey K',
            dateCreated: 1555369200000,
            status: 'foo'
          },
          {
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            source: 'ethercis',
            version: 2,
            author: 'Alexey K',
            dateCreated: 1555369200000,
            status: 'bar'
          },
          {
            sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
            source: 'marand',
            version: 3,
            author: 'Dmitry S',
            dateCreated: 1555369500000,
            status: 'baz'
          },
          {
            sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
            source: 'marand',
            version: 4,
            author: 'Dmitry S',
            dateCreated: 1555369500000,
            status: 'quuz'
          }
        ],
        fetchCount: 8
      };

      headingCache.byHost.getAllSourceIds.and.returnValue([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5'
      ]);
      headingCache.byVersion.getAllVersions.and.returnValues([1, 2], [3, 4]);

      spyOn(respectFormsService, 'getBySourceId').and.resolveValues(
        {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          version: 1,
          author: 'Alexey K',
          dateCreated: 1555369200000,
          status: 'foo'
        },
        {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          version: 2,
          author: 'Alexey K',
          dateCreated: 1555369200000,
          status: 'bar'
        },
        {
          sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
          source: 'marand',
          version: 3,
          author: 'Dmitry S',
          dateCreated: 1555369500000,
          status: 'baz'
        },
        {
          sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
          source: 'marand',
          version: 4,
          author: 'Dmitry S',
          dateCreated: 1555369500000,
          status: 'quuz'
        }
      );

      headingCache.fetchCount.increment.and.returnValue(8);

      const patientId = 9999999000;
      const actual = await respectFormsService.getSummary(patientId);

      expect(headingCache.byHost.getAllSourceIds).toHaveBeenCalledWith(9999999000, 'respectforms');
      expect(headingCache.byVersion.getAllVersions).toHaveBeenCalledTimes(2);
      expect(headingCache.byVersion.getAllVersions.calls.argsFor(0)).toEqual(['ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d']);
      expect(headingCache.byVersion.getAllVersions.calls.argsFor(1)).toEqual(['marand-03134cc0-3741-4d3f-916a-a279a24448e5']);

      expect(respectFormsService.getBySourceId).toHaveBeenCalledTimes(4);
      expect(respectFormsService.getBySourceId.calls.argsFor(0)).toEqual([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 1, 'summary'
      ]);
      expect(respectFormsService.getBySourceId.calls.argsFor(1)).toEqual([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 2, 'summary'
      ]);
      expect(respectFormsService.getBySourceId.calls.argsFor(2)).toEqual([
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5', 3, 'summary'
      ]);
      expect(respectFormsService.getBySourceId.calls.argsFor(3)).toEqual([
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5', 4, 'summary'
      ]);

      expect(headingCache.fetchCount.increment).toHaveBeenCalledWith(9999999000, 'respectforms');

      expect(actual).toEqual(expected);
    });
  });
});
