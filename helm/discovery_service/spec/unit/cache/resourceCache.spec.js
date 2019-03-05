/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  15 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { ResourceCache } = require('@lib/cache');

describe('ripple-cdr-lib/lib/cache/resourceCache', () => {
  let ctx;

  let qewdSession;
  let resourceCache;

  function seeds() {
    qewdSession.data.$(['Discovery', 'MedicationStatement']).setDocument({
      'by_uuid': {
        '550b6681-9160-4543-9d1e-46f220a6cd79': {
          data: {
            foo: 'bar'
          },
          'practitioner': 'bb64855d-e99d-403c-9e8a-b4c8ce30c345'
        }
      }
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    resourceCache = new ResourceCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = ResourceCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(ResourceCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byUuid).toEqual(jasmine.any(Object));
    });
  });

  describe('byUuid', () => {
    let resourceName;
    let uuid;

    beforeEach(() => {
      resourceName = 'MedicationStatement';
      uuid = '550b6681-9160-4543-9d1e-46f220a6cd79';
    });

    describe('#exists', () => {
      it('should return false', () => {
        const expected = false;

        const actual = resourceCache.byUuid.exists(resourceName, uuid);

        expect(actual).toEqual(expected);
      });

      it('should return true', () => {
        const expected = true;

        seeds();
        const actual = resourceCache.byUuid.exists(resourceName, uuid);

        expect(actual).toEqual(expected);
      });
    });

    describe('#set', () => {
      it('should set resource data', () => {
        const expected = {
          quux: 'quuz'
        };

        const resource = {
          quux: 'quuz'
        };
        resourceCache.byUuid.set(resourceName, uuid, resource);

        const actual = qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid, 'data']).getDocument();
        expect(actual).toEqual(expected);
      });

      it('should ignore settings resource data', () => {
        const expected = {
          foo: 'bar'
        };

        seeds();

        const resource = {
          quux: 'quuz'
        };
        resourceCache.byUuid.set(resourceName, uuid, resource);

        const actual = qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid, 'data']).getDocument();
        expect(actual).toEqual(expected);
      });
    });

    describe('#get', () => {
      it('should get resource data', () => {
        const expected = {
          foo: 'bar'
        };

        seeds();
        const actual = resourceCache.byUuid.get(resourceName, uuid);

        expect(actual).toEqual(expected);
      });
    });

    describe('#setPractitionerUuid', () => {
      it('should set practitioner uuid', () => {
        const expected = {
          'practitioner': 'bb64855d-e99d-403c-9e8a-b4c8ce30c345'
        };

        const practitionerUuid = 'bb64855d-e99d-403c-9e8a-b4c8ce30c345';
        resourceCache.byUuid.setPractitionerUuid(resourceName, uuid, practitionerUuid);

        const actual = qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid]).getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#getPractitionerUuid', () => {
      it('should get practitioner uuid', () => {
        const expected = 'bb64855d-e99d-403c-9e8a-b4c8ce30c345';

        seeds();

        const actual = resourceCache.byUuid.getPractitionerUuid(resourceName, uuid);

        expect(actual).toEqual(expected);
      });
    });
  });
});
