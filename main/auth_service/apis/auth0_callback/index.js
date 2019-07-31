/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2019 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
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

  7 February 2019

*/

// Handler for OIDC Callback URL: /api/auth/token

var jwt = require('jwt-simple');
const request = require('request');
const uuidv4 = require('uuid/v4');
var credentials = require('/opt/qewd/mapped/configuration/global_config.json').oidc_client.urls.auth0;
var errorCallback;

process.on('unhandledRejection', function(reason, p){
  console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging here
  errorCallback({error: reason});
});

module.exports = function(args, finished) {
  const query = args.req.query;
  if (args.req.query.error) {
    let error = args.req.query.error;
    if (args.req.query.error_description) {
      error = error + ': ' + args.req.query.error_description;
    }
    return finished({error: error});
  }
  
  const auth = this.oidc_client.config;
  const indexUrl = auth.index_url || '/index.html';
  const pieces = indexUrl.split('/');
  pieces.pop();
  let cookiePath = pieces.join('/');
  if (cookiePath === '') cookiePath = '/';
  
  const data = {
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    code: query.code,
    grant_type: credentials.grant_type,
    redirect_uri: credentials.redirect_uri
  };
  
  request.post({
    url: `${credentials.domain + credentials.auth_endpoint}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: data,
    method: 'POST'
  }, function (e, r, body) {
    const response = JSON.parse(body);
    
    if (response.error) {
      return finished({error: response.error})
    }
    
    const verify_jwt = jwt.decode(response.id_token, null, true);
    const session = args.session;
    session.email = verify_jwt.email;
    session.authenticated = true;
    session.timeout = response.expires_in;
    session.nhsNumber = verify_jwt['https://showcase-auth0.ripple.foundation_nhs_number'];
    session.uid = uuidv4();
    session.openid = verify_jwt;
    session.openid.firstName = verify_jwt['https://showcase-auth0.ripple.foundation_given_name'];
    session.openid.lastName = verify_jwt['https://showcase-auth0.ripple.foundation_family_name'];
    session.openid.role = verify_jwt['https://showcase-auth0.ripple.foundation_role']; // we are using this key because custom claims in auth0 allowed only http prefix structure, please check auth0 custom rules for more details
    session.openid.id_token = response.id_token;
    
    finished({
      ok: true,
      oidc_redirect: auth.index_url,
      cookiePath: cookiePath,
      cookieName: auth.cookie_name || 'JSESSIONID'
    });
  });
};
