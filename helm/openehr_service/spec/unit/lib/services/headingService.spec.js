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

const { ExecutionContextMock } = require('@tests/mocks');
const { NotFoundError, UnprocessableEntityError } = require('@lib/errors');
const HeadingService = require('@lib/services/headingService');

describe('lib/services/headingService', () => {
  let ctx;
  let headingService;

  let headingCache;
  let discoveryDb;

  let ehrSessionService;
  let jumperService;
  let patientService;
  let ethercisEhrRestService;

  beforeEach(() => {
    const nowTime = Date.UTC(2019, 0, 1); // 1546300800000, now
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(nowTime));

    ctx = new ExecutionContextMock();
    headingService = new HeadingService(ctx);

    headingCache = ctx.cache.headingCache;
    discoveryDb = ctx.db.discoveryDb;

    ehrSessionService = ctx.services.ehrSessionService;
    jumperService = ctx.services.jumperService;
    patientService = ctx.services.patientService;
    ethercisEhrRestService = ctx.rest.ethercis;

    ehrSessionService.start.and.resolveValue({
      sessionId: '03134cc0-3741-4d3f-916a-a279a24448e5'
    });

    ctx.freeze();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = HeadingService.create(ctx);

      expect(actual).toEqual(jasmine.any(HeadingService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#get', () => {
    it('should get record from OpenEHR server', async () => {
      const expected = {
        foo: 'bar'
      };

      ethercisEhrRestService.getComposition.and.resolveValue({
        composition: {
          foo: 'bar'
        }
      });

      const host = 'ethercis';
      const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1';
      const actual = await headingService.get(host, compositionId);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.getComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      );
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should return null', async () => {
      const expected = null;

      ethercisEhrRestService.getComposition.and.resolveValue({});

      const host = 'ethercis';
      const compositionId = '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1';
      const actual = await headingService.get(host, compositionId);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.getComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      );
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });
  });

  describe('#post', () => {
    it('should post via openehr jumper module and return its response', async () => {
      const expected = {
        ok: true,
        host: 'ethercis',
        heading: 'problems',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      jumperService.check.and.returnValue({ ok: true });
      jumperService.post.and.resolveValue({
        ok: true,
        host: 'ethercis',
        heading: 'problems',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'problems';
      const data = {
        data: {
          foo: 'bar'
        }
      };
      const actual = await headingService.post(host, patientId, heading, data);

      expect(jumperService.check).toHaveBeenCalledWith('problems', 'post');
      expect(jumperService.post).toHaveBeenCalledWith('ethercis', 9999999000, 'problems', data);

      expect(actual).toEqual(expected);
    });

    it('should throw unprocessable entity error when headings is not recognised', async () => {
      jumperService.check.and.returnValue({ ok: false });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'test';
      const data = {
        data: {
          foo: 'bar'
        }
      };
      const actual = headingService.post(host, patientId, heading, data);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading test not recognised, or no POST definition available')
      );

      expect(jumperService.check).toHaveBeenCalledWith('test', 'post');
    });

    it('should throw unprocessable entity error when no POST definition available', async () => {
      jumperService.check.and.returnValue({ ok: false });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'counts';
      const data = {
        data: {
          foo: 'bar'
        }
      };
      const actual = headingService.post(host, patientId, heading, data);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading counts not recognised, or no POST definition available')
      );

      expect(jumperService.check).toHaveBeenCalledWith('counts', 'post');
    });

    it('should post heading record to OpenEHR server and return ok response', async () => {
      const expected = {
        ok: true,
        host: 'ethercis',
        heading: 'personalnotes',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      jumperService.check.and.returnValue({ ok: false });
      patientService.getEhrId.and.resolveValue('74b6a24b-bd97-47f0-ac6f-a632d0cac60f');
      ethercisEhrRestService.postComposition.and.resolveValue({
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'personalnotes';
      const data = {
        data: {
          noteType: 'foo',
          notes: 'bar'
        }
      };
      const actual = await headingService.post(host, patientId, heading, data);

      expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'post');
      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(patientService.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(ethercisEhrRestService.postComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '74b6a24b-bd97-47f0-ac6f-a632d0cac60f',
        'RIPPLE - Personal Notes.v1',
        {
          'ctx/composer_name': 'Dr Tony Shannon',
          'ctx/health_care_facility|id': '999999-345',
          'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
          'ctx/id_namespace': 'NHS-UK',
          'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
          'ctx/language': 'en',
          'ctx/territory': 'GB',
          'ctx/time': '2019-01-01T00:00:00Z',
          'personal_notes/clinical_synopsis:0/_name|value': 'foo',
          'personal_notes/clinical_synopsis:0/notes': 'bar'
        }
      );
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should return non-ok response', async () => {
      const expected = {
        ok: false
      };

      jumperService.check.and.returnValue({ ok: false });
      patientService.getEhrId.and.resolveValue('74b6a24b-bd97-47f0-ac6f-a632d0cac60f');
      ethercisEhrRestService.postComposition.and.resolveValue({});

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'personalnotes';
      const data = {
        data: {
          noteType: 'foo',
          notes: 'bar'
        }
      };
      const actual = await headingService.post(host, patientId, heading, data);

      expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'post');
      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(patientService.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(ethercisEhrRestService.postComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '74b6a24b-bd97-47f0-ac6f-a632d0cac60f',
        'RIPPLE - Personal Notes.v1',
        jasmine.any(Object)
      );
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });
  });

  describe('#put', () => {
    it('should throw no existing heading record found error', async () => {
      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'problems';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        foo: 'bar'
      };
      const actual = headingService.put(host, patientId, heading, sourceId, data);

      await expectAsync(actual).toBeRejectedWith(
        new NotFoundError('No existing problems record found for sourceId: ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
    });

    it('should throw composition id not found error', async () => {
      headingCache.bySourceId.get.and.returnValue({});

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'problems';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        foo: 'bar'
      };
      const actual = headingService.put(host, patientId, heading, sourceId, data);

      await expectAsync(actual).toBeRejectedWith(
        new NotFoundError('Composition Id not found for sourceId: ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
    });

    it('should put via openehr jumper module and return its response', async () => {
      const expected = {
        ok: true,
        host: 'ethercis',
        heading: 'problems',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.bySourceId.get.and.returnValue(dbData);
      jumperService.check.and.returnValue({ ok: true });
      jumperService.put.and.resolveValue({
        ok: true,
        host: 'ethercis',
        heading: 'problems',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'problems';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        foo: 'bar'
      };
      const actual = await headingService.put(host, patientId, heading, sourceId, data);

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(jumperService.check).toHaveBeenCalledWith('problems', 'put');
      expect(jumperService.put).toHaveBeenCalledWith(
        'ethercis',
        9999999000,
        'problems',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        {
          foo: 'bar'
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should throw unprocessable entity error when headings is not recognised', async () => {
      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.bySourceId.get.and.returnValue(dbData);
      jumperService.check.and.returnValue({ ok: false });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'test';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        foo: 'bar'
      };
      const actual = headingService.put(host, patientId, heading, sourceId, data);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading test not recognised, or no POST definition available')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(jumperService.check).toHaveBeenCalledWith('test', 'put');
    });

    it('should throw unprocessable entity error when no POST definition available', async () => {
      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.bySourceId.get.and.returnValue(dbData);
      jumperService.check.and.returnValue({ ok: false });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'counts';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        foo: 'bar'
      };
      const actual = headingService.put(host, patientId, heading, sourceId, data);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading counts not recognised, or no POST definition available')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(jumperService.check).toHaveBeenCalledWith('counts', 'put');
    });

    it('should put heading record to OpenEHR server and return ok response', async () => {
      const expected = {
        ok: true,
        host: 'ethercis',
        heading: 'personalnotes',
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        action: 'foo'
      };

      const dbData = {
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      };

      headingCache.bySourceId.get.and.returnValue(dbData);
      jumperService.check.and.returnValue({ ok: false });
      ethercisEhrRestService.putComposition.and.resolveValue({
        compositionUid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        action: 'foo'
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'personalnotes';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        noteType: 'foo',
        notes: 'bar'
      };
      const actual = await headingService.put(host, patientId, heading, sourceId, data);

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'put');
      expect(ethercisEhrRestService.putComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        'RIPPLE - Personal Notes.v1',
        {
          'ctx/composer_name': 'Dr Tony Shannon',
          'ctx/health_care_facility|id': '999999-345',
          'ctx/health_care_facility|name': 'Rippleburgh GP Practice',
          'ctx/id_namespace': 'NHS-UK',
          'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
          'ctx/language': 'en',
          'ctx/territory': 'GB',
          'ctx/time': '2019-01-01T00:00:00Z',
          'personal_notes/clinical_synopsis:0/_name|value': 'foo',
          'personal_notes/clinical_synopsis:0/notes': 'bar'
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

      headingCache.bySourceId.get.and.returnValue(dbData);
      jumperService.check.and.returnValue({ ok: false });
      ethercisEhrRestService.putComposition.and.resolveValue();

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'personalnotes';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const data = {
        noteType: 'foo',
        notes: 'bar'
      };
      const actual = await headingService.put(host, patientId, heading, sourceId, data);

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'put');
      expect(ethercisEhrRestService.putComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        'RIPPLE - Personal Notes.v1',
        jasmine.any(Object)
      );

      expect(actual).toEqual(expected);
    });
  });

  describe('#query', () => {
    it('should send a query via openehr jumper module and return data', async () => {
      const expected = [
        {
          foo: 'bar'
        }
      ];

      jumperService.check.and.returnValue({ ok: true });
      jumperService.query.and.resolveValue([
        {
          foo: 'bar'
        }
      ]);

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.query(host, patientId, heading);

      expect(jumperService.check).toHaveBeenCalledWith('procedures', 'query');
      expect(jumperService.query).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures');

      expect(actual).toEqual(expected);
    });

    it('should send a query to OpenEHR server and return data', async () => {
      const expected = [
        {
          foo: 'bar'
        }
      ];

      jumperService.check.and.returnValue({ ok: false });
      patientService.getEhrId.and.resolveValue('74b6a24b-bd97-47f0-ac6f-a632d0cac60f');
      ethercisEhrRestService.query.and.resolveValue({
        resultSet: [
          {
            foo: 'bar'
          }
        ]
      });

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.query(host, patientId, heading);

      expect(jumperService.check).toHaveBeenCalledWith('procedures', 'query');

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(patientService.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(ethercisEhrRestService.query).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        [ 'select     a/uid/value as uid',
          '     a/composer/name as author',
          '     a/context/start_time/value as date_submitted',
          '     b_a/description[at0001]/items[at0002]/value/value as procedure_name',
          '     b_a/description[at0001]/items[at0002]/value/defining_code/code_string as procedure_code',
          '     b_a/description[at0001]/items[at0002]/value/defining_code/terminology_id/value as procedure_terminology',
          '     b_a/description[at0001]/items[at0049]/value/value as procedure_notes',
          '     b_a/other_participations/performer/name as performer',
          '     b_a/time/value as procedure_datetime',
          '     b_a/ism_transition/current_state/value as procedure_state',
          '     b_a/ism_transition/current_state/defining_code/code_string as procedure_state_code',
          '     b_a/ism_transition/current_state/defining_code/terminology_id/value as procedure_state_terminology',
          '     b_a/ism_transition/careflow_step/value as procedure_step',
          '     b_a/ism_transition/careflow_step/defining_code/code_string as procedure_step_code',
          '     b_a/ism_transition/careflow_step/defining_code/terminology_id/value as procedure_step_terminology',
          '     b_a/provider/external_ref/id/value as originalComposition',
          '     b_a/provider/name as originalSource     from EHR e [ehr_id/value = \'74b6a24b-bd97-47f0-ac6f-a632d0cac60f\'] contains COMPOSITION a[openEHR-EHR-COMPOSITION.health_summary.v1] contains ACTION b_a[openEHR-EHR-ACTION.procedure.v1] where a/name/value=\'Procedures list\' '
        ].join(',')
      );
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });

    it('should send a query to get data to OpenEHR server and return empty', async () => {
      const expected = [];

      jumperService.check.and.returnValue({ ok: false });
      patientService.getEhrId.and.resolveValue('74b6a24b-bd97-47f0-ac6f-a632d0cac60f');
      ethercisEhrRestService.query.and.resolveValue({});

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.query(host, patientId, heading);

      expect(jumperService.check).toHaveBeenCalledWith('procedures', 'query');

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(patientService.getEhrId).toHaveBeenCalledWith('ethercis', 9999999000);
      expect(ethercisEhrRestService.query).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        jasmine.any(String)
      );
      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });
  });

  describe('#getBySourceId', () => {
    it('should return empty object when no data in cache', async () => {
      const expected = {};

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const actual = await headingService.getBySourceId(sourceId);

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
      expect(actual).toEqual(expected);
    });

    it('should throw unprocessable entity error when headings is not recognised', async () => {
      const dbData = {
        heading: 'test'
      };
      headingCache.bySourceId.get.and.returnValue(dbData);

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const actual = headingService.getBySourceId(sourceId);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading test not recognised')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
    });

    it('should throw unprocessable entity error when heading not recognised, or no GET definition availables', async () => {
      const dbData = {
        heading: 'proms-test',
        host: 'ethercis',
        data: {
          uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
        }
      };

      headingCache.bySourceId.get.and.returnValue(dbData);

      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const actual = headingService.getBySourceId(sourceId);

      await expectAsync(actual).toBeRejectedWith(
        new UnprocessableEntityError('heading proms-test not recognised, or no GET definition available')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
    });

    describe('pulsetile', () => {
      let dbData;

      beforeEach(() => {
        dbData = {
          heading: 'procedures',
          pulsetile: {
            source: 'ethercis',
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            procedure_name: 'quux',
            name: 'John Doe',
            date: '2019-01-01',
            time: '15:00'
          }
        };
      });

      it('should return detail', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          procedure_name: 'quux',
          name: 'John Doe',
          date: '2019-01-01',
          time: '15:00'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId);

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return detail (mapped from discovery)', async () => {
        const expected = {
          source: 'GP',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          procedure_name: 'quux',
          name: 'John Doe',
          date: '2019-01-01',
          time: '15:00'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId);

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          text: 'quux'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (mapped from discovery)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'GP',
          text: 'quux'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (no values)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          text: ''
        };

        delete dbData.pulsetile.procedure_name;

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          name: 'John Doe',
          date: '2019-01-01',
          time: '15:00'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary (mapped from discovery)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'GP',
          name: 'John Doe',
          date: '2019-01-01',
          time: '15:00'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary (no values)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          name: '',
          date: '2019-01-01',
          time: '15:00'
        };

        delete dbData.pulsetile.name;

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('procedures', 'getBySourceId');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });
    });

    describe('jumper', () => {
      let dbData;
      let jumperObj;
      let jumperDataObj;

      beforeEach(() => {
        dbData = {
          heading: 'problems',
          jumperFormatData: {
            foo: 'bar'
          }
        };

        jumperObj = {
          ok: true,
          synopsisField: 'problem',
          summaryTableFields: ['problem', 'dateOfOnset']
        };

        jumperDataObj = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          problem: 'foo bar baz',
          dateOfOnset: '2018-02-01T12:00:00Z',
          foo: 'bar'
        };
      });

      it('should return detail', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          problem: 'foo bar baz',
          dateOfOnset: '2018-02-01T12:00:00Z',
          foo: 'bar'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId);

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return detail (mapped from discovery)', async () => {
        const expected = {
          source: 'GP',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          problem: 'foo bar baz',
          dateOfOnset: '2018-02-01T12:00:00Z',
          foo: 'bar'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId);

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          text: 'foo bar baz'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (mapped from discovery)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'GP',
          text: 'foo bar baz'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (no values)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          text: ''
        };

        delete jumperDataObj.problem;

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          problem: 'foo bar baz',
          dateOfOnset: '2018-02-01T12:00:00Z',
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary (mapped from discovery)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'GP',
          problem: 'foo bar baz',
          dateOfOnset: '2018-02-01T12:00:00Z',
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary (no values)', async () => {
        const expected = {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          problem: '',
          dateOfOnset: '2018-02-01T12:00:00Z',
        };

        delete jumperDataObj.problem;

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue(jumperObj);
        jumperService.getBySourceId.and.resolveValue(jumperDataObj);
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('problems', 'getBySourceId');
        expect(jumperService.getBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });
    });

    describe('transform to pulsetile', () => {
      let dbData;

      beforeEach(() => {
        dbData = {
          heading: 'personalnotes',
          host: 'ethercis',
          data: {
            type: 'some type',
            personal_note: 'some personal notes',
            author: 'Foo Bar',
            uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
            date_created: '2018-02-01T12:00:00Z'
          }
        };
      });

      it('should transform data to pulsetile and cache it', async () => {
        const expected = {
          heading: 'personalnotes',
          host: 'ethercis',
          data: {
            type: 'some type',
            personal_note: 'some personal notes',
            author: 'Foo Bar',
            uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
            date_created: '2018-02-01T12:00:00Z'
          },
          pulsetile: {
            source: 'ethercis',
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            noteType: 'some type',
            notes: 'some personal notes',
            author: 'Foo Bar',
            dateCreated: 1517486400000
          }
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        await headingService.getBySourceId(sourceId);

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', expected
        );
      });

      it('should return detail', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          noteType: 'some type',
          notes: 'some personal notes',
          author: 'Foo Bar',
          dateCreated: 1517486400000
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId);

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return detail (mapped from discovery)', async () => {
        const expected = {
          source: 'GP',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          noteType: 'some type',
          notes: 'some personal notes',
          author: 'Foo Bar',
          dateCreated: 1517486400000
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId);

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          text: 'some type'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (mapped from discovery)', async () => {
        const expected = {
          source: 'GP',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          text: 'some type'
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return synopsis (no values)', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          text: ''
        };

        delete dbData.data.type;

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'synopsis');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          noteType: 'some type',
          author: 'Foo Bar',
          dateCreated: 1517486400000
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary (mapped from discovery)', async () => {
        const expected = {
          source: 'GP',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          noteType: 'some type',
          author: 'Foo Bar',
          dateCreated: 1517486400000
        };

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(true);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });

      it('should return summary (no values)', async () => {
        const expected = {
          source: 'ethercis',
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          noteType: 'some type',
          author: '',
          dateCreated: 1517486400000
        };

        delete dbData.data.author;

        headingCache.bySourceId.get.and.returnValue(dbData);
        jumperService.check.and.returnValue({ ok: false });
        discoveryDb.checkBySourceId.and.returnValue(false);

        const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
        const actual = await headingService.getBySourceId(sourceId, 'summary');

        expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');
        expect(jumperService.check).toHaveBeenCalledWith('personalnotes', 'getBySourceId');
        expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
          'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d', jasmine.any(Object)
        );
        expect(discoveryDb.checkBySourceId).toHaveBeenCalledWith('ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d');

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('#getSummary', () => {
    it('should return summary data', async () => {
      const expected = {
        results: [
          {
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            source: 'ethercis',
            name: 'foo'
          },
          {
            sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
            source: 'marand',
            name: 'bar'
          }
        ],
        fetchCount: 8
      };

      headingCache.byHost.getAllSourceIds.and.returnValue([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5'
      ]);

      spyOn(headingService, 'getBySourceId').and.returnValues(
        {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          name: 'foo'
        },
        {
          sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
          source: 'marand',
          name: 'bar'
        }
      );

      headingCache.fetchCount.increment.and.returnValue(8);

      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.getSummary(patientId, heading);

      expect(headingCache.byHost.getAllSourceIds).toHaveBeenCalledWith(9999999000, 'procedures');

      expect(headingService.getBySourceId).toHaveBeenCalledTimes(2);
      expect(headingService.getBySourceId.calls.argsFor(0)).toEqual([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        'summary'
      ]);
      expect(headingService.getBySourceId.calls.argsFor(1)).toEqual([
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
        'summary'
      ]);

      expect(headingCache.fetchCount.increment).toHaveBeenCalledWith(9999999000, 'procedures');

      expect(actual).toEqual(expected);
    });
  });

  describe('#getSynopses', () => {
    it('should return synopses data', async () => {
      const expected = {
        procedures: [
          {
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            source: 'ethercis',
            text: 'foo'
          }
        ],
        vaccinations: [
          {
            sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
            source: 'marand',
            text: 'bar'
          }
        ]
      };

      spyOn(headingService, 'getSynopsis').and.returnValues(
        {
          results: [
            {
              sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
              source: 'ethercis',
              text: 'foo'
            }
          ]
        },
        {
          results: [
            {
              sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
              source: 'marand',
              text: 'bar'
            }
          ]
        }
      );

      headingCache.byDate.getAllSourceIds.and.resolveValue([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5'
      ]);

      const patientId = 9999999000;
      const headings = ['procedures', 'vaccinations'];
      const limit = 2;
      const actual = await headingService.getSynopses(patientId, headings, limit);

      expect(headingService.getSynopsis).toHaveBeenCalledTimes(2);
      expect(headingService.getSynopsis.calls.argsFor(0)).toEqual([9999999000, 'procedures', 2]);
      expect(headingService.getSynopsis.calls.argsFor(1)).toEqual([9999999000, 'vaccinations', 2]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#getSynopsis', () => {
    it('should return synopsis data', async () => {
      const expected = {
        results: [
          {
            sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
            source: 'ethercis',
            text: 'foo'
          },
          {
            sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
            source: 'marand',
            text: 'bar'
          }
        ]
      };

      spyOn(headingService, 'getBySourceId').and.returnValues(
        {
          sourceId: 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
          source: 'ethercis',
          text: 'foo'
        },
        {
          sourceId: 'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
          source: 'marand',
          text: 'bar'
        }
      );

      headingCache.byDate.getAllSourceIds.and.resolveValue([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5'
      ]);

      const patientId = 9999999000;
      const heading = 'procedures';
      const limit = 2;
      const actual = await headingService.getSynopsis(patientId, heading, limit);

      expect(headingCache.byDate.getAllSourceIds).toHaveBeenCalledWith(9999999000, 'procedures', { limit: 2 });

      expect(headingService.getBySourceId).toHaveBeenCalledTimes(2);
      expect(headingService.getBySourceId.calls.argsFor(0)).toEqual([
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        'synopsis'
      ]);
      expect(headingService.getBySourceId.calls.argsFor(1)).toEqual([
        'marand-03134cc0-3741-4d3f-916a-a279a24448e5',
        'synopsis'
      ]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#fetchMany', () => {
    it('should fetch records for multiple headings', async () => {
      const expected = {
        ok: true
      };

      spyOn(headingService, 'fetchOne');

      const patientId = 9999999000;
      const headings = ['procedures', 'vaccinations'];
      const actual = await headingService.fetchMany(patientId, headings);

      expect(headingService.fetchOne).toHaveBeenCalledTimes(2);
      expect(headingService.fetchOne.calls.argsFor(0)).toEqual([9999999000, 'procedures']);
      expect(headingService.fetchOne.calls.argsFor(1)).toEqual([9999999000, 'vaccinations']);

      expect(actual).toEqual(expected);
    });
  });

  describe('#fetchOne', () => {
    it('should fetch records for a single heading', async () => {
      const expected = {
        ok: true
      };

      spyOn(headingService, 'fetch');

      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.fetchOne(patientId, heading);

      expect(headingService.fetch).toHaveBeenCalledTimes(2);
      expect(headingService.fetch.calls.argsFor(0)).toEqual(['marand', 9999999000, 'procedures']);
      expect(headingService.fetch.calls.argsFor(1)).toEqual(['ethercis', 9999999000, 'procedures']);

      expect(actual).toEqual(expected);
    });
  });

  describe('#fetch', () => {
    beforeEach(() => {
      spyOn(headingService, 'query');
    });

    it('should return null when heading cache already exists', async () => {
      const expected = null;

      headingCache.byHost.exists.and.returnValue(true);

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.fetch(host, patientId, heading);

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
      const heading = 'procedures';
      const actual = await headingService.fetch(host, patientId, heading);

      expect(actual).toEqual(expected);
    });

    it('should return ok when no data returned (proccessed by jumper query)', async () => {
      const expected = {
        ok: true
      };

      headingCache.byHost.exists.and.returnValue(false);
      headingService.query.and.resolveValue();

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.fetch(host, patientId, heading);

      expect(headingService.query).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures');

      expect(actual).toEqual(expected);
    });

    it('should return ok and cache fetched records', async () => {
      const expected = {
        ok: true
      };

      headingCache.byHost.exists.and.returnValue(false);

      const data = [
        {
          uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
          date_created: '2018-02-01T12:00:00Z'
        }
      ];
      headingService.query.and.resolveValue(data);

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.fetch(host, patientId, heading);

      expect(headingService.query).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures');

      expect(headingCache.byHost.set).toHaveBeenCalledWith(
        9999999000, 'procedures', 'ethercis', 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      );
      expect(headingCache.byDate.set).toHaveBeenCalledWith(
        9999999000, 'procedures', 1517486400000, 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      );
      expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d',
        {
          heading: 'procedures',
          host: 'ethercis',
          patientId: 9999999000,
          date: 1517486400000,
          data: {
            uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
            date_created: '2018-02-01T12:00:00Z'
          },
          uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should return ok and cache fetched records (heading = counts)', async () => {
      const expected = {
        ok: true
      };

      headingCache.byHost.exists.and.returnValue(false);

      const data = [
        {
          ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
        }
      ];
      headingService.query.and.resolveValue(data);

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'counts';
      const actual = await headingService.fetch(host, patientId, heading);

      expect(headingService.query).toHaveBeenCalledWith('ethercis', 9999999000, 'counts');

      expect(headingCache.byHost.set).toHaveBeenCalledWith(
        9999999000, 'counts', 'ethercis', 'ethercis-74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      );
      expect(headingCache.byDate.set).toHaveBeenCalledWith(
        9999999000, 'counts', 1546300800000, 'ethercis-74b6a24b-bd97-47f0-ac6f-a632d0cac60f'
      );
      expect(headingCache.bySourceId.set).toHaveBeenCalledWith(
        'ethercis-74b6a24b-bd97-47f0-ac6f-a632d0cac60f',
        {
          heading: 'counts',
          host: 'ethercis',
          patientId: 9999999000,
          date: 1546300800000,
          data: {
            ehrId: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f',
            uid: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f::',
            dateCreated: 1546300800000
          },
          uid: '74b6a24b-bd97-47f0-ac6f-a632d0cac60f::'
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should return ok and do not cache fetched records (no uid)', async () => {
      const expected = {
        ok: true
      };

      headingCache.byHost.exists.and.returnValue(false);

      const data = [
        {}
      ];
      headingService.query.and.resolveValue(data);

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const actual = await headingService.fetch(host, patientId, heading);

      expect(headingService.query).toHaveBeenCalledWith('ethercis', 9999999000, 'procedures');

      expect(headingCache.byHost.set).not.toHaveBeenCalled();
      expect(headingCache.byDate.set).not.toHaveBeenCalled();
      expect(headingCache.bySourceId.set).not.toHaveBeenCalled();

      expect(actual).toEqual(expected);
    });
  });

  describe('#delete', () => {
    it('should throw no existing record found error when no record in cache', async () => {
      headingCache.bySourceId.get.and.returnValue();

      const patientId = 9999999000;
      const heading = 'procedures';
      const sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';
      const actual = headingService.delete(patientId, heading, sourceId);

      await expectAsync(actual).toBeRejectedWith(
        new NotFoundError('No existing procedures record found for sourceId: ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76');
    });

    it('should return сompositionId not found error when no uid', async () => {
      const dbData = {};
      headingCache.bySourceId.get.and.resolveValue(dbData);

      const patientId = 9999999000;
      const heading = 'procedures';
      const sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';
      const actual = headingService.delete(patientId, heading, sourceId);

      await expectAsync(actual).toBeRejectedWith(
        new NotFoundError('Composition Id not found for sourceId: ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76')
      );

      expect(headingCache.bySourceId.get).toHaveBeenCalledWith('ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76');
    });

    it('should delete heading record', async () => {
      const expected = {
        deleted: true,
        patientId: 9999999000,
        heading: 'procedures',
        compositionId: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        host: 'ethercis'
      };

      const dbData = {
        host: 'ethercis',
        uid: '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1',
        patientId: 9999999000,
        heading: 'procedures',
        date: 1514764800000,
        data: {}
      };
      headingCache.bySourceId.get.and.returnValue(dbData);

      const patientId = 9999999000;
      const heading = 'procedures';
      const sourceId = 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d';
      const actual = await headingService.delete(patientId, heading, sourceId);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(ethercisEhrRestService.deleteComposition).toHaveBeenCalledWith(
        '03134cc0-3741-4d3f-916a-a279a24448e5',
        '0f7192e9-168e-4dea-812a-3e1d236ae46d::vm01.ethercis.org::1'
      );

      expect(headingCache.byHost.delete).toHaveBeenCalledWith(
        9999999000, 'procedures', 'ethercis', 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      );
      expect(headingCache.byDate.delete).toHaveBeenCalledWith(
        9999999000, 'procedures', 1514764800000, 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      );
      expect(headingCache.bySourceId.delete).toHaveBeenCalledWith(
        'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      );
      expect(headingCache.byHeading.delete).toHaveBeenCalledWith(
        'procedures', 'ethercis-0f7192e9-168e-4dea-812a-3e1d236ae46d'
      );

      expect(ehrSessionService.stop).toHaveBeenCalledWith('ethercis', '03134cc0-3741-4d3f-916a-a279a24448e5');

      expect(actual).toEqual(expected);
    });
  });
});
