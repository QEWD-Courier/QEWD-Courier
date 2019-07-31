## QEWD Courier authorization services
QEWD Courier has two different authentication mechanisms that provides ability to login users with different roles.
These two mechanisms based on JWT Token authentication that provide user information via token.
1) Oidc Provider - OpenID Connect is a simple identity layer on top of the OAuth 2.0 protocol. It allows Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server, as well as to obtain basic profile information about the End-User in an interoperable and REST-like manner.
2) Auth0 - Auth0 provides authentication and authorization as a service. It is 3rdy service that contains a lot of functionality for managing users and authentication in one place.
For more information about setup of those providers, please check documentation below


## OIDC Provider configuration for QEWD Courier
For using OIDC Provider you should change configuration files customise the Global Configuration file: */configuration/global_config.json*

1) Change the host names/IP addresses that are used by the OIDC Client within QEWD-Courier (*auth_service*), ie these lines:


          "oidc_client": {
            "hosts": {
              "oidc_server": "http://192.168.1.78:8000", // url to auth0 provider or oidc provider
              "orchestrator": "http://192.168.1.78:8080"
            },

2) Replace the Discovery Data Service (DDS) test account username and password:

        "DDS": {
          "auth": {
            "host": "https://devauth.discoverydataservice.net",
            "path": "/auth/realms/endeavour/protocol/openid-connect/token",
            "username": "xxxxxxxx",
            "password": "yyyyyyyyyyy",


3) Replace the EtherCIS username/passwords with correct ones.  You might also want to use an EtherCIS server at a different domain name/IP address.

        "openehr": {
          "servers": {
            "ethercis": {
              "url": "http://46.101.81.30:8080",
              "username": "xxxxxx",
              "password": "yyyyyy",


4) You'll also need to amend the OIDC Configuration file: *~/qewd-courier/oidc_provider/settings/configuration.json*.  You'll need to set the *conductor* and *openid_connect* host and ports to match your *main global_config.json* file's *oidc_client* settings for *orchestrator* and *oidc_server* respectively, ie edit this section:

        "phr": {
          "microservices": {
            "conductor": {
              "host": "http://mango-cookie.ripple.foundation",
              "port": 8080
            },
            "openid_connect": {
              "host": "http://mango-cookie.ripple.foundation",
              "port": 8000,

  eg:

            "conductor": {
              "host": "http://192.168.1.78",
              "port": 8080
            },
            "openid_connect": {
              "host": "http://192.168.1.78",
              "port": 8000,


  to match the global_config.json's settings:

          "oidc_client": {
            "hosts": {
              "oidc_server": "http://192.168.1.78:8000",
              "orchestrator": "http://192.168.1.78:8080"



  You'll notice in this file that Two-Factor Authentication is disabled:

        "use2FA": false,

  Which means that the settings for *twilio* and the *email_server* are ignored, so just leave them alone for now.  

  If, later on, you set *use2FA* to *true*, you'll need to set valid credentials for *twilio* and the *email_server*

### OIDC Provider docker and role access setup

        sudo docker run -it --rm --name oidc -p 8000:8080 -v ~/qewd-courier/oidc_provider/openid-connect-server:/opt/qewd/mapped -v ~/qewd-courier/oidc_provider/openid-connect-server/www:/opt/qewd/www -v ~/qewd-courier/oidc_provider/settings:/opt/qewd/mapped/settings -v ~/qewd-courier/yottaDB/oidc_provider:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server

The first time you start the OIDC Provider container, it will configure the OIDC service using data held in the file *~/qewd-courier/oidc_provider/openid-connect-server/documents.json*.  This file is automatically deleted after it loads first time.

You can use the OIDC-Admin application to amend this configuration information.  Login using:

        username: rob.tweed@gmail.com
        password: password


A single Helm / QEWD-Courier user has been pre-defined, again with the credentials:

        username: rob.tweed@gmail.com
        password: password


Note: this version of QEWD-Courier has Two Factor Authentication disabled.  All users you create will automatically have a password of *password*.

### Nb re Roles Based Access Control 

In this release we have set the default user role to 'IDCR' (aka Integrated Digital Care Record access/aka Professional users).
This is an interim solution pending an OIDC upgrade due shortly, which will allow several user roles, PHR/IDCR etc

Please amend the role to 'phrUser' if using this middleware for PHR (Personal Health Record) purposes

Please check /main/auth_service/apis/oidc_callback/index.js where the *session.role* can be amended for now



## Auth0 configuration for QEWD Courier

Also you can use authorization service which calls Auth0, instead of OIDC Client.
Go to `main/configuration/global_config.json` and change **oidc_server** url, you should provide correct url to auth0 service 

          "oidc_client": {
            "hosts": {
              "oidc_server": "http://192.168.1.78:8000", // url to auth0 provider or oidc provider
              "orchestrator": "http://192.168.1.78:8080"
            }
            
Next step you should change auth0 config values in `main/configuration/global_config.json`, those data you can see in your management panel on **https://auth0.com** 

          "auth0": {
                  "domain": "",
                  "client_id": "",
                  "client_secret": "",
                  "grant_type": "authorization_code",
                  "redirect_uri": "http://192.168.1.78:8080", // url should redirect to orchestrator MS
                  "auth_endpoint": "/oauth/token"
          }
          
And last step you should change handler in `main/configuration/routes.json`
          
          {
              "uri": "/api/auth/token",
              "method": "GET",
              "handler": "auth0_callback" // or you can use "oidc_callback" for OpenID provider aproach 
              "on_microservice": "auth_service",
              "authenticate": false
            }
          
If you want use OpenId provider approach, please change handler values to `"handler: oidc_callback"`*


## Installation of Auth0 Provider

First thing you should do its go to auth0_provider folder and create .env file, please check .env.example as reference.
.env file must have the same values as you add to main/configuration/global_config.json.

### Project installation and start
Please go to **auth0_provider** folder and install needed dependencies via `npm install` and start auth0 provider via `npm start`.

### Docker installation
Or you can use docker container. Please go to auth0_provider and change docker-compose.yml file, there will be path to your project folder in **volumes** parameter
Next step, you should type `docker-compose up -d`, it will create new container with all needed dependencies and start auth0 provider on port 8080

### Setup role base access for Auth0 Provider 
In your Auth0 management panel, go to **Rules** tab and add 3 empty rules.
1.  Role rule, here we will provide user role dependence on email.

          function (user, context, callback) {
            user.app_metadata = user.app_metadata || {};
            // You can add a Role based on what you want
            // In this case I check domain
            var addRolesToUser = function(user, cb) {
              if (user.email.indexOf('@gmail.com') > -1) {
                cb(null, 'PHR'); // if a gmail signup then assign as patient ie PHR role
                //user.app_metadata.nhs_number = user.app_metadata.nhs_number || '9999999000';
               } else {
                cb(null, 'IDCR'); // else assign as a clinician ie IDCR role
              }
            };
          
            addRolesToUser(user, function(err, role) {
              if (err) {
                callback(err);
              } else {
                user.app_metadata.role = role;
                auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
                  .then(function(){
                    callback(null, user, context);
                  })
                  .catch(function(err){
                    callback(err);
                  });
              }
            });
          }
2. Rule for nhsNumber, here we will provide user nhsNumber dependence on email. NhsNumber assign only for patients (PHR)
        
          function (user, context, callback) {
            user.app_metadata = user.app_metadata || {};
            // You can add a Role based on what you want
            // In this case I check domain
            var addIDNumToUser = function(user, cb) {
              if (user.email.indexOf('@gmail.com') > -1) {
                cb(null, "9999999098");
              } else {
                cb(null, null);
              }
            };
          
            addIDNumToUser(user, function(err, nhs_number) {
              if (err) {
                callback(err);
              } else {
                user.app_metadata.nhs_number = nhs_number;
                auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
                  .then(function(){
                    callback(null, user, context);
                  })
                  .catch(function(err){
                    callback(err);
                  });
              }
            });
          }
3. Rule for adding role, nhsNumber and user name into JWT token
        
          function (user, context, callback) {
                const namespace = 'https://example.com_';
                context.idToken[namespace + 'role'] = user.app_metadata.role;
                context.idToken[namespace + 'nhs_number'] = user.app_metadata.nhs_number;
                context.idToken[namespace + 'given_name'] = user.given_name ? user.given_name : user.user_metadata.given_name;
                context.idToken[namespace + 'family_name'] = user.family_name ? user.family_name : user.user_metadata.family_name;
                callback(null, user, context);
              }
              
You can change namespace value to another, but it should be like url. If you changed namespace you also should change this parameter in `main/auth_service/apis/auth0_callback/index.js` where we retrieving this data from **verify_jwt** variable.

**Important notice !!!** Make sure that you are using correct order of rules, last rule must be `Rule for adding role, nhsNumber and user name into JWT token` 


(PS This approach to authentication services allows us to offer a choice between providers, but we wish to refactor this further in due course, towards an even tidier codebase.. see related discussion here.. https://github.com/QEWD-Courier/QEWD-Courier/pull/91 )
