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

const { createLogger, format, transports } = require('winston');
const jsonStringify = require('fast-safe-stringify');
const config = require('../config');

const { combine, splat, timestamp, colorize, printf, metadata } = format;
const printLog = (info) => info.metadata && Object.keys(info.metadata).length > 0
  ? `${process.pid}: ${info.timestamp} ${info.level}: ${info.message} - ${jsonStringify(info.metadata)}`
  : `${process.pid}: ${info.timestamp} ${info.level}: ${info.message}`;
const logger = createLogger({
  transports: [
    new transports.Console({
      level: config.logging.defaultLevel,
      format: combine(
        colorize(),
        splat(),
        metadata(),
        timestamp(),
        printf(printLog)
      )
    })
  ]
});

module.exports = logger;
