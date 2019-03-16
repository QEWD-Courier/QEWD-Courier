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

const createFlatJSON = require('@jumper/createFlatJSON');

describe('utils/jumper/lib/createFlatJSON', () => {
  let metaDataArray;

  it('should return correct flat json when metaDataArray is empty array', () => {
    const expected = {
      'ctx/composer_name': '=> either(composer.value, \'Dr Tony Shannon\')',
      'ctx/health_care_facility|id': '=> either(facility_id, \'999999-345\')',
      'ctx/health_care_facility|name': '=> either(facility_name, \'Rippleburgh GP Practice\')',
      'ctx/id_namespace': 'NHS-UK',
      'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
      'ctx/language': 'en',
      'ctx/territory': 'GB',
      'ctx/time': '=> now()'
    };

    metaDataArray = [];

    const actual = createFlatJSON(metaDataArray);

    expect(actual).toEqual(expected);
  });

  describe('ignore rules', () => {
    it('should ignore when "aqlPath" NOT startsWith /content[', () => {
      const expected = {
        'ctx/composer_name': '=> either(composer.value, \'Dr Tony Shannon\')',
        'ctx/health_care_facility|id': '=> either(facility_id, \'999999-345\')',
        'ctx/health_care_facility|name': '=> either(facility_name, \'Rippleburgh GP Practice\')',
        'ctx/id_namespace': 'NHS-UK',
        'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
        'ctx/language': 'en',
        'ctx/territory': 'GB',
        'ctx/time': '=> now()'
      };

      metaDataArray = [
        {
          id: 'composer',
          name: 'Composer',
          path: [
            'composer'
          ],
          type: 'PARTY_PROXY',
          aqlPath: '/composer',
          pathArr: [
            'composer'
          ],
          required: false,
          max: 0,
          flatJSONPath: 'immunisation_summary/composer'
        }
      ];

      const actual = createFlatJSON(metaDataArray);

      expect(actual).toEqual(expected);
    });
  });

  describe('DV_TEXT', () => {
    beforeEach(() => {
      metaDataArray = [
        {
          id: 'causative_agent',
          name: 'Causative agent',
          path: [
            'allergies_and_adverse_reactions',
            'adverse_reaction_risk',
            'causative_agent'
          ],
          type: 'DV_TEXT',
          aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/data[at0001]/items[at0002]',
          pathArr: [
            'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
            'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
            'data[at0001]',
            'items[at0002]'
          ],
          required: false,
          max: 1,
          flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent'
        }
      ];
    });

    it('should return correct flat json when metaDataArray contains DV_TEXT', () => {
      const expected = {
        'ctx/composer_name': '=> either(composer.value, \'Dr Tony Shannon\')',
        'ctx/health_care_facility|id': '=> either(facility_id, \'999999-345\')',
        'ctx/health_care_facility|name': '=> either(facility_name, \'Rippleburgh GP Practice\')',
        'ctx/id_namespace': 'NHS-UK',
        'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
        'ctx/language': 'en',
        'ctx/territory': 'GB',
        'ctx/time': '=> now()',
        'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent': '=> dvText(allergies_and_adverse_reactions.adverse_reaction_risk.causative_agent)',
        'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|value': '=> either(allergies_and_adverse_reactions.adverse_reaction_risk.causative_agent.value, <!delete>)',
        'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|code': '=> either(allergies_and_adverse_reactions.adverse_reaction_risk.causative_agent.code, <!delete>)',
        'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent|terminology': '=> either(allergies_and_adverse_reactions.adverse_reaction_risk.causative_agent.terminology, <!delete>)'
      };

      const actual = createFlatJSON(metaDataArray);

      expect(actual).toEqual(expected);
    });
  });

  describe('DV_CODED_TEXT', () => {
    beforeEach(() => {
      metaDataArray = [
        {
          id: 'relationship_category',
          name: 'Relationship category',
          path: [
            'relevant_contacts',
            'relevant_contact',
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
          max: 1,
          flatJSONPath: 'relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_category'
        }
      ];
    });

    it('should return correct flat json when metaDataArray contains DV_CODED_TEXT', () => {
      const expected = {
        'ctx/composer_name': '=> either(composer.value, \'Dr Tony Shannon\')',
        'ctx/health_care_facility|id': '=> either(facility_id, \'999999-345\')',
        'ctx/health_care_facility|name': '=> either(facility_name, \'Rippleburgh GP Practice\')',
        'ctx/id_namespace': 'NHS-UK',
        'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
        'ctx/language': 'en',
        'ctx/territory': 'GB',
        'ctx/time': '=> now()',
        'relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_category|value': '=> either(relevant_contacts.relevant_contact.relationship_category.value, <!delete>)',
        'relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_category|code': '=> either(relevant_contacts.relevant_contact.relationship_category.code, <!delete>)',
        'relevant_contacts_list/relevant_contacts/relevant_contact:0/relationship_category|terminology': '=> either(relevant_contacts.relevant_contact.relationship_category.terminology, <!delete>)'
      };

      const actual = createFlatJSON(metaDataArray);

      expect(actual).toEqual(expected);
    });
  });

  describe('ISM_TRANSITION', () => {
    beforeEach(() => {
      metaDataArray = [
        {
          id: 'ism_transition',
          name: 'IsmTransition',
          path: [
            'immunisation_procedure',
            'ism_transition'
          ],
          type: 'ISM_TRANSITION',
          aqlPath: '/content[openEHR-EHR-ACTION.immunisation_procedure.v1]/ism_transition',
          pathArr: [
            'content[openEHR-EHR-ACTION.immunisation_procedure.v1]',
            'ism_transition'
          ],
          required: false,
          max: 0,
          flatJSONPath: 'immunisation_summary/immunisation_procedure:0/ism_transition'
        }
      ];
    });

    it('should return correct flat json when metaDataArray contains ISM_TRANSITION', () => {
      const expected = {
        'ctx/composer_name': '=> either(composer.value, \'Dr Tony Shannon\')',
        'ctx/health_care_facility|id': '=> either(facility_id, \'999999-345\')',
        'ctx/health_care_facility|name': '=> either(facility_name, \'Rippleburgh GP Practice\')',
        'ctx/id_namespace': 'NHS-UK',
        'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
        'ctx/language': 'en',
        'ctx/territory': 'GB',
        'ctx/time': '=> now()',
        'immunisation_summary/immunisation_procedure:0/ism_transition/current_state|code': '=> either(immunisation_procedure.ism_transition.value, <!delete>)'
      };

      const actual = createFlatJSON(metaDataArray);

      expect(actual).toEqual(expected);
    });
  });

  describe('DV_BOOLEAN', () => {
    beforeEach(() => {
      metaDataArray = [
        {
          id: 'first_occurrence',
          name: 'First occurrence?',
          path: [
            'allergies_and_adverse_reactions',
            'adverse_reaction_risk',
            'first_occurrence'
          ],
          type: 'DV_BOOLEAN',
          aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/data[at0001]/items[at0071]',
          pathArr: [
            'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
            'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
            'data[at0001]',
            'items[at0071]'
          ],
          required: false,
          max: 1,
          flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/first_occurrence'
        }
      ];
    });

    it('should return correct flat json when metaDataArray contains DV_BOOLEAN', () => {
      const expected = {
        'ctx/composer_name': '=> either(composer.value, \'Dr Tony Shannon\')',
        'ctx/health_care_facility|id': '=> either(facility_id, \'999999-345\')',
        'ctx/health_care_facility|name': '=> either(facility_name, \'Rippleburgh GP Practice\')',
        'ctx/id_namespace': 'NHS-UK',
        'ctx/id_scheme': '2.16.840.1.113883.2.1.4.3',
        'ctx/language': 'en',
        'ctx/territory': 'GB',
        'ctx/time': '=> now()',
        'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/first_occurrence': '=> either(allergies_and_adverse_reactions.adverse_reaction_risk.first_occurrence.value, <!delete>)'
      };

      const actual = createFlatJSON(metaDataArray);

      expect(actual).toEqual(expected);
    });
  });
});
