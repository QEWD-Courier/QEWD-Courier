/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
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

const DocumentStore = require('ewd-document-store');
const DbGlobals = require('ewd-memory-globals');
const sessions = require('ewd-session');
const globalConfig = require('../support/configuration.json');
const { clone } = require('../helpers/utils');

module.exports = function () {
  this.db = new DbGlobals();
  this.documentStore = new DocumentStore(this.db);

  sessions.init(this.documentStore);
  this.sessions = sessions;

  this.jwt = {};
  this.userDefined = {
    globalConfig: clone(globalConfig)
  };

  this.db.reset = () => this.db.store.reset();
  this.db.use = (documentName, ...subscripts) => {
    if (subscripts.length === 1 && Array.isArray(subscripts[0])) {
      subscripts = subscripts[0];
    }

    return new this.documentStore.DocumentNode(documentName, subscripts);
  };

  this.qewdSessionByJWT = jasmine.createSpy();
};
