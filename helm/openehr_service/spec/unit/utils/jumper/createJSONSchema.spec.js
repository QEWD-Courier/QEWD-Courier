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

const mockery = require('mockery');

describe('utils/jumper/lib/createJSONSchema', () => {
  let createJSONSchema;
  let buildJsonFile;

  let templateName;
  let metadata;
  let filePath;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    templateName = 'DCR - Adverse Reaction List.v1';
    metadata = [];
    filePath = '/path/to/jumper/templates/allergies';

    buildJsonFile = jasmine.createSpy();
    mockery.registerMock('./buildJsonFile', buildJsonFile);

    delete require.cache[require.resolve('@jumper/createJSONSchema')];
    createJSONSchema = require('@jumper/createJSONSchema');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  describe('ignore rules', () => {
    let schema;

    beforeEach(() => {
      schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {}
      };
    });

    it('should ignore when path starts with /context', () => {
      metadata = [
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
          flatJSONPath: 'adverse_reaction_list/composer'
        }
      ];

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should ignore when path starts with /composer', () => {
      metadata = [
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
          flatJSONPath: 'adverse_reaction_list/composer'
        }
      ];

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });

  describe('delete rules', () => {
    let schema;

    beforeEach(() => {

      schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          allergies_and_adverse_reactions: {
            type: 'object',
            properties: {
              adverse_reaction_risk: {
                type: 'object',
                properties: {}
              }
            }
          }
        }
      };

    });

    it('should delete "language"', () => {

      metadata = [
        {
          id: 'language',
          name: 'Language',
          path: [
            'allergies_and_adverse_reactions',
            'adverse_reaction_risk',
            'language'
          ],
          type: 'CODE_PHRASE',
          aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/language',
          pathArr: [
            'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
            'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
            'language'
          ],
          required: false,
          max: 0,
          flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/language'
        }
      ];


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should delete "subject"', () => {

      metadata = [
        {
          id: 'subject',
          name: 'Subject',
          path: [
            'allergies_and_adverse_reactions',
            'adverse_reaction_risk',
            'subject'
          ],
          type: 'PARTY_PROXY',
          aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/subject',
          pathArr: [
            'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
            'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
            'subject'
          ],
          required: false,
          max: 0,
          flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/subject'
        }
      ];


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should delete "encoding"', () => {

      metadata = [
        {
          id: 'encoding',
          name: 'Encoding',
          path: [
            'allergies_and_adverse_reactions',
            'adverse_reaction_risk',
            'encoding'
          ],
          type: 'CODE_PHRASE',
          aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/encoding',
          pathArr: [
            'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
            'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
            'encoding'
          ],
          required: false,
          max: 0,
          flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/encoding'
        }
      ];


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });

  describe('DV_TEXT', () => {
    beforeEach(() => {
      metadata = [
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

    it('should process DV_TEXT field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          allergies_and_adverse_reactions: {
            type: 'object',
            properties: {
              adverse_reaction_risk: {
                type: 'object',
                properties: {
                  causative_agent: {
                    anyOf: [
                      {
                        type: 'string'
                      },
                      {
                        type: 'object'
                      }
                    ],
                    minLength: 1,
                    description: 'Causative agent',
                    properties: {
                      value: {
                        description: 'Causative agent value',
                        type: 'string',
                        minLength: 1
                      },
                      code: {
                        description: 'Causative agent code',
                        type: 'string',
                        minLength: 1
                      },
                      terminology: {
                        description: 'Causative agent terminology',
                        type: 'string',
                        minLength: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should process DV_TEXT field (required)', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          allergies_and_adverse_reactions: {
            type: 'object',
            properties: {
              adverse_reaction_risk: {
                type: 'object',
                properties: {
                  causative_agent: {
                    anyOf: [
                      {
                        type: 'string'
                      },
                      {
                        type: 'object'
                      }
                    ],
                    minLength: 1,
                    description: 'Causative agent',
                    properties: {
                      value: {
                        description: 'Causative agent value',
                        type: 'string',
                        minLength: 1
                      },
                      code: {
                        description: 'Causative agent code',
                        type: 'string',
                        minLength: 1
                      },
                      terminology: {
                        description: 'Causative agent terminology',
                        type: 'string',
                        minLength: 1
                      }
                    },
                    required: [
                      'value'
                    ]
                  }
                }
              }
            }
          }
        }
      };


      metadata[0].required = true;

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });

  describe('DV_CODED_TEXT', () => {
    beforeEach(() => {
      metadata = [
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

    it('should process DV_CODED_TEXT field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          relevant_contacts: {
            type: 'object',
            properties: {
              relevant_contact: {
                type: 'object',
                properties: {
                  relationship_category: {
                    anyOf: [
                      {
                        type: 'string'
                      },
                      {
                        type: 'object'
                      }
                    ],
                    minLength: 1,
                    description: 'Relationship category',
                    properties: {
                      value: {
                        description: 'Relationship category value',
                        type: 'string',
                        minLength: 1
                      },
                      code: {
                        description: 'Relationship category code',
                        type: 'string',
                        minLength: 1
                      },
                      terminology: {
                        description: 'Relationship category terminology',
                        type: 'string',
                        minLength: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should process DV_CODED_TEXT field (required)', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          relevant_contacts: {
            type: 'object',
            properties: {
              relevant_contact: {
                type: 'object',
                properties: {
                  relationship_category: {
                    anyOf: [
                      {
                        type: 'string'
                      },
                      {
                        type: 'object'
                      }
                    ],
                    minLength: 1,
                    description: 'Relationship category',
                    properties: {
                      value: {
                        description: 'Relationship category value',
                        type: 'string',
                        minLength: 1
                      },
                      code: {
                        description: 'Relationship category code',
                        type: 'string',
                        minLength: 1
                      },
                      terminology: {
                        description: 'Relationship category terminology',
                        type: 'string',
                        minLength: 1
                      }
                    },
                    required: [
                      'value'
                    ]
                  }
                }
              }
            }
          }
        }
      };


      metadata[0].required = true;

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should process DV_CODED_TEXT field (codes)', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          relevant_contacts: {
            type: 'object',
            properties: {
              relevant_contact: {
                type: 'object',
                properties: {
                  relationship_category: {
                    anyOf: [
                      {
                        type: 'string'
                      },
                      {
                        type: 'object'
                      }
                    ],
                    minLength: 1,
                    description: 'Relationship category',
                    properties: {
                      value: {
                        description: 'Relationship category value',
                        type: 'string',
                        minLength: 0
                      },
                      code: {
                        description: 'Relationship category code',
                        type: 'string',
                        minLength: 1
                      },
                      terminology: {
                        description: 'Relationship category terminology',
                        type: 'string',
                        minLength: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };



      metadata[0].codes = [
        {
          code_string: 'at0036',
          terminology: 'local',
          description: 'The description.',
          value: 'Informal carer'
        }
      ];


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });

  describe('DV_DATE_TIME', () => {
    beforeEach(() => {
      metadata = [
        {
          id: 'onset_of_last_reaction',
          name: 'Onset of last reaction',
          path: [
            'allergies_and_adverse_reactions',
            'adverse_reaction_risk',
            'onset_of_last_reaction'
          ],
          type: 'DV_DATE_TIME',
          aqlPath: '/content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]/items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]/data[at0001]/items[at0117]',
          pathArr: [
            'content[openEHR-EHR-SECTION.allergies_adverse_reactions_rcp.v1]',
            'items[openEHR-EHR-EVALUATION.adverse_reaction_risk.v1]',
            'data[at0001]',
            'items[at0117]'
          ],
          required: false,
          max: 1,
          flatJSONPath: 'adverse_reaction_list/allergies_and_adverse_reactions/adverse_reaction_risk:0/onset_of_last_reaction'
        }
      ];
    });

    it('should process DV_DATE_TIME field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          allergies_and_adverse_reactions: {
            type: 'object',
            properties: {
              adverse_reaction_risk: {
                type: 'object',
                properties: {
                  onset_of_last_reaction: {
                    type: 'object',
                    properties: {
                      value: {
                        description: 'Onset of last reaction value',
                        type: 'string',
                        minLength: 1,
                        format: 'date-time'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should process DV_DATE_TIME required field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          allergies_and_adverse_reactions: {
            type: 'object',
            properties: {
              adverse_reaction_risk: {
                type: 'object',
                properties: {
                  onset_of_last_reaction: {
                    type: 'object',
                    properties: {
                      value: {
                        description: 'Onset of last reaction value',
                        type: 'string',
                        minLength: 1,
                        format: 'date-time'
                      },
                    }
                  }
                },
                required: [
                  'onset_of_last_reaction'
                ]
              }
            }
          }
        }
      };


      metadata[0].required = true;

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });

  describe('DV_QUANTITY', () => {
    beforeEach(() => {
      metadata = [
        {
          id: 'series_number',
          name: 'Series number',
          path: [
            'immunisation_procedure',
            'series_number'
          ],
          type: 'DV_QUANTITY',
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
    });

    it('should process DV_QUANTITY field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          immunisation_procedure: {
            type: 'object',
            properties: {
              series_number: {
                type: 'object',
                properties: {
                  value: {
                    description: 'Series number value',
                    type: 'number',
                    minLength: 1
                  }
                }
              }
            }
          }
        }
      };


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should process DV_QUANTITY required field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          immunisation_procedure: {
            type: 'object',
            properties: {
              series_number: {
                type: 'object',
                properties: {
                  value: {
                    description: 'Series number value',
                    type: 'number',
                    minLength: 1
                  }
                }
              }
            },
            required: [
              'series_number'
            ]
          }
        }
      };


      metadata[0].required = true;

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });

  describe('DV_COUNT', () => {
    beforeEach(() => {
      metadata = [
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
    });

    it('should process DV_COUNT field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          immunisation_procedure: {
            type: 'object',
            properties: {
              series_number: {
                type: 'object',
                properties: {
                  value: {
                    description: 'Series number value',
                    type: 'number',
                    minLength: 1
                  }
                }
              }
            }
          }
        }
      };


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should process DV_COUNT required field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          immunisation_procedure: {
            type: 'object',
            properties: {
              series_number: {
                type: 'object',
                properties: {
                  value: {
                    description: 'Series number value',
                    type: 'number',
                    minLength: 1
                  }
                }
              }
            },
            required: [
              'series_number'
            ]
          }
        }
      };


      metadata[0].required = true;

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });

  describe('DV_BOOLEAN', () => {
    beforeEach(() => {
      metadata = [
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

    it('should process DV_BOOLEAN field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          allergies_and_adverse_reactions: {
            type: 'object',
            properties: {
              adverse_reaction_risk: {
                type: 'object',
                properties: {
                  first_occurrence: {
                    type: 'object',
                    properties: {
                      value: {
                        description: 'First occurrence? value',
                        type: 'boolean',
                        minLength: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };


      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });

    it('should process DV_BOOLEAN required field', () => {

      const schema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        title: 'DCR - Adverse Reaction List.v1',
        description: 'Data Entry Schema for OpenEHR Template DCR - Adverse Reaction List.v1',
        type: 'object',
        properties: {
          allergies_and_adverse_reactions: {
            type: 'object',
            properties: {
              adverse_reaction_risk: {
                type: 'object',
                properties: {
                  first_occurrence: {
                    type: 'object',
                    properties: {
                      value: {
                        description: 'First occurrence? value',
                        type: 'boolean',
                        minLength: 1
                      }
                    }
                  }
                },
                required: [
                  'first_occurrence'
                ]
              }
            }
          }
        }
      };


      metadata[0].required = true;

      createJSONSchema(templateName, metadata, filePath);

      expect(buildJsonFile).toHaveBeenCalledWith(schema, filePath, 'schema.json');
    });
  });
});
