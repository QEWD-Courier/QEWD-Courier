/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

  13 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const HeadingService = require('@lib/services/headingService');

describe('ripple-cdr-lib/lib/services/headingService', () => {
  let ctx;

  let headingService;

  let resourceService;
  let resourceCache;
  let patientCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    headingService = new HeadingService(ctx);

    resourceService = ctx.services.resourceService;
    resourceCache = ctx.cache.resourceCache;
    patientCache = ctx.cache.patientCache;

    ctx.cache.freeze();
    ctx.services.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', () => {
      const actual = HeadingService.create(ctx, ctx.serversConfig);

      expect(actual).toEqual(jasmine.any(HeadingService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  describe('#getBySourceId', () => {
    let nhsNumber;
    let heading;
    let sourceId;

    beforeEach(() => {
      nhsNumber = 9999999000;
      heading = 'allergies';
      sourceId = 'Discovery-AllergyIntolerance_eaf394a9-5e05-49c0-9c69-c710c77eda76';
    });

    it('should return heading details by source id', () => {
      const expected = {
        cause: 'AGENT_VALUE',
        causeCode: 'AGENT_CODE',
        causeTerminology: 'AGENT_TERMINOLOGY',
        terminologyCode: 'MANIFESTATION_CODE',
        reaction: 'MANIFESTATION_VALUE',
        author: 'Dr Tony Shannon',
        dateCreated: '2018-01-01T12:00:00Z',
        source: 'etheris',
        sourceId: 'etheris-188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        patientId: 9999999000
      };

      const resource = {
        patientId: 9999999000,
        host: 'etheris',
        uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
        date_created: '2018-01-01T12:00:00Z',
        composer: {
          value: 'Dr Tony Shannon'
        },
        allergies_and_adverse_reactions: {
          adverse_reaction_risk: {
            causative_agent: {
              code: 'AGENT_CODE',
              terminology: 'AGENT_TERMINOLOGY',
              value: 'AGENT_VALUE'
            },
            reaction_details: {
              manifestation: {
                code: 'MANIFESTATION_CODE',
                value: 'MANIFESTATION_VALUE'
              }
            }
          }
        }
      };
      resourceCache.byUuid.get.and.returnValue(resource);

      const practitioner = {
        name: {
          text: 'Jane Doe'
        }
      };
      resourceService.getPractitioner.and.returnValue(practitioner);

      const actual = headingService.getBySourceId(nhsNumber, heading, sourceId);

      expect(resourceCache.byUuid.get).toHaveBeenCalledWith('AllergyIntolerance', 'eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(resourceService.getPractitioner).toHaveBeenCalledWith('AllergyIntolerance', 'eaf394a9-5e05-49c0-9c69-c710c77eda76');

      expect(actual).toEqual(expected);
    });
  });

  describe('#getSummary', () => {
    let nhsNumber;
    let heading;

    beforeEach(() => {
      nhsNumber = 9999999000;
      heading = 'allergies';
    });

    it('should return heading summary', () => {
      const expected = [
        {
          cause: 'AGENT_VALUE_1',
          causeCode: 'AGENT_CODE_1',
          causeTerminology: 'AGENT_TERMINOLOGY_1',
          terminologyCode: 'MANIFESTATION_CODE_1',
          reaction: 'MANIFESTATION_VALUE_1',
          author: 'Dr Tony Shannon',
          dateCreated: '2018-01-01T12:00:00Z',
          source: 'etheris',
          sourceId: 'etheris-188a6bbe-d823-4fca-a79f-11c64af5c2e6',
          patientId: 9999999000
        },
        {
          cause: 'AGENT_VALUE_2',
          causeCode: 'AGENT_CODE_2',
          causeTerminology: 'AGENT_TERMINOLOGY_2',
          terminologyCode: 'MANIFESTATION_CODE_2',
          reaction: 'MANIFESTATION_VALUE_2',
          author: 'Dr Tony Shannon',
          dateCreated: '2018-02-02T12:00:00Z',
          source: 'etheris',
          sourceId: 'etheris-076d7614-9903-4051-8aea-9648a21e02f2',
          patientId: 9999999000
        }
      ];

      const resources = [
        {
          patientId: 9999999000,
          host: 'etheris',
          uid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
          date_created: '2018-01-01T12:00:00Z',
          composer: {
            value: 'Dr Tony Shannon'
          },
          allergies_and_adverse_reactions: {
            adverse_reaction_risk: {
              causative_agent: {
                code: 'AGENT_CODE_1',
                terminology: 'AGENT_TERMINOLOGY_1',
                value: 'AGENT_VALUE_1'
              },
              reaction_details: {
                manifestation: {
                  code: 'MANIFESTATION_CODE_1',
                  value: 'MANIFESTATION_VALUE_1'
                }
              }
            }
          }
        },
        {
          patientId: 9999999000,
          host: 'etheris',
          uid: '076d7614-9903-4051-8aea-9648a21e02f2::vm01.ethercis.org::1',
          date_created: '2018-02-02T12:00:00Z',
          composer: {
            value: 'Dr Tony Shannon'
          },
          allergies_and_adverse_reactions: {
            adverse_reaction_risk: {
              causative_agent: {
                code: 'AGENT_CODE_2',
                terminology: 'AGENT_TERMINOLOGY_2',
                value: 'AGENT_VALUE_2'
              },
              reaction_details: {
                manifestation: {
                  code: 'MANIFESTATION_CODE_2',
                  value: 'MANIFESTATION_VALUE_2'
                }
              }
            }
          }
        }
      ];
      const practitioners = [
        {
          name: {
            text: 'Jane Doe'
          }
        },
        {
          name: {
            text: 'Judy Doe'
          }
        }
      ];

      patientCache.byResource.getUuidsByResourceName.and.returnValue([
        'c8e4606d-e59e-4863-843a-5e66deb2e841',
        '2ebc4af8-e0d5-41fd-b32b-52af5c678fec'
      ]);
      resourceCache.byUuid.get.and.returnValues(...resources);
      resourceService.getPractitioner.and.returnValues(...practitioners);

      const actual = headingService.getSummary(nhsNumber, heading);

      expect(patientCache.byResource.getUuidsByResourceName).toHaveBeenCalledWith(9999999000, 'AllergyIntolerance');

      expect(resourceCache.byUuid.get).toHaveBeenCalledTimes(2);
      expect(resourceCache.byUuid.get.calls.argsFor(0)).toEqual(['AllergyIntolerance', 'c8e4606d-e59e-4863-843a-5e66deb2e841']);
      expect(resourceCache.byUuid.get.calls.argsFor(1)).toEqual(['AllergyIntolerance', '2ebc4af8-e0d5-41fd-b32b-52af5c678fec']);


      expect(resourceService.getPractitioner).toHaveBeenCalledTimes(2);
      expect(resourceService.getPractitioner.calls.argsFor(0)).toEqual(['AllergyIntolerance', 'c8e4606d-e59e-4863-843a-5e66deb2e841']);
      expect(resourceService.getPractitioner.calls.argsFor(1)).toEqual(['AllergyIntolerance', '2ebc4af8-e0d5-41fd-b32b-52af5c678fec']);

      expect(actual).toEqual(expected);
    });
  });
});
