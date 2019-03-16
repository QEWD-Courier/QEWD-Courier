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

const { Worker, rewritePaths } = require('@tests/mocks');
const getTemplateFields = require('@jumper/getTemplateFields');

describe('utils/jumper/lib/getTemplateFields', () => {
  let q;
  let openehrConfig;

  let templateName;

  function seeds(documentName, templateId, templateName) {
    const doc = q.db.use(documentName);
    doc.$(['templates', 'byName', templateName]).value = templateId;
    doc.$(['templateMap', templateId, 'field']).setDocument({
      '1': {
        id: 'last_updated',
        path: [
          'allergies_and_adverse_reactions',
          'adverse_reaction_risk',
          'last_updated'
        ],
        type: 'DV_DATE_TIME'
      },
      '2': {
        id: 'category',
        path: [
          'allergies_and_adverse_reactions',
          'adverse_reaction_risk',
          'category'
        ],
        type: 'DV_CODED_TEXT'
      },
      '3': {
        id: 'category',
        path: [
          'allergies_and_adverse_reactions',
          'adverse_reaction_risk',
          'causative_agent'
        ],
        type: 'DV_TEXT'
      }
    });
  }

  beforeEach(() => {
    q = new Worker();

    templateName = 'IDCR - Adverse Reaction List.v1';

    seeds('CustomOpenEHRJumper', 'IDCR - Adverse Reaction List.v1', 'IDCR - Adverse Reaction List.v1');
    seeds('OpenEHRJumper', 'IDCR - Problem List.v1', 'IDCR - Problem List.v1');

    rewritePaths(q);
    openehrConfig = q.userDefined.globalConfig.openehr;
  });

  afterEach(() => {
    q.db.reset();
  });

  it('should return template missing or empty error', () => {
    templateName = '';

    const actual = getTemplateFields.call(q, templateName);

    expect(actual).toEqual({
      error: 'Template Name missing or empty'
    });
  });

  it('should return template name was not recognised error', () => {
    templateName = 'IDCR - Relevant contacts.v0';

    const actual = getTemplateFields.call(q, templateName);

    expect(actual).toEqual({
      error: 'Template Name was not recognised'
    });
  });

  it('should return template fields', () => {
    const actual = getTemplateFields.call(q, templateName);


    expect(actual).toEqual({
      uid: '{{uid}}',
      composer: {
        value: '{{composer}}'
      },
      host: '{{host}}',
      patientId: '{{patientId}}',
      allergies_and_adverse_reactions: {
        adverse_reaction_risk: {
          last_updated: {
            value: '{{last_updated}}'
          },
          category: {
            value: '{{category}}',
            code: '{{category_codeString}}',
            terminology: '{{category_terminology}}'
          },
          causative_agent: {
            value: '{{category}}',
            code: '{{category_codeString}}',
            terminology: '{{category_terminology}}'
          }
        }
      }
    });

  });

  it('should return template fields with default jumperTemplateFields', () => {
    delete openehrConfig.documentNames.jumperTemplateFields;

    templateName = 'IDCR - Problem List.v1';

    const actual = getTemplateFields.call(q, templateName);


    expect(actual).toEqual({
      uid: '{{uid}}',
      composer: {
        value: '{{composer}}'
      },
      host: '{{host}}',
      patientId: '{{patientId}}',
      allergies_and_adverse_reactions: {
        adverse_reaction_risk: {
          last_updated: {
            value: '{{last_updated}}'
          },
          category: {
            value: '{{category}}',
            code: '{{category_codeString}}',
            terminology: '{{category_terminology}}'
          },
          causative_agent: {
            value: '{{category}}',
            code: '{{category_codeString}}',
            terminology: '{{category_terminology}}'
          }
        }
      }
    });

  });
});
