/*

 ----------------------------------------------------------------------------
 | ripple-oauth-openid: Ripple MicroServices for OAuth OpenId               |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
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

  4 July 2018

*/

var request = require('request')

module.exports = function (args, finished) {

  var id_token = args.session.openid.id_token
  var uri = this.oidc_client.config.end_session_endpoint

  if (!uri) return finished({
    ok: false
  })

  if (this.oidc_client.config.logout_approach === 'client') {

    uri = uri + '?id_token_hint=' + id_token
    uri = uri + '&post_logout_redirect_uri=' + this.oidc_client.config.post_logout_redirect_uri

    return finished({
      //redirectURL: 'http://www.mgateway.com:8089/session/end'
      redirectURL: uri //@TODO Please check configuration/global_config/post_logout_redirect_uri , removed slash, because we have error with redirect url
    })
  }

  if (args.session.openid && args.session.openid.id_token) {

    var options = {
      url: this.oidc_client.config.end_session_endpoint,
      method: 'GET',
      qs: {
        id_token_hint: id_token,
        //post_logout_redirect_uri: this.userDefined.auth.post_logout_redirect_uri
      },
      json: true
    }

    console.log('**** OpenId end session / logout: options - ' + JSON.stringify(options, null, 2))

    var self = this

    request(options, function (error, response, body) {
      console.log('*** logout - response = ' + JSON.stringify(response))

      finished({
        ok: true,
        redirectURL: self.oidc_client.config.post_logout_redirect_uri,
      })
    })
  }
  else {
    finished({
      ok: false
    })
  }
}
