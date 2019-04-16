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

  16 April 2019

*/

'use strict';

const ExtraHeading = Object.freeze({
  FINISHED: 'finished'
});

const Heading = Object.freeze({
  COUNTS: 'counts',
  FEEDS: 'feeds',
  TOP_3_THINGS: 'top3Things',
  RESPECT_FORMS: 'respectforms',
});

const Top3ThingFormat = Object.freeze({
  LATEST: 'latest',
  HSCN: 'hscn',
});

const PostHeadingFormat = Object.freeze({
  JUMPER: 'openehr-jumper',
  PULSETILE: 'pulsetile'
});

const QueryFormat = Object.freeze({
  AQL: 'aql',
  SQL: 'sql'
});

const RecordStatus = Object.freeze({
  LOADING: 'loading_data',
  READY: 'ready'
});

const ResponseFormat = Object.freeze({
  DETAIL: 'detail',
  SUMMARY: 'summary',
  SYNOPSIS: 'synopsis'
});

const Role = Object.freeze({
  PHR_USER: 'phrUser'
});

const UserMode = Object.freeze({
  ADMIN: 'admin'
});

module.exports = {
  ExtraHeading,
  Heading,
  PostHeadingFormat,
  QueryFormat,
  RecordStatus,
  ResponseFormat,
  Role,
  UserMode,
  Top3ThingFormat
};
