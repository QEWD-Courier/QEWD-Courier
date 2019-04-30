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

  30 April 2019

*/

const dateTime = require('../../lib/shared/dateTime');

module.exports = {
  name: 'respectforms',
  textFieldName: 'dateCreated',
  headingTableFields: ['author', 'dateCreated', 'status'],

  get: {
    helperFunctions: {
      getCprValue: (code) => {
        switch (code) {
          case 'at0004':
            return 'CPRRecommended';

          case 'at0005':
            return 'NotforCPR';

          case 'at0027':
            return 'ModifiedCPR';

          default:
            return 'Not known';
        }
      },
      getLegalProxyValue: (code) => {
        switch (code) {
          case 'at0004':
            return 'Yes';

          case 'at0005':
            return 'No';

          case 'at0006':
            return 'Unknown';

          default:
            return 'Not known';

        }
      },
      getInvolvementValue: (code)=> {
        switch (code) {
          case 'at0003':
            return 'valueSetA';

          case 'at0004':
            return 'valueSetB';

          case 'at0005':
            return 'valueSetC1';

          case 'at0011':
            return 'valueSetC2';

          case 'at0012':
            return 'valueSetC3';

          case 'at0013':
            return 'valueSetD';

          default:
            return 'Not known';
        }
      }
    },

    transformTemplate: {
      author: '{{nss_respect_form["composer|name"]}}',
      dateCreated: '=> getRippleTime(nss_respect_form.context.start_time)',
      status: '{{nss_respect_form.context.status}}',
      summaryInformation: {
        dateCompleted: '22-Mar-2019',
        summary: '{{nss_respect_form.respect_headings["a2._summary_of_relevant_information"]["a2.0_relevant_information"].respect_summary.narrative_summary}}',
        details: '{{nss_respect_form.respect_headings["a2._summary_of_relevant_information"]["a2.3_other_relevant_planning_documents"].advance_planning_documentation.summary}}',
        status: 'Completed'
      },
      personalPreferences: {
        dateCompleted: '22-Mar-2019',
        preferencesText: '{{nss_respect_form.respect_headings["a3._personal_preferences"].preferred_priorities_of_care.patient_care_priority}}',
        preferencesValue: '{{nss_respect_form.respect_headings["a3._personal_preferences"].preferred_priorities_of_care.care_priority_scale}}',
        status: 'Completed'
      },
      clinicalRecommendations: {
        clinicalGuidance: '{{nss_respect_form.respect_headings["a4._clinical_recommendations"].recommendation.clinical_guidance_on_interventions}}',
        clinicalSignature: '{{nss_respect_form["composer|name"]}}',
        focusValue: '{{nss_respect_form.respect_headings["a4._clinical_recommendations"].recommendation.clinical_focus}}',
        cprValue: '=> getCprValue(nss_respect_form.respect_headings["a4._clinical_recommendations"].cpr_decision["cpr_decision|code"])',
        dateDecision: '=> getRippleTime(nss_respect_form.respect_headings["a4._clinical_recommendations"].cpr_decision.date_of_cpr_decision)',
        dateCompleted: '10-Apr-2019',
        status: 'Completed'
      },
      capacityAndRepresentation: {
        dateCompleted: '22-Mar-2019',
        capacityFirst: '{{nss_respect_form.respect_headings["a5._capacity_and_representation"].capacity_respect.sufficient_capacity}}',
        legalProxyValue: '=> getLegalProxyValue(nss_respect_form.respect_headings["a5._capacity_and_representation"].capacity_respect["legal_proxy|code"])',
        status: 'Completed'
      },
      involvement: {
        dateCompleted: '22-Mar-2019',
        notSelectingReason: '{{nss_respect_form.respect_headings["a6._involvement_in_making_plan"].involvement_respect.involvement_in_recommendations.reason_for_not_selecting_options_a_or_b_or_c}}',
        involvementValue: '=> getInvolvementValue(nss_respect_form.respect_headings["a6._involvement_in_making_plan"].involvement_respect.involvement_in_recommendations["involvement|code"])',
        documentExplanation: '{{nss_respect_form.respect_headings["a6._involvement_in_making_plan"].involvement_respect.name_and_role_of_those_involved_in_decision_making}}',
        status: 'Completed'
      },
      clinicalSignatures: {
        dateCompleted: '22-Mar-2019',
        signaturesArray: [
          '{{nss_respect_form.respect_headings["a7._clinician_signatures"].clinician_signature}}',
          {
            clinicalSignature: '{{nss_respect_form["composer|name"]}}',
            designation: '{{signing_clinician.practitioner_role.designation}}',
            clinicialName: '{{signing_clinician.name.text}}',
            gmcNumber: '{{signing_clinician.identifier.value}}',
            isSrc: '',
            dateSigned: '=> getRippleTime(time)'
          }
        ],
        status: 'Completed'
      },
      emergencyContacts: {
        dateCompleted: '22-Mar-2019',
        contactsArray: [
          '{{nss_respect_form.respect_headings["a8._emergency_contacts"].emergency_contacts.participant}}',
          {
            role: '{{role}}',
            name: '{{contact.name.text}}',
            phone: '{{contact.telephone.telephone_number}}',
          }
        ],
        details: '{{nss_respect_form.respect_headings["a8._emergency_contacts"].emergency_contacts.other_details}}',
        status: 'Completed'
      },
      confirmation: {
        dateCompleted: '22-Mar-2019',
        confirmationsArray: [
          '{{nss_respect_form.respect_headings["a9._confirmation_of_validity"].service}}',
          {
            clinicalSignature: '{{nss_respect_form["composer|name"]}}',
            designation: '{{responsible_clinician.practitioner_role.designation}}',
            clinicialName: '{{responsible_clinician.name.text}}',
            gmcNumber: '{{responsible_clinician.identifier.value}}',
            reviewDate: '=> getRippleTime(review_date)',
          }
        ],
        status: 'Completed'
      }
    }
  },

  post: {
    templateId: 'RESPECT_NSS-v0',

    helperFunctions: {
      formatDate: (date) => {
        if (!date) return '';
        return dateTime.format(new Date(date));
      },
      toBoolean: (value) => {
        return Boolean(value);
      },
      getCprCode: (value) => {
        switch (value) {
          case 'CPRRecommended':
            return 'at0004';

          case 'NotforCPR':
            return 'at0005';

          case 'ModifiedCPR':
            return 'at0027';

          default:
            return 'Not known';
        }
      },
      getLegalProxyCode: (value) => {
        switch (value) {
          case 'Yes':
            return 'at0004';

          case 'No':
            return 'at0005';

          case 'Unknown':
            return 'at0006';

          default:
            return 'Not known';
        }
      },
      getInvolvementCode: (value) => {
        switch (value) {
          case 'valueSetA':
            return 'at0003';

          case 'valueSetB':
            return 'at0004';

          case 'valueSetC1':
            return 'at0005';

          case 'valueSetC2':
            return 'at0011';

          case 'valueSetC3':
            return 'at0012';

          case 'valueSetD':
            return 'at0013';

          default:
            return 'Not known';
        }
      }
    },

    transformTemplate: {
      ctx: {
        language:  'en',
        territory: 'GB'
      },
      nss_respect_form: {
        'language|code':         'en',
        'language|terminology':  'ISO_639-1',
        'territory|code':        'GB',
        'territory|terminology': 'ISO_3166-1',
        context: {
          '_health_care_facility|id':           '=> either(gpSurgeryId, "FV-DGH")',
          '_health_care_facility|id_scheme':    'NHSScotland',
          '_health_care_facility|id_namespace': 'NHSScotland',
          '_health_care_facility|name':         '=> either(healthcareFacility, "Forth Valley DGH")',
          start_time:                           '=> now()',
          'setting|code':                       '238',
          'setting|value':                      'other care',
          'setting|terminology':                'openehr',
          status:                              '{{status}}' //Started|Incomplete| Complete and Signed
        },
        'composer|name':         '{{author}}',
        'composer|id':           '=> either(author_id, "12345")',
        'composer|id_scheme':    'NHSScotland',
        'composer|id_namespace': 'NHSScotland',
        respect_headings: {
          'a2._summary_of_relevant_information': {
            'a2.0_relevant_information': {
              respect_summary: {
                narrative_summary:                '{{summaryInformation.summary}}'
              }
            },
            'a2.3_other_relevant_planning_documents' : {
              advance_planning_documentation: {
                summary: '{{summaryInformation.details}}'
              }
            }
          },
          'a3._personal_preferences': {
            preferred_priorities_of_care: {
              patient_care_priority:              '{{personalPreferences.preferencesText}}',
              care_priority_scale:                '{{personalPreferences.preferencesValue}}'
            }
          },
          'a4._clinical_recommendations': {
            recommendation: {
              clinical_focus:                     '{{clinicalRecommendations.focusValue}}',
              clinical_guidance_on_interventions: '{{clinicalRecommendations.clinicalGuidance}}',
            },
            cpr_decision: {
              'cpr_decision|code':                '=> getCprCode(clinicalRecommendations.cprValue)',
              date_of_cpr_decision:               '=> formatDate(clinicalRecommendations.dateDecision)'
            }
          },
          'a5._capacity_and_representation': {
            capacity_respect: {
              sufficient_capacity:                '=> toBoolean(capacityAndRepresentation.capacityFirst)',
              'legal_proxy|code':                 '=> getLegalProxyCode(capacityAndRepresentation.legalProxyValue)'
            }
          },
          'a6._involvement_in_making_plan': {
            involvement_respect: {
              involvement_in_recommendations: {
                'involvement|code':                               '=> getInvolvementCode(involvement.involvementValue)',
                reason_for_not_selecting_options_a_or_b_or_c:     '{{involvement.notSelectingReason}}',
              },
              name_and_role_of_those_involved_in_decision_making: '{{involvement.documentExplanation}}'
            }
          },
          'a7._clinician_signatures': {
            clinician_signature: [
              '{{clinicalSignatures.signaturesArray}}',
              {
                ism_transition: {
                  'current_state|value': 'completed'
                },
                service_name: 'ReSPECT clinician signature',
                signing_clinician: {
                  practitioner_role: {
                    designation: '{{designation}}'
                  },
                  name:{
                    'use|code': 'at0002',
                    text: '{{clinicialName}}',
                  },
                  identifier: {
                    value:            '{{gmcNumber}}',
                    'value|issuer':   'ProfessionalID',
                    'value|assigner': 'ProfessionalID',
                    'value|type': 'ProfessionalID',
                    'use|code':   'at0004'
                  }
                },
                time: '=> formatDate(dateSigned)'
              }
            ]
          },
          'a8._emergency_contacts': {
            emergency_contacts: {
              name: 'ReSPECT emergency contacts',
              participant: [
                '{{emergencyContacts.contactsArray}}',
                {
                  role:                   '{{role}}',
                  contact: {
                    name: {
                      'use|code':         'at0002',
                      text:               '{{name}}'
                    },
                    telephone: {
                      'system|code':      'at0012',
                      telephone_number:   '{{phone}}'
                    }
                  }
                }
              ],
              other_details:              '{{emergencyContacts.details}}',
            }
          },
          'a9._confirmation_of_validity': {
            service: [
              '{{confirmation.confirmationsArray}}',
              {
                service_name: 'Respect form - confirmation of validity',
                ism_transition: {
                  'current_state|value': 'completed'
                },
                responsible_clinician: {
                  practitioner_role: {
                    designation:          '{{designation}}'
                  },
                  name: {
                    'use|code':           'at0002',
                    text:                 '{{clinicialName}}'
                  },
                  identifier: {
                    value:                '{{gmcNumber}}',
                    'value|issuer':       'ProfessionalID',
                    'value|assigner':     'ProfessionalID',
                    'value|type':         'ProfessionalID',
                    'use|code':           'at0004',
                  }
                },
                review_date:              '=> formatDate(reviewDate)',
                time:                     '=> formatDate(dateCompleted)'
              }
            ]
          }
        }
      }
    }
  }
};
