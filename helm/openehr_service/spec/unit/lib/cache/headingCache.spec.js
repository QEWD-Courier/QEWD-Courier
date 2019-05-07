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

  17 April 2019

*/

'use strict';

const { ExecutionContextMock } = require('@tests/mocks');
const { HeadingCache } = require('@lib/cache');

describe('lib/cache/headingCache', () => {
  let ctx;
  let headingCache;
  let qewdSession;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    headingCache = new HeadingCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = HeadingCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(HeadingCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byDate).toEqual(jasmine.any(Object));
      expect(actual.byHeading).toEqual(jasmine.any(Object));
      expect(actual.byHost).toEqual(jasmine.any(Object));
      expect(actual.bySourceId).toEqual(jasmine.any(Object));
      expect(actual.fetchCount).toEqual(jasmine.any(Object));
    });
  });

  describe('#deleteAll', () => {
    function seeds() {
      [
        {
          patientId: 9999999000,
          heading: 'procedures',
          date: 1514764800000,
          host: 'ethercis',
          sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
        },
        {
          patientId: 9999999000,
          heading: 'vaccinations',
          date: 1514795600000,
          host: 'ethercis',
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        },
        {
          patientId: 9999999111,
          heading: 'procedures',
          date: 1514734500000,
          host: 'ethercis',
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          date: 1514767800000,
          host: 'marand',
          sourceId: '33a93da2-6677-42a0-8b39-9d1e012dde12'
        }
      ].forEach(x => {
        const byPatientId = qewdSession.data.$(['headings', 'byPatientId', x.patientId, x.heading]);
        byPatientId.$(['byDate', x.date, x.sourceId]).value = 'true';
        byPatientId.$(['byHost', x.host, x.sourceId]).value = 'true';
        const bySourceId = qewdSession.data.$(['headings', 'bySourceId']);
        bySourceId.$(x.sourceId).setDocument({
          date: x.date
        });
      });
    }

    it('should delete all cache for specific host - patient - heading', async () => {
      const expected = {
        byPatientId: {
          '9999999000': {
            procedures: {
              byDate: {
                '1514767800000': {
                  '33a93da2-6677-42a0-8b39-9d1e012dde12': true
                }
              },
              byHost: {
                marand: {
                  '33a93da2-6677-42a0-8b39-9d1e012dde12': true
                }
              }
            },
            vaccinations: {
              byDate: {
                '1514795600000': {
                  '260a7be5-e00f-4b1e-ad58-27d95604d010': true
                }
              },
              byHost: {
                ethercis: {
                  '260a7be5-e00f-4b1e-ad58-27d95604d010': true
                }
              }
            }
          },
          '9999999111': {
            procedures: {
              byDate: {
                '1514734500000': {
                  'eaf394a9-5e05-49c0-9c69-c710c77eda76': true
                }
              },
              byHost: {
                ethercis: {
                  'eaf394a9-5e05-49c0-9c69-c710c77eda76': true
                }
              }
            }
          }
        },
        bySourceId: {
          '260a7be5-e00f-4b1e-ad58-27d95604d010': {
            date: 1514795600000
          },
          '33a93da2-6677-42a0-8b39-9d1e012dde12': {
            date: 1514767800000
          },
          'eaf394a9-5e05-49c0-9c69-c710c77eda76': {
            date: 1514734500000
          }
        }
      };

      seeds();

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';

      headingCache.deleteAll(host, patientId, heading);

      const actual = qewdSession.data.$('headings').getDocument();

      expect(actual).toEqual(expected);
    });
  });

  describe('byDate', () => {
    function seeds() {
      [
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12',
          date: 1514734500000
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76',
          date: 1514767800000
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: 'marand-260a7be5-e00f-4b1e-ad58-27d95604d010',
          date: 1514790100000
        }
      ].forEach(x => {
        const key = ['headings', 'byPatientId', x.patientId, x.heading, 'byDate', x.date, x.sourceId];
        qewdSession.data.$(key).value = 'true';
      });
    }

    describe('#set', () => {
      it('should set correct value', async () => {
        const expected = {
          byPatientId: {
            '9999999000': {
              procedures: {
                byDate: {
                  '1514734500000': {
                    'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12': true
                  }
                }
              }
            }
          }
        };

        const patientId = 9999999000;
        const heading = 'procedures';
        const date = 1514734500000;
        const sourceId = 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12';

        headingCache.byDate.set(patientId, heading, date, sourceId);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#delete', () => {
      it('should delete value', async () => {
        const expected = {
          byPatientId: {
            '9999999000': {
              procedures: {
                byDate: {
                  '1514767800000': {
                    'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76': true
                  },
                  '1514790100000': {
                    'marand-260a7be5-e00f-4b1e-ad58-27d95604d010': true
                  }
                }
              }
            }
          }
        };

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';
        const sourceId = 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12';
        const date = 1514734500000;

        headingCache.byDate.delete(patientId, heading, sourceId, date);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#getAllSourceIds', () => {
      it('should return all source ids', async () => {
        const expected = [
          'marand-260a7be5-e00f-4b1e-ad58-27d95604d010',
          'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76'
        ];

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';

        const actual = headingCache.byDate.getAllSourceIds(patientId, heading, { limit: 2 });

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('byHeading', () => {
    function seeds() {
      [
        {
          heading: 'procedures',
          sourceId: 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12',
        },
        {
          heading: 'procedures',
          sourceId: 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76'
        },
        {
          heading: 'problems',
          sourceId: 'marand-260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ].forEach(x => {
        const key = ['headings', 'byHeading', x.heading, x.sourceId];
        qewdSession.data.$(key).value = 'true';
      });
    }

    describe('#delete', () => {
      it('should delete single source id', async () => {
        const expected = {
          byHeading: {
            procedures: {
              'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12': true
            },
            problems: {
              'marand-260a7be5-e00f-4b1e-ad58-27d95604d010': true
            }
          }
        };

        seeds();

        const heading = 'procedures';
        const sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';

        headingCache.byHeading.delete(heading, sourceId);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#deleteAll', () => {
      it('should delete all source ids by heading', async () => {
        const expected = {
          byHeading: {
            problems: {
              'marand-260a7be5-e00f-4b1e-ad58-27d95604d010': true
            }
          }
        };

        seeds();

        const heading = 'procedures';

        headingCache.byHeading.deleteAll(heading);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('byHost', () => {
    function seeds() {
      [
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12',
          host: 'ethercis'
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76',
          host: 'ethercis'
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: 'marand-260a7be5-e00f-4b1e-ad58-27d95604d010',
          host: 'marand'
        }
      ].forEach(x => {
        const key = ['headings', 'byPatientId', x.patientId, x.heading, 'byHost', x.host, x.sourceId];
        qewdSession.data.$(key).value = 'true';
      });
    }

    describe('#set', () => {
      it('should set correct value', async () => {
        const expected = {
          byPatientId: {
            '9999999000': {
              procedures: {
                byHost: {
                  ethercis: {
                    'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12': true
                  }
                }
              }
            }
          }
        };

        const patientId = 9999999000;
        const heading = 'procedures';
        const host = 'ethercis';
        const sourceId = 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12';

        headingCache.byHost.set(patientId, heading, host, sourceId);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#delete', () => {
      it('should delete value', async () => {
        const expected = {
          byPatientId: {
            '9999999000': {
              procedures: {
                byHost: {
                  ethercis: {
                    'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76': true
                  },
                  marand: {
                    'marand-260a7be5-e00f-4b1e-ad58-27d95604d010': true
                  }
                }
              }
            }
          }
        };

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';
        const sourceId = 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12';
        const host = 'ethercis';

        headingCache.byHost.delete(patientId, heading, sourceId, host);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#exists', () => {
      it('should return false', async () => {
        const expected = false;

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';
        const host = 'foo';

        const actual = headingCache.byHost.exists(patientId, heading, host);

        expect(actual).toEqual(expected);
      });

      it('should return true', async () => {
        const expected = true;

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';
        const host = 'ethercis';

        const actual = headingCache.byHost.exists(patientId, heading, host);

        expect(actual).toEqual(expected);
      });
    });

    describe('#getAllSourceIds', () => {
      it('should return all source ids', async () => {
        const expected = [
          'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12',
          'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76',
          'marand-260a7be5-e00f-4b1e-ad58-27d95604d010'
        ];

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';

        const actual = headingCache.byHost.getAllSourceIds(patientId, heading);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('bySourceId', () => {
    function seeds() {
      [
        {
          sourceId: 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12',
          data: {
            text: 'foo'
          }
        },
        {
          sourceId: 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76',
          data: {
            text: 'bar'
          }
        },
        {
          sourceId: 'marand-260a7be5-e00f-4b1e-ad58-27d95604d010',
          data: {
            text: 'baz'
          }
        }
      ].forEach(x => {
        const key = ['headings', 'bySourceId', x.sourceId];
        qewdSession.data.$(key).setDocument(x.data);
      });
    }

    describe('#set', () => {
      it('should set new data', async () => {
        const expected = {
          bySourceId: {
            'marand-ce437b97-4f6e-4c96-89bb-0b58b29a79cb': {
              text: 'quux'
            }
          }
        };

        const sourceId = 'marand-ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
        const data = {
          text: 'quux'
        };
        headingCache.bySourceId.set(sourceId, data);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });

      it('should update existing data', async () => {
        const expected = {
          bySourceId: {
            'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12': {
              text: 'quux'
            },
            'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76': {
              text: 'bar'
            },
            'marand-260a7be5-e00f-4b1e-ad58-27d95604d010': {
              text: 'baz'
            }
          }
        };

        seeds();

        const sourceId = 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12';
        const data = {
          text: 'quux'
        };
        headingCache.bySourceId.set(sourceId, data);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#get', () => {
      it('should return null', async () => {
        const expected = null;

        seeds();

        const sourceId = 'ethercis-foo-bar-baz-quux';
        const actual = headingCache.bySourceId.get(sourceId);

        expect(actual).toEqual(expected);
      });

      it('should return data', async () => {
        const expected = {
          text: 'bar'
        };

        seeds();

        const sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';
        const actual = headingCache.bySourceId.get(sourceId);

        expect(actual).toEqual(expected);
      });
    });

    describe('#delete', () => {
      it('should delete value', async () => {
        const expected = {
          bySourceId: {
            'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12': {
              text: 'foo'
            },
            'marand-260a7be5-e00f-4b1e-ad58-27d95604d010': {
              text: 'baz'
            }
          }
        };

        seeds();

        const sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';
        headingCache.bySourceId.delete(sourceId);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('byVersion', () => {
    function seeds() {
      [
        {
          sourceId: 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12',
          version: 1,
          data: {
            text: 'foo'
          }
        },
        {
          sourceId: 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12',
          version: 2,
          data: {
            text: 'foo-2'
          }
        },
        {
          sourceId: 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76',
          version: 1,
          data: {
            text: 'bar'
          }
        },
        {
          sourceId: 'marand-260a7be5-e00f-4b1e-ad58-27d95604d010',
          version: 1,
          data: {
            text: 'baz'
          }
        }
      ].forEach(x => {
        const key = ['headings', 'bySourceId', x.sourceId, 'versions', x.version];
        qewdSession.data.$(key).setDocument(x.data);
      });
    }

    describe('#set', () => {
      it('should set data', async () => {
        const expected = {
          bySourceId: {
            'marand-ce437b97-4f6e-4c96-89bb-0b58b29a79cb': {
              versions: {
                '1': {
                  text: 'quux'
                }
              }

            }
          }
        };

        const sourceId = 'marand-ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
        const version = 1;
        const data = {
          text: 'quux'
        };
        headingCache.byVersion.set(sourceId, version, data);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#get', () => {
      it('should return null', async () => {
        const expected = null;

        seeds();

        const sourceId = 'ethercis-foo-bar-baz-quux';
        const version = 1;
        const actual = headingCache.byVersion.get(sourceId, version);

        expect(actual).toEqual(expected);
      });

      it('should return data', async () => {
        const expected = {
          text: 'bar'
        };

        seeds();

        const sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';
        const version = 1;
        const actual = headingCache.byVersion.get(sourceId, version);

        expect(actual).toEqual(expected);
      });
    });

    describe('#delete', () => {
      it('should delete value', async () => {
        const expected = {
          bySourceId: {
            'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12': {
              versions: {
                '1': {
                  text: 'foo'
                },
                '2': {
                  text: 'foo-2'
                }
              }

            },
            'marand-260a7be5-e00f-4b1e-ad58-27d95604d010': {
              versions: {
                '1': {
                  text: 'baz'
                }
              }
            }
          }
        };

        seeds();

        const sourceId = 'ethercis-eaf394a9-5e05-49c0-9c69-c710c77eda76';
        const version = 1;
        headingCache.byVersion.delete(sourceId, version);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#getAllVersions', () => {
      it('should return data', async () => {
        const expected = [2, 1];

        seeds();

        const sourceId = 'ethercis-33a93da2-6677-42a0-8b39-9d1e012dde12';
        const actual = headingCache.byVersion.getAllVersions(sourceId);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('fetchCount', () => {
    function seeds() {
      qewdSession.data.$(['headings', 'byPatientId', 9999999000, 'procedures', 'fetch_count']).setDocument({});
    }

    describe('#increment', () => {
      it('should increment value', async () => {
        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';
        const actual1 = headingCache.fetchCount.increment(patientId, heading);
        const actual2 = headingCache.fetchCount.increment(patientId, heading);

        expect(actual1).toBe(1);
        expect(actual2).toBe(2);
      });
    });
  });
});
