# Notes

This version of QEWD-Courier has been migrated / re-designed to conform with the design patterns and principles of QEWD-Up.


The configuration in */configuration/config.json* defines an Orchestrator and 3 MicroServices:

- auth_service: Looks after the OIDC Client functionality
- openehr_service: Looks after interfacing with EtherCIS / OpenEHR
- discovery_service: Looks after interfacing with Discovery Data Service (DDS)

The REST API routes that I've implemented can be found in the standard */configuration/routes.json* file.  Add any additional ones into this file and restart the Orchestrator and any affected MicroServices


The majority of the complexity of the application is within the handling of the */api/initialise* API.  Much of the complexity is handled by QEWD-Up Event Hook modules.  Each one contains details explanations of its purpose and function, but it's important to understand the sequence of events for the */api/initialise* API.  In summary:

- all REST API requests from PulseTile are received by the Orchestrator and pre-processed by the *onWSRequest* event hook.

- the message is forwarded to the *initialise* handler (*index.js*) in the *auth_service* MicroService

  - if the incoming request had no JWT (if a brand new user) or the JWT had expired, then the URL of the OIDC server is returned - PulseTile uses this to redirect to the OIDC server for user authentication.

  - otherwise the request is considered to be either authenticated or in the process of being authenticated and/or its data being made ready. The auth_service's *initialise* handler can't do any more at this stage and an *authenticated* response message is returned by the handler.

- The response is picked up on the Orchestrator and handled by the *onOrchResponse* module.  It is looking for responses from the *initialise* handler with an *authenticated* response.  If DDS data integration is enabled (see the *global_config.json* file), then a new */api/openehr/check* request is sent to the openehr_service

- On arrival at the openehr_service, the *beforeHandler* module is triggered - this links up the incoming user's request with a QEWD Session (which will be used for data cacheing for the user).  If this is the first time the user's JWT is seen, a new QEWD session is created.  If the JWT is recognised, then its unique *uid* property is used to set up a pointer to the user's existing QEWD Session

- the */api/openehr/check* handler (*ddsUpdateCheck*) on the openehr_service is now invoked.

  - The first time this is received for the user, it sets a QEWD session flag saying that the DDS data loading is now under way and returns a *data_loading* response.

  - if this is the 2nd or subsequent time this request has been received (ie during /api/initialise polling by PulseTile), the session flag is checked.  

    - If its status is still that it is still loading DDS data into EtherCIS, then a *data_loading* response is returned

    - If its status is that the data loading has completed, a "ready* response is returned

- The above responses are next picked up by the *onMSResponse* handler for the *ddsUpdateCheck* API.  If this is the first *data_loading* response, then a sequence is commenced that takes place in the background, whereby requests for all the clinical headings are sent to DDS and they are written back/merged into the EtherCIS system.  This is done by the openehr_service sending /api/discovery/{patientId}/{heading} requests to the discovery_service - the returned response is then written to EtherCIS (via a /discovery/merge/{heading} message sent to an openehr_service QEWD Worker.  When this sequence is completed, this background processing sets the user's Session status to *ready*

- meanwhile the /api/openehr/check response is returned by the *onMSResponse* handler, which returns it to the Orchestrator where it is picked up by the callback function of the *onOrchResponse* handler for the *initialise* handler (auth_service).  *loading_data* responses pass through.  If a *ready* response is received, however, it has one last thing to do - to prevent a possible race condition in PulseTile, it now sends a request to DDS to pre-fetch the user's demographics (/api/demographics/dummy to discovery_service).  Only when the demographics are returned (and, in doing so, cached in the user's Session in the discovery_service [the discovery_service API *beforeHandler* creates and maintains the user's Session via the JWT]) is the *ready* response returned - but it's actually transformed into the final format expected by PulseTile - {ok: true, mode: 'secure'}.  When PulseTile receives this response, it knows that it can stop polling, the user's data is ready, and it can begin bringing up the UI and fetching the user's data.

- Note that there is one last event hook - the Orchestrator *onWSResponse* module - it is looking for other responses to transform, but has to manually return the response to PulseTile.


## The onWSResponse Module on the Orchestrator

This contains detailed notes on what it does, but note that it is invoked for ALL outgoing responses, most of which it just writes out unchanged.

























