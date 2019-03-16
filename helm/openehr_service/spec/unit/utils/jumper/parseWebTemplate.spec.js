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

const parseWebTemplate = require('@jumper/parseWebTemplate');

describe('utils/jumper/lib/parseWebTemplate', () => {
  let templateObj;
  let platform;

  beforeEach(() => {
    platform = 'ethercis';
  });

  it('should parse tree without children', () => {
    const expected = {
      template_name: 'Relevant Contacts List',
      composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
      metadata: []
    };

    templateObj = {
      tree: {
        id: 'relevant_contacts_list',
        name: 'Relevant Contacts List',
        node_id: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        children: []
      }
    };

    const actual = parseWebTemplate(templateObj, platform);

    expect(actual).toEqual(expected);
  });

  describe('node without id', () => {
    it('should parse leaf node', () => {
      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: []
      };

      templateObj = {
        tree: {
          id: 'relevant_contacts_list',
          name: 'Relevant Contacts List',
          node_id: 'openEHR-EHR-COMPOSITION.health_summary.v1',
          children: [
            {
              description: 'The broad category of care relationship which the contact hods with the subject.'
            }
          ]
        }
      };

      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });

    it('should parse node with children', () => {
      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'comms_description',
            name: 'Comms description',
            path: [
              'comms_description'
            ],
            type: 'DV_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0002]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[openEHR-EHR-CLUSTER.individual_person_uk.v1]',
              'items[openEHR-EHR-CLUSTER.telecom_uk.v1]',
              'items[at0002]'
            ],
            required: false,
            max: 0,
            flatJSONPath: 'relevant_contacts_list/comms_description'
          }
        ]
      };

      templateObj = {
        tree: {
          id: 'relevant_contacts_list',
          name: 'Relevant Contacts List',
          node_id: 'openEHR-EHR-COMPOSITION.health_summary.v1',
          children: [
            {
              children: [
                {
                  min: 0,
                  aql_path: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0002]',
                  max: 1,
                  name: 'Comms description',
                  description: 'An unstructured description of telecoms.',
                  id: 'comms_description',
                  category: 'ELEMENT',
                  type: 'DV_TEXT',
                  node_id: 'at0002'
                }
              ]
            }
          ]
        }
      };

      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });
  });

  describe('leaf node (ethercis)', () => {
    beforeEach(() => {
      templateObj = {
        tree: {
          id: 'relevant_contacts_list',
          name: 'Relevant Contacts List',
          node_id: 'openEHR-EHR-COMPOSITION.health_summary.v1',
          children: [
            {
              min: 0,
              aql_path: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[at0035]',
              max: 1,
              name: 'Relationship category',
              description: 'The broad category of care relationship which the contact hods with the subject.',
              id: 'relationship_category',
              category: 'ELEMENT',
              type: 'DV_CODED_TEXT',
              ethercis_sql: '"ehr"."entry"."entry" #>> \'{/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1],0,/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1],0,/data[at0001],/items[at0035],0,/DefiningCode}\'',
              node_id: 'at0035'
            }
          ]
        }
      };
    });

    it('should leaf node', () => {

      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'relationship_category',
            name: 'Relationship category',
            path: [
              'relationship_category'
            ],
            type: 'DV_CODED_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[at0035]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[at0035]'
            ],
            required: false,
            max: 0,
            flatJSONPath: 'relevant_contacts_list/relationship_category'
          }
        ]
      };


      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });

    it('should parse leaf node with required prop', () => {

      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'relationship_category',
            name: 'Relationship category',
            path: [
              'relationship_category'
            ],
            type: 'DV_CODED_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[at0035]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[at0035]'
            ],
            required: true,
            max: 0,
            flatJSONPath: 'relevant_contacts_list/relationship_category'
          }
        ]
      };


      templateObj.tree.children[0].min = 1;

      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });

    it('should parse leaf node with constraints codes', () => {

      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'relationship_category',
            name: 'Relationship category',
            path: [
              'relationship_category'
            ],
            type: 'DV_CODED_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[at0035]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[at0035]'
            ],
            required: false,
            max: 0,
            codes: [
              {
                code_string: 'at0035',
                terminology: 'local',
                description: 'The formal carer is the subject\'s key worker.',
                value: 'Key formal care worker'
              }
            ],
            flatJSONPath: 'relevant_contacts_list/relationship_category'
          }
        ]
      };



      templateObj.tree.children[0].constraints = [
        {
          constraint: {
            defining_code: [
              {
                code_string: 'at0035',
                terminology: 'local',
                description: 'The formal carer is the subject\'s key worker.',
                value: 'Key formal care worker'
              }
            ]
          }
        }
      ];


      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });

    it('should parse leaf node with constraints occurrence (min/max)', () => {

      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'relationship_category',
            name: 'Relationship category',
            path: [
              'relationship_category'
            ],
            type: 'DV_CODED_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[at0035]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[at0035]'
            ],
            required: true,
            max: 1,
            flatJSONPath: 'relevant_contacts_list/relationship_category'
          }
        ]
      };


      delete templateObj.tree.children[0].min;

      templateObj.tree.children[0].constraints = [
        {
          constraint: {
            occurrence: {
              min: 1,
              max_op: '<=',
              min_op: '>=',
              max: 1
            }
          }
        }
      ];


      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });

    it('should parse leaf node with constraints type', () => {

      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'relationship_category',
            name: 'Relationship category',
            path: [
              'relationship_category'
            ],
            type: 'DV_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[at0035]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[at0035]'
            ],
            required: false,
            max: 0,
            flatJSONPath: 'relevant_contacts_list/relationship_category'
          }
        ]
      };


      templateObj.tree.children[0].constraints = [
        {
          type: 'DV_TEXT'
        }
      ];

      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });
  });

  describe('node with children (ethercis)', () => {
    beforeEach(() => {
      templateObj = {
        tree: {
          id: 'relevant_contacts_list',
          name: 'Relevant Contacts List',
          node_id: 'openEHR-EHR-COMPOSITION.health_summary.v1',
          children: [
            {
              min: 0,
              aql_path: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]',
              max: -1,
              children: [
                {
                  min: 0,
                  aql_path: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0002]',
                  max: 1,
                  name: 'Comms description',
                  description: 'An unstructured description of telecoms.',
                  id: 'comms_description',
                  category: 'ELEMENT',
                  type: 'DV_TEXT',
                  node_id: 'at0002'
                },
                {
                  min: 0,
                  aql_path: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0020]',
                  max: 1,
                  name: 'Method',
                  description: 'The communications mode e.g Fax. Mobile, Landline, Skype',
                  id: 'method',
                  category: 'ELEMENT',
                  type: 'DV_TEXT',
                  node_id: 'at0020'
                }
              ],
              name: 'Contact details',
              description: 'Personal or organisational telecommunication details, including telephone, fax, and email or other telecommunications details e.g skype address.',
              id: 'contact_details',
              type: 'CLUSTER',
              category: 'DATA_STRUCTURE',
              node_id: 'openEHR-EHR-CLUSTER.telecom_uk.v1'
            }
          ]
        }
      };
    });

    it('should parse node with children ', () => {
      const expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'comms_description',
            name: 'Comms description',
            path: [
              'contact_details',
              'comms_description'
            ],
            type: 'DV_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0002]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[openEHR-EHR-CLUSTER.individual_person_uk.v1]',
              'items[openEHR-EHR-CLUSTER.telecom_uk.v1]',
              'items[at0002]'
            ],
            required: false,
            max: 0,
            flatJSONPath: 'relevant_contacts_list/contact_details:0/comms_description'
          },
          {
            id: 'method',
            name: 'Method',
            path: [
              'contact_details',
              'method'
            ],
            type: 'DV_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0020]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[openEHR-EHR-CLUSTER.individual_person_uk.v1]',
              'items[openEHR-EHR-CLUSTER.telecom_uk.v1]',
              'items[at0020]'
            ],
            required: false,
            max: 0,
            flatJSONPath: 'relevant_contacts_list/contact_details:0/method'
          }
        ]
      };

      const actual = parseWebTemplate(templateObj, platform);

      expect(actual).toEqual(expected);
    });
  });

  describe('tree stricture (ethercis)', () => {
    let expected;

    beforeEach(() => {
      expected = {
        template_name: 'Relevant Contacts List',
        composition_name: 'openEHR-EHR-COMPOSITION.health_summary.v1',
        metadata: [
          {
            id: 'comms_description',
            name: 'Comms description',
            path: [
              'comms_description'
            ],
            type: 'DV_TEXT',
            aqlPath: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0002]',
            pathArr: [
              'content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]',
              'items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]',
              'data[at0001]',
              'items[openEHR-EHR-CLUSTER.individual_person_uk.v1]',
              'items[openEHR-EHR-CLUSTER.telecom_uk.v1]',
              'items[at0002]'
            ],
            required: false,
            max: 0,
            flatJSONPath: 'relevant_contacts_list/comms_description'
          }
        ]
      };

      templateObj = {
        tree: {
          id: 'relevant_contacts_list',
          name: 'Relevant Contacts List',
          node_id: 'openEHR-EHR-COMPOSITION.health_summary.v1',
          children: [
            {
              min: 0,
              aql_path: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]',
              max: -1,
              children: [
                {
                  min: 0,
                  aql_path: '/content[openEHR-EHR-SECTION.relevant_contacts_rcp.v1]/items[openEHR-EHR-ADMIN_ENTRY.relevant_contact_rcp.v1]/data[at0001]/items[openEHR-EHR-CLUSTER.individual_person_uk.v1]/items[openEHR-EHR-CLUSTER.telecom_uk.v1]/items[at0002]',
                  max: 1,
                  name: 'Comms description',
                  description: 'An unstructured description of telecoms.',
                  id: 'comms_description',
                  category: 'ELEMENT',
                  type: 'DV_TEXT',
                  node_id: 'at0002'
                }
              ],
              name: 'Contact details',
              description: 'Personal or organisational telecommunication details, including telephone, fax, and email or other telecommunications details e.g skype address.',
              id: 'contact_details',
              type: 'CLUSTER',
              category: 'DATA_STRUCTURE',
              node_id: 'openEHR-EHR-CLUSTER.telecom_uk.v1'
            }
          ]
        }
      };
    });

    describe('ITEM_TREE', () => {
      beforeEach(() => {
        templateObj.tree.children[0].type = 'ITEM_TREE';
      });

      it('should parse "tree" node id', () => {
        templateObj.tree.children[0].id = 'tree';

        const actual = parseWebTemplate(templateObj, platform);

        expect(actual).toEqual(expected);
      });

      it('should parse "structure" node id', () => {
        templateObj.tree.children[0].id = 'structure';

        const actual = parseWebTemplate(templateObj, platform);

        expect(actual).toEqual(expected);
      });

      it('should parse "structure" node id', () => {
        templateObj.tree.children[0].id = 'list';

        const actual = parseWebTemplate(templateObj, platform);

        expect(actual).toEqual(expected);
      });
    });

    describe('HISTORY', () => {
      beforeEach(() => {
        templateObj.tree.children[0].type = 'HISTORY';
      });

      it('should parse "event_series" node id', () => {
        templateObj.tree.children[0].id = 'event_series';

        const actual = parseWebTemplate(templateObj, platform);

        expect(actual).toEqual(expected);
      });

      it('should parse "DATA_STRUCTURE" node category', () => {
        templateObj.tree.children[0].category = 'DATA_STRUCTURE';

        const actual = parseWebTemplate(templateObj, platform);

        expect(actual).toEqual(expected);
      });
    });

    describe('POINT_EVENT', () => {
      beforeEach(() => {
        templateObj.tree.children[0].type = 'POINT_EVENT';
      });

      it('should parse node', () => {
        const actual = parseWebTemplate(templateObj, platform);

        expect(actual).toEqual(expected);
      });
    });

    describe('EVENT', () => {
      beforeEach(() => {
        templateObj.tree.children[0].type = 'EVENT';
      });

      it('should parse "DATA_STRUCTURE" node category', () => {
        templateObj.tree.children[0].category = 'DATA_STRUCTURE';

        const actual = parseWebTemplate(templateObj, platform);

        expect(actual).toEqual(expected);
      });
    });
  });
});
