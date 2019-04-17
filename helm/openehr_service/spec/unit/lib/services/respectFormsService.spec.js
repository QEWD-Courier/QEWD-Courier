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
const { UnprocessableEntityError } = require('@lib/errors');
const RespectFormsService = require('@lib/services/respectFormsService');

describe('lib/services/respectFormsService', () => {
  let ctx;
  let respectFormsService;

  let headingCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    respectFormsService = new RespectFormsService(ctx);

    headingCache = ctx.cache.headingCache;

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
        await respectFormsService.getBySourceId(sourceId,version);

        expect(headingCache.byVersion.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3);
        expect(headingCache.byVersion.set).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', 3, expected);
      });

      // it('should return detail', async () => {
      //   const expected = {
      //     source: 'ethercis',
      //     sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
      //     noteType: 'some type',
      //     notes: 'some personal notes',
      //     author: 'Foo Bar',
      //     dateCreated: 1517486400000
      //   };

      //   headingCache.bySourceId.get.and.returnValue(dbData);
      //   jumperService.check.and.returnValue({ ok: false });
      //   discoveryDb.checkBySourceId.and.returnValue(false);

      //   const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      //   const actual = await headingService.getBySourceId(sourceId);

      //   expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      //   expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
      //   expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
      //     'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
      //   );
      //   expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

      //   expect(actual).toEqual(expected);
      // });

      // it('should return synopsis', async () => {
      //   const expected = {
      //     source: 'ethercis',
      //     sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
      //     text: 'some type'
      //   };

      //   headingCache.bySourceId.get.and.returnValue(dbData);
      //   jumperService.check.and.returnValue({ ok: false });
      //   discoveryDb.checkBySourceId.and.returnValue(false);

      //   const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      //   const actual = await headingService.getBySourceId(sourceId, 'synopsis');

      //   expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      //   expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
      //   expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
      //     'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
      //   );
      //   expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

      //   expect(actual).toEqual(expected);
      // });

      // it('should return synopsis (no values)', async () => {
      //   const expected = {
      //     source: 'ethercis',
      //     sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
      //     text: ''
      //   };

      //   delete dbData.data.type;

      //   headingCache.bySourceId.get.and.returnValue(dbData);
      //   jumperService.check.and.returnValue({ ok: false });
      //   discoveryDb.checkBySourceId.and.returnValue(false);

      //   const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      //   const actual = await headingService.getBySourceId(sourceId, 'synopsis');

      //   expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      //   expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
      //   expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
      //     'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
      //   );
      //   expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

      //   expect(actual).toEqual(expected);
      // });

      // it('should return summary', async () => {
      //   const expected = {
      //     source: 'ethercis',
      //     sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
      //     noteType: 'some type',
      //     author: 'Foo Bar',
      //     dateCreated: 1517486400000
      //   };

      //   headingCache.bySourceId.get.and.returnValue(dbData);
      //   jumperService.check.and.returnValue({ ok: false });
      //   discoveryDb.checkBySourceId.and.returnValue(false);

      //   const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      //   const actual = await headingService.getBySourceId(sourceId, 'summary');

      //   expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      //   expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
      //   expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
      //     'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
      //   );
      //   expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

      //   expect(actual).toEqual(expected);
      // });

      // it('should return summary (no values)', async () => {
      //   const expected = {
      //     source: 'ethercis',
      //     sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
      //     noteType: 'some type',
      //     author: '',
      //     dateCreated: 1517486400000
      //   };

      //   delete dbData.data.author;

      //   headingCache.bySourceId.get.and.returnValue(dbData);
      //   jumperService.check.and.returnValue({ ok: false });
      //   discoveryDb.checkBySourceId.and.returnValue(false);

      //   const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      //   const actual = await headingService.getBySourceId(sourceId, 'summary');

      //   expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      //   expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
      //   expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
      //     'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
      //   );
      //   expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

      //   expect(actual).toEqual(expected);
      // });
    });
  });
});
