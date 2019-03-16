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

const mapRawJSON = require('@jumper/mapRawJSON');

describe('utils/jumper/lib/mapRawJSON', () => {
  let params;

  beforeEach(() => {
    params = {
      data: {},
      metadata: [],
      host: 'ethercis',
      patientId: 9999999000
    };
  });

  it('should process "context/health_care_facility"', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {
          name: 'Rippleburgh GP Practice',
          id: {
            value: '999999-345',
            scheme: '2.16.840.1.113883.2.1.4.3',
            namespace: 'NHS-UK'
          }
        },
        patientId: 9999999000,
        host: 'ethercis'
      }
    ];



    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            context: {
              '@class': 'EVENT_CONTEXT',
              health_care_facility: {
                name: 'Rippleburgh GP Practice',
                '@class': 'PARTY_IDENTIFIED',
                external_ref: {
                  id: {
                    value: '999999-345',
                    '@class': 'GENERIC_ID',
                    scheme: '2.16.840.1.113883.2.1.4.3'
                  },
                  type: 'PARTY',
                  '@class': 'PARTY_REF',
                  namespace: 'NHS-UK'
                }
              }
            }
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process "content"', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis',
        allergies_and_adverse_reactions: {
          adverse_reaction_risk: {
            causative_agent: {
              value: 'Flour'
            },
            reaction_details: {
              manifestation: {
                value: 'Sneezing'
              }
            }
          }
        }
      }
    ];



    params.metadata = [
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
        required: true,
        max: 1,
        flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/causative_agent'
      },
      {
        id: 'manifestation',
        name: 'Manifestation',
        path: [
          'allergies_and_adverse_reactions',
          'adverse_reaction_risk',
          'reaction_details',
          'manifestation'
        ],
        type: 'DV_TEXT',
        aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/data[at0001]/items[at0009]/items[at0011]',
        pathArr: [
          'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
          'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
          'data[at0001]',
          'items[at0009]',
          'items[at0011]'
        ],
        required: false,
        max: 1,
        flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/reaction_details/manifestation:0'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            content: [
              {
                archetype_node_id: 'openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1',
                '@class': 'SECTION',
                items: [
                  {
                    archetype_node_id: 'openEHR-EHR-EVALUATION.adverse_reaction_risk.v1',
                    '@class': 'EVALUATION',
                    name: {
                      value: 'Adverse reaction risk'
                    },
                    data: {
                      archetype_node_id: 'at0001',
                      items: [
                        {
                          archetype_node_id: 'at0002',
                          name: {
                            value: 'Causative agent'
                          },
                          value: {
                            value: 'Flour'
                          },
                          '@class': 'ELEMENT'
                        },
                        {
                          archetype_node_id: 'at0009',
                          name: {
                            value: 'Reaction details'
                          },
                          items: [
                            {
                              archetype_node_id: 'at0011',
                              name: {
                                value: 'Manifestation'
                              },
                              value: {
                                value: 'Sneezing'
                              },
                              '@class': 'ELEMENT'
                            }
                          ]
                        }
                      ]
                    }
                  }
                ],
                name: {
                  value: 'Adverse reaction list'
                }
              }
            ]
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process DV_CODED_TEXT type', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis',
        category: {
          value: 'Event',
          code: '433',
          terminology: 'openehr'
        }
      }
    ];



    params.metadata = [
      {
        id: 'category',
        name: 'Category',
        path: [
          'category'
        ],
        type: 'DV_CODED_TEXT',
        aqlPath: '/category',
        pathArr: [
          'category'
        ],
        required: false,
        max: 0,
        flatJSONPath: 'adverse_reaction_list/category'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            category: {
              value: 'Event',
              '@class': 'DV_CODED_TEXT',
              defining_code: {
                '@class': 'CODE_PHRASE',
                code_string: '433',
                terminology_id: {
                  value: 'openehr',
                  '@class': 'TERMINOLOGY_ID'
                }
              }
            }
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process DV_TEXT type', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis',
        category: {
          value: 'Event',
          code: '433',
          terminology: 'openehr'
        }
      }
    ];



    params.metadata = [
      {
        id: 'category',
        name: 'Category',
        path: [
          'category'
        ],
        type: 'DV_TEXT',
        aqlPath: '/category',
        pathArr: [
          'category'
        ],
        required: false,
        max: 0,
        flatJSONPath: 'adverse_reaction_list/category'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            category: {
              value: 'Event',
              '@class': 'DV_TEXT',
              defining_code: {
                '@class': 'CODE_PHRASE',
                code_string: '433',
                terminology_id: {
                  value: 'openehr',
                  '@class': 'TERMINOLOGY_ID'
                }
              }
            }
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process CODE_PHRASE type', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis',
        language: {
          value: 'en'
        }
      }
    ];



    params.metadata = [
      {
        id: 'language',
        name: 'Language',
        path: [
          'language'
        ],
        type: 'CODE_PHRASE',
        aqlPath: '/language',
        pathArr: [
          'language'
        ],
        required: false,
        max: 0,
        flatJSONPath: 'adverse_reaction_list/language'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            language: {
              '@class': 'CODE_PHRASE',
              code_string: 'en',
              terminology_id: {
                value: 'ISO_639-1',
                '@class': 'TERMINOLOGY_ID'
              }
            }
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process PARTY_PROXY type', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis',
        composer: {
          value: 'Dr Tony Shannon'
        }
      }
    ];



    params.metadata = [
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
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            composer: {
              name: 'Dr Tony Shannon',
              '@class': 'PARTY_IDENTIFIED'
            }
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process DV_PARSABLE type', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis',
        medication_and_medical_devices: {
          medication_order: {
            order: {
              timing: {
                value: 'R5/2017-06-26T10:00:00Z/P1M'
              }
            }
          }
        }
      }
    ];



    params.metadata = [
      {
        id: 'timing',
        name: 'Timing',
        path: [
          'medication_and_medical_devices',
          'medication_order',
          'order',
          'timing'
        ],
        type: 'DV_PARSABLE',
        aqlPath: '/content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1]/items[openEHR-EHR-INSTRUCTION.medication_order.v1]/activities[at0001]/timing',
        pathArr: [
          'content[openEHR-EHR-SECTION.medication_medical_devices_rcp.v1]',
          'items[openEHR-EHR-INSTRUCTION.medication_order.v1]',
          'activities[at0001]',
          'timing'
        ],
        required: false,
        max: 0,
        flatJSONPath: 'medication_statement_list/medication_and_medical_devices/medication_order:0/order:0/timing'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            content: [
              {
                archetype_node_id: 'openEHR-EHR-SECTION.medication_medical_devices_rcp.v1',
                '@class': 'SECTION',
                items: [
                  {
                    archetype_node_id: 'openEHR-EHR-INSTRUCTION.medication_order.v1',
                    '@class': 'INSTRUCTION',
                    uid: {
                      name: {
                        value: '4e722d30-4448-4ccb-b6c4-53cd47caff4e'
                      },
                      value: {
                        root: {
                          value: '4e722d30-4448-4ccb-b6c4-53cd47caff4e'
                        },
                        value: '4e722d30-4448-4ccb-b6c4-53cd47caff4e'
                      },
                      '@class': 'HIER_OBJECT_ID'
                    },
                    name: {
                      value: 'Medication order'
                    },
                    narrative: {
                      name: {
                        value: 'Medication order'
                      },
                      value: {
                        value: 'Smart - Po Per Oral - 2 puffs as required for wheeze'
                      },
                      '@class': 'DV_TEXT'
                    },
                    activities: [
                      {
                        archetype_node_id: 'at0001',
                        name: {
                          value: 'Order'
                        },
                        timing: {
                          value: {
                            value: 'R5/2017-06-26T10:00:00Z/P1M',
                            charset: {
                              code_string: 'UTF-8',
                              terminology_id: {
                                name: 'IANA_character-sets',
                                value: 'IANA_character-sets'
                              }
                            },
                            language: {
                              code_string: 'en',
                              terminology_id: {
                                name: 'ISO_639-1',
                                value: 'ISO_639-1'
                              }
                            },
                            formalism: 'timing'
                          },
                          '@class': 'DV_PARSABLE'
                        },
                        action_archetype_id: '/.*/',
                        description: {
                          archetype_node_id: 'at0002',
                          items: [
                            {
                              archetype_node_id: 'at0044',
                              name: {
                                value: 'Additional instruction'
                              },
                              value: {
                                value: 'Contact GP if using more than 4 times per day'
                              },
                              '@class': 'ELEMENT'
                            },
                            {
                              archetype_node_id: 'at0070',
                              name: {
                                value: 'Medication item'
                              },
                              value: {
                                value: 'Smart',
                                defining_code: {
                                  code_string: '123456789',
                                  terminology_id: {
                                    name: 'external',
                                    value: 'external'
                                  }
                                }
                              },
                              '@class': 'ELEMENT'
                            },
                            {
                              archetype_node_id: 'at0091',
                              name: {
                                value: 'Route'
                              },
                              value: {
                                value: 'Po Per Oral'
                              },
                              '@class': 'ELEMENT'
                            },
                            {
                              archetype_node_id: 'at0113',
                              name: {
                                value: 'Order details'
                              },
                              items: [
                                {
                                  archetype_node_id: 'openEHR-EHR-CLUSTER.medication_course_summary.v0',
                                  '@class': 'CLUSTER',
                                  name: {
                                    value: 'Order summary'
                                  },
                                  items: [
                                    {
                                      archetype_node_id: 'at0001',
                                      name: {
                                        value: 'Course status'
                                      },
                                      value: {
                                        value: 'Active',
                                        defining_code: {
                                          code_string: 'at0021',
                                          terminology_id: {
                                            name: 'local',
                                            value: 'local'
                                          }
                                        }
                                      },
                                      '@class': 'ELEMENT'
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              archetype_node_id: 'at0173',
                              name: {
                                value: 'Dose amount description'
                              },
                              value: {
                                value: '2 puffs'
                              },
                              '@class': 'ELEMENT'
                            }
                          ]
                        },
                        '@class': 'ACTIVITY'
                      }
                    ]
                  }
                ],
                name: {
                  value: 'Medication statement list'
                }
              }
            ]
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process DV_DATE_TIME type', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis',
        immunisation_procedure: {
          time: {
            value: '2016-06-15T18:22:40.000+01:00'
          }
        }
      }
    ];



    params.metadata = [
      {
        id: 'time',
        name: 'Time',
        path: [
          'immunisation_procedure',
          'time'
        ],
        type: 'DV_DATE_TIME',
        aqlPath: '/content[openEHR-EHR-ACTION.immunisation_procedure.v1]/time',
        pathArr: [
          'content[openEHR-EHR-ACTION.immunisation_procedure.v1]',
          'time'
        ],
        required: false,
        max: 0,
        flatJSONPath: 'immunisation_summary/immunisation_procedure:0/time'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            content: [
              {
                archetype_node_id: 'openEHR-EHR-ACTION.immunisation_procedure.v1',
                '@class': 'ACTION',
                time: {
                  value: {
                    value: '2016-06-15T18:22:40.000+01:00',
                    epoch_offset: 1466011360000
                  },
                  '@class': 'DV_DATE_TIME'
                }
              }
            ]
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process DV_COUNT type (marand)', () => {

    const expected = [
      {
        uid: '2020ad3c-8072-4b38-95f7-d8adbbbfb07a::hcbox.oprn.ehrscape.com::3',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'marand',
        immunisation_procedure: {
          series_number: {
            value: 2
          }
        }
      }
    ];



    params.host = 'marand';
    params.metadata = [
      {
        id: 'series_number',
        name: 'Series number',
        path: [
          'immunisation_procedure',
          'series_number'
        ],
        type: 'DV_COUNT',
        aqlPath: '/content[openEHR-EHR-ACTION.immunisation_procedure.v1]/description[at0001]/items[at0004]',
        pathArr: [
          'content[openEHR-EHR-ACTION.immunisation_procedure.v1]',
          'description[at0001]',
          'items[at0004]'
        ],
        required: false,
        max: 1,
        flatJSONPath: 'immunisation_summary/immunisation_procedure:0/series_number'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '2020ad3c-8072-4b38-95f7-d8adbbbfb07a::hcbox.oprn.ehrscape.com::3'
            },
            content: [
              {
                '@class': 'ACTION',
                name: {
                  '@class': 'DV_TEXT',
                  value: 'Immunisation procedure'
                },
                archetype_details: {
                  '@class': 'ARCHETYPED',
                  archetype_id: {
                    '@class': 'ARCHETYPE_ID',
                    value: 'openEHR-EHR-ACTION.immunisation_procedure.v1'
                  },
                  rm_version: '1.0.1'
                },
                archetype_node_id: 'openEHR-EHR-ACTION.immunisation_procedure.v1',
                description: {
                  '@class': 'ITEM_TREE',
                  name: {
                    '@class': 'DV_TEXT',
                    value: 'Tree'
                  },
                  archetype_node_id: 'at0001',
                  items: [
                    {
                      '@class': 'ELEMENT',
                      name: {
                        '@class': 'DV_TEXT',
                        value: 'Series number'
                      },
                      archetype_node_id: 'at0004',
                      value: {
                        '@class': 'DV_COUNT',
                        magnitude: 2
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process ISM_TRANSITION type (marand)', () => {

    const expected = [
      {
        uid: '2020ad3c-8072-4b38-95f7-d8adbbbfb07a::hcbox.oprn.ehrscape.com::3',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'marand',
        immunisation_procedure: {
          ism_transition: {
            value: 'completed',
            code: '532',
            terminology: 'openehr'
          }
        }
      }
    ];



    params.host = 'marand';
    params.metadata = [
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
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '2020ad3c-8072-4b38-95f7-d8adbbbfb07a::hcbox.oprn.ehrscape.com::3'
            },
            content: [
              {
                '@class': 'ACTION',
                name: {
                  '@class': 'DV_TEXT',
                  value: 'Immunisation procedure'
                },
                archetype_details: {
                  '@class': 'ARCHETYPED',
                  archetype_id: {
                    '@class': 'ARCHETYPE_ID',
                    value: 'openEHR-EHR-ACTION.immunisation_procedure.v1'
                  },
                  rm_version: '1.0.1'
                },
                archetype_node_id: 'openEHR-EHR-ACTION.immunisation_procedure.v1',
                ism_transition: {
                  '@class': 'ISM_TRANSITION',
                  current_state: {
                    '@class': 'DV_CODED_TEXT',
                    value: 'completed',
                    defining_code: {
                      '@class': 'CODE_PHRASE',
                      terminology_id: {
                        '@class': 'TERMINOLOGY_ID',
                        value: 'openehr'
                      },
                      code_string: '532'
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process when no data found for path', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis'
      }
    ];



    params.metadata = [
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
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            content: [
              {
                archetype_node_id: 'openEHR-EHR-ACTION.immunisation_procedure.v1',
                '@class': 'ACTION',
                time: {
                  value: {
                    value: '2016-06-15T18:22:40.000+01:00',
                    epoch_offset: 1466011360000
                  },
                  '@class': 'DV_DATE_TIME'
                }
              }
            ]
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process when no matching data found in array', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis'
      }
    ];



    params.metadata = [
      {
        id: 'category',
        name: 'Category',
        path: [
          'allergies_and_adverse_reactions',
          'adverse_reaction_risk',
          'category'
        ],
        type: 'DV_CODED_TEXT',
        aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/data[at0001]/items[at0120]',
        pathArr: [
          'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
          'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
          'data[at0001]',
          'items[at0120]'
        ],
        required: false,
        max: 1,
        flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/category'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            content: [
              {
                archetype_node_id: 'openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1',
                '@class': 'SECTION',
                items: [
                  {
                    archetype_node_id: 'openEHR-EHR-EVALUATION.adverse_reaction_risk.v1',
                    '@class': 'EVALUATION',
                    name: {
                      value: 'Adverse reaction risk'
                    },
                    data: {
                      archetype_node_id: 'at0001',
                      items: [
                        {
                          archetype_node_id: 'at0002',
                          name: {
                            value: 'Causative agent'
                          },
                          value: {
                            value: 'ww test 01',
                            defining_code: {
                              code_string: '1239085',
                              terminology_id: {
                                name: 'SNOMED-CT',
                                value: 'SNOMED-CT'
                              }
                            }
                          },
                          '@class': 'ELEMENT'
                        },
                        {
                          archetype_node_id: 'at0009',
                          name: {
                            value: 'Reaction details'
                          },
                          items: [
                            {
                              archetype_node_id: 'at0011',
                              name: {
                                value: 'Manifestation'
                              },
                              value: {
                                value: 'ww test 01'
                              },
                              '@class': 'ELEMENT'
                            }
                          ]
                        }
                      ]
                    }
                  }
                ],
                name: {
                  value: 'Adverse reaction list'
                }
              }
            ]
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });

  it('should process when archetype_node_id value not found', () => {

    const expected = [
      {
        uid: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1',
        health_care_facility: {},
        patientId: 9999999000,
        host: 'ethercis'
      }
    ];



    params.metadata = [
      {
        id: 'category',
        name: 'Category',
        path: [
          'allergies_and_adverse_reactions',
          'adverse_reaction_risk',
          'category'
        ],
        type: 'DV_CODED_TEXT',
        aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/data[at0001]/items[at0120]',
        pathArr: [
          'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
          'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
          'data[at0001]',
          'items[at0120]'
        ],
        required: false,
        max: 1,
        flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/category'
      }
    ];
    params.data = {
      resultSet: [
        {
          data: {
            '@class': 'COMPOSITION',
            uid: {
              '@class': 'OBJECT_VERSION_ID',
              value: '0493561a-4279-45b6-ab17-e3cd3ffd7a70::vm01.ethercis.org::1'
            },
            content: {
              archetype_node_id: 'openEHR-EHR-COMPOSITION.health_summary.v1'
            }
          }
        }
      ]
    };


    const actual = mapRawJSON(params);

    expect(actual).toEqual(expected);
  });
});

