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
const ResourceRestService = require('@lib/services/resourceRestService');
const nock = require('nock');

describe('ripple-cdr-lib/lib/services/resourceRestService', () => {
  let ctx;
  let token;

  let hostConfig;
  let resourceRestService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    token = 'testToken';

    hostConfig = {
      api: {
        host: 'https://devgateway.discoverydataservice.net/data-assurance',
        paths: {
          getPatientsByNHSNumber: '/api/fhir/patients',
          getPatientResources: '/api/fhir/resources',
          getResource: '/api/fhir/reference'
        }
      }
    };

    resourceRestService = new ResourceRestService(ctx, hostConfig);
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = ResourceRestService.create(ctx);

      expect(actual).toEqual(jasmine.any(ResourceRestService));
      expect(actual.ctx).toBe(ctx);
      expect(actual.hostConfig).toBe(ctx.serversConfig);
    });
  });

  describe('#getPatients', () => {
    it('should send request and return patients', async () => {
      const expected = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999111',
              name: [
                {
                  text: 'John Doe'
                }
              ]
            }
          }
        ]
      };

      const data = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999111',
              name: [
                {
                  text: 'John Doe'
                }
              ]
            }
          }
        ]
      };
      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .get('/api/fhir/patients?nhsNumber=9999999000')
        .matchHeader('authorization', 'Bearer testToken')
        .reply(200, JSON.stringify(data));

      const nhsNumber = 9999999000;
      const actual = await resourceRestService.getPatients(nhsNumber, token);

      expect(actual).toEqual(expected);
      expect(nock).toHaveBeenDone();
    });

    it('should send request and return empty object when response not json', async () => {
      const expected = {};

      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .get('/api/fhir/patients?nhsNumber=9999999000')
        .matchHeader('authorization', 'Bearer testToken')
        .reply(200, 'foo');

      const nhsNumber = 9999999000;
      const actual = await resourceRestService.getPatients(nhsNumber, token);

      expect(actual).toEqual(expected);
      expect(nock).toHaveBeenDone();
    });

    it('should throw error', async () => {
      const expected = {
        message: 'custom error',
        code: 500
      };

      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .get('/api/fhir/patients?nhsNumber=9999999000')
        .matchHeader('authorization', 'Bearer testToken')
        .replyWithError({
          message: 'custom error',
          code: 500
        });

      const nhsNumber = 9999999000;
      const actual = resourceRestService.getPatients(nhsNumber, token);

      await expectAsync(actual).toBeRejectedWith(expected);
      expect(nock).toHaveBeenDone();
    });
  });

  describe('#getPatientResources', () => {
    it('should send request and return patient resources', async () => {
      const expected = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Immunization',
              uuid: 'Immunization/48f8c9e3-7bae-4418-b896-2423957f3c33'
            }
          }
        ]
      };

      const data = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Immunization',
              uuid: 'Immunization/48f8c9e3-7bae-4418-b896-2423957f3c33'
            }
          }
        ]
      };
      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .post('/api/fhir/resources', JSON.stringify({
          resources: ['Immunization'],
          patients: [
            {
              resource: {
                resourceType: 'Patient',
                id: '9999999111'
              }
            }
          ]
        }))
        .matchHeader('authorization', 'Bearer testToken')
        .reply(200, JSON.stringify(data));

      const postData = {
        resources: ['Immunization'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999111'
            }
          }
        ]
      };
      const actual = await resourceRestService.getPatientResources(postData, token);

      expect(actual).toEqual(expected);
      expect(nock).toHaveBeenDone();
    });

    it('should send request and return empty object when response not json', async () => {
      const expected = {};

      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .post('/api/fhir/resources', JSON.stringify({
          resources: ['Immunization'],
          patients: [
            {
              resource: {
                resourceType: 'Patient',
                id: '9999999111'
              }
            }
          ]
        }))
        .matchHeader('authorization', 'Bearer testToken')
        .reply(200, 'foo');

      const postData = {
        resources: ['Immunization'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999111'
            }
          }
        ]
      };
      const actual = await resourceRestService.getPatientResources(postData, token);

      expect(actual).toEqual(expected);
      expect(nock).toHaveBeenDone();
    });

    it('should throw error', async () => {
      const expected = {
        message: 'custom error',
        code: 500
      };

      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .post('/api/fhir/resources', JSON.stringify({
          resources: ['Immunization'],
          patients: [
            {
              resource: {
                resourceType: 'Patient',
                id: '9999999111'
              }
            }
          ]
        }))
        .matchHeader('authorization', 'Bearer testToken')
        .replyWithError({
          message: 'custom error',
          code: 500
        });

      const postData = {
        resources: ['Immunization'],
        patients: [
          {
            resource: {
              resourceType: 'Patient',
              id: '9999999111'
            }
          }
        ]
      };
      const actual = resourceRestService.getPatientResources(postData, token);

      await expectAsync(actual).toBeRejectedWith(expected);
      expect(nock).toHaveBeenDone();
    });
  });

  describe('#getResource', () => {
    it('should send request and return resource', async () => {
      const expected = {
        resourceType: 'Immunization',
        uuid: 'Immunization/48f8c9e3-7bae-4418-b896-2423957f3c33'
      };

      const data = {
        resourceType: 'Immunization',
        uuid: 'Immunization/48f8c9e3-7bae-4418-b896-2423957f3c33'
      };
      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .get('/api/fhir/reference?reference=Immunization%2F48f8c9e3-7bae-4418-b896-2423957f3c33')
        .matchHeader('authorization', 'Bearer testToken')
        .reply(200, JSON.stringify(data));

      const reference = 'Immunization/48f8c9e3-7bae-4418-b896-2423957f3c33';
      const actual = await resourceRestService.getResource(reference, token);

      expect(actual).toEqual(expected);
      expect(nock).toHaveBeenDone();
    });

    it('should send request and return empty object', async () => {
      const expected = {};

      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .get('/api/fhir/reference?reference=Immunization%2F48f8c9e3-7bae-4418-b896-2423957f3c33')
        .matchHeader('authorization', 'Bearer testToken')
        .reply(200, '');

      const reference = 'Immunization/48f8c9e3-7bae-4418-b896-2423957f3c33';
      const actual = await resourceRestService.getResource(reference, token);

      expect(actual).toEqual(expected);
      expect(nock).toHaveBeenDone();
    });

    it('should throw error', async () => {
      const expected = {
        message: 'custom error',
        code: 500
      };

      nock('https://devgateway.discoverydataservice.net/data-assurance')
        .get('/api/fhir/reference?reference=Immunization%2F48f8c9e3-7bae-4418-b896-2423957f3c33')
        .matchHeader('authorization', 'Bearer testToken')
        .replyWithError({
          message: 'custom error',
          code: 500
        });

      const reference = 'Immunization/48f8c9e3-7bae-4418-b896-2423957f3c33';
      const actual = resourceRestService.getResource(reference, token);

      await expectAsync(actual).toBeRejectedWith(expected);
      expect(nock).toHaveBeenDone();
    });
  });
});
