module.exports = {
  name: 'respectform',
  textFieldName: 'respect_headings',
  headingTableFields: ['cause', 'reaction', 'dateCreated'],
  
  get: {
    transformTemplate: {
      version_uid: '{{version_uid}}',
      authorName: '{{authorName}}',
      dateUpdated: '{{dateUpdated}}',
      source: '=> getSource()'
    }
  },
  post: {
    templateId: 'RESPECT_NSS-v0',
    
    transformTemplate: {
      nss_respect_form: {
        'language|code': 'en',
        'language|terminology': 'ISO_639-1',
        'territory|code': 'GB',
        'territory|terminology': 'ISO_3166-1',
        'composer|name': '=> either(firstName, "Dr Tony Shannon")',
        'composer|id': '12345',
        'id_scheme': 'NHSScotland',
        'composer|id_namespace': 'NHSScotland',
        context: {
          '_health_care_facility|id': 'FV-DGH',
          '_health_care_facility|id_scheme': 'NHSScotland',
          '_health_care_facility|id_namespace': 'NHSScotland',
          '_health_care_facility|name': 'Forth Valley DGH',
          'start_time': '2016-12-20T00:11:02.518+02:00',
          'setting|code': '238',
          'setting|value': 'other care',
          'setting|terminology': 'openehr',
          'status': 'Complete and signed'
        },
        respect_headings: {
          'a2._summary_of_relevant_information': {
            'a2.0_relevant_information': {
              respect_summary: {
                narrative_summary: 'Lung cancer with bone metastases'
              }
            }
          },
          'a3._personal_preferences': {
            preferred_priorities_of_care: {
              care_priority_scale: 17,
              patient_care_priority: 'Patient care priority 99'
            }
          },
          'a4._clinical_recommendations': {
            recommendation: {
              clinical_focus: 'Symptom control',
              clinical_guidance_on_interventions: 'Clinical guidance on interventions 32'
            },
            cpr_decision: {
              'cpr_decision|code': 'at0027',
              'date_of_cpr_decision': '2019-03-03T23:09:53.12+01:00',
              
            },
            'a5._capacity_and_representation': {
              capacity_respect: {
                sufficient_capacity: false,
                'legal_proxy|code': 'at0005'
              }
            },
            'a6._involvement_in_making_plan': {
              involvement_respect: {
                involvement_in_recommendations: {
                  'involvement|code': 'at0003',
                  reason_for_not_selecting_options_a_or_b_or_c: 'Reason for not selecting Options A or B or C 88',
                },
                name_and_role_of_those_involved_in_decision_making: 'Name and role of those involved in decision making 57'
              }
            },
            'a7._clinician_signature': {
              clinician_signature: [
                {
                  ism_transition: {
                    'current_state|value': 'completed',
                  },
                  service_name: 'ReSPECT clinician signature',
                  signing_clinician: {
                    practitioner_role: {
                      designation: 'Designation 48'
                    },
                    name: {
                      'use|code': 'at0002',
                      'text': 'Dr Miller',
                    },
                    identifier: {
                      value: '12345',
                      'value|issuer': 'ProfessionalID',
                      'value|assigner': 'ProfessionalID',
                      'value|type': 'ProfessionalID',
                      'use|code': 'at0004'
                    }
                  },
                  time: '2019-03-03T23:09:53.12+01:00'
                }
              ]
            },
            'a8._emergency_contacts': {
              emergency_contacts: {
                name: 'ReSPECT emergency contacts',
                participant: [
                  {
                    role: 'GP',
                    contact: {
                      name: {
                        'use|code': 'at0002',
                        telephone: {
                          'system|code': 'at0012',
                          telephone_number: 'Telephone number 60'
                        }
                      }
                    }
                  }
                ],
                other_details: 'Other details 70'
              }
            },
            'a9._confirmation_of_validity': {
              service: [
                {
                  ism_transition: {
                    'current_state|value': 'completed'
                  },
                  service_name: 'Respect form - confirmation of validity',
                  responsible_clinician: {
                    practitioner_role: {
                      designation: 'Designation 26'
                    },
                    name: {
                      'use|code': 'at0002',
                      text: 'Text 84'
                    },
                    identifier: {
                      value: 'c3507fd3-a867-4dea-b9d7-9f1f0fc996d3',
                      'value|issuer': 'ProfessionalID',
                      'value|assigner': 'ProfessionalID',
                      'value|type': 'ProfessionalID',
                      'use|code': 'at0004'
                    }
                  },
                  review_date: '2019-04-23',
                  time: '2019-03-03T23:09:53.121+01:00'
                }
              ]
            }
          }
        }
      }
    }
  }
};

