# QEWD-Courier-QUp

## QEWD-Up Version of QEWD Courier

Notes and Installation Instructions

# Purpose

This repository is designed to provide a template for re-designing and re-structuring QEWD-Courier using the QEWD-Up Design Pattern.

As far as possible it uses the original QEWD-Courier REST API handler modules and their dependent sub-modules, with the minimum of changes.  Most of the changes are in terms of the folders and sub-folders in which the handler modules and their dependent sub-modules reside.

Although probably about 90% of the original Helm/QEWD-Courier functionality has been migrated into this modules, there are still a small number of APIs that will need to be ported.  It is intended that the required re-design patterns for these should be clear from the APIs that are included in this repository.


# Contents

You'll see three main folders:

- **main**: The QEWD-Up Version of the original Helm QEWD-Courier Middle Tier
- **oidc_provider**: A standalone version of the OpenId Connect Server used by Helm for user authentication.  This is no longer treated as a QEWD-Courier MicroService, but should be considered as a separate piece of functionality.
- **yottaDB**: Pre-initialised YottaDB files for use by each of the QEWD-Courier MicroServices.  These reside on your host machine and therefore allow persistence of data between restarts of your MicroServices

# Pre-Requisites

- Docker should be installed

- **Important**: Pull a new copy of the very latest Dockerised version of QEWD:

        sudo docker pull rtweed/qewd-server

- If you are using a Digital Ocean Docker Droplet (ie their Droplet instance that has Docker pre-installed), you need to be aware that it is pre-configured with a simple firewall.  You need to open up two ports for use by the external-facing QEWD Courier services:

        sudo ufw allow 8080
        sudo ufw allow 8000

- You'll need to create a custom Docker network:

        sudo docker network create qewd-net

- Clone a copy of the repository into a folder on your host machine.  For the purposes of this document, it will be assumed you've cloned it into *~/qewd-courier* but you can use any folder name you want - adjust the commands with which you start the QEWD-Courier MicroServices appropriately.


## Authorization and Authentication
Documentation about OIDC Provider and Auth0 mechanism, please check link [Authorization Services](auth_services.md) 

# Starting the QEWD-Courier MicroServices



## Orchestrator

      sudo docker run -it --name orchestrator --rm --net qewd-net -p 8080:8080 -v ~/qewd-courier/main:/opt/qewd/mapped -v ~/qewd-courier/yottadb/orchestrator:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server

**Note:** replace *-it* with *-d* to run it as a background daemon process.


## auth_service

        sudo docker run -it --name auth_service --rm --net qewd-net -p 8081:8080 -v ~/qewd-courier/main:/opt/qewd/mapped -e microservice="auth_service" -v ~/qewd-courier/yottaDB/auth_service:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server

**Note:** replace *-it* with *-d* to run it as a background daemon process.


## openehr_service

        sudo docker run -it --name openehr_service --rm --net qewd-net -p 8082:8080 -v ~/qewd-courier/main:/opt/qewd/mapped -e microservice="openehr_service" -v ~/qewd-courier/yottaDB/openehr_service:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server

**Note:** replace *-it* with *-d* to run it as a background daemon process.



## discovery_service

        sudo docker run -it --name discovery_service --rm --net qewd-net -p 8083:8080 -v ~/qewd-courier/main:/opt/qewd/mapped -e microservice="discovery_service" -v ~/qewd-courier/yottaDB/discovery_service:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server

**Note:** replace *-it* with *-d* to run it as a background daemon process.


## QEWD as REST API
If you want to use QEWD as REST API. For example, you are developing frontend (client) side and you need data from QEWD. For this you need to add your Private IP address to global_config.json.

    "index_url": "http://192.168.1.78:3000",
Also, you should add parameter cors with value true to config.json

    "qewd": {
          "serverName": "Helm Orchestrator",
          "poolSize": 4,
          "cors": true
        }
Also you should add parameter cookie_path with value "/" in global_config.json

    "cookie_path": "/"



## Towards Qewd HIT Platform
Some of this functionality has been migrated towards a refactored version known as the Qewd HIT platform, where further refinements to the openEHR MS in particular are the subject of the latest R&D on integration to/from openEHR systems - consider as R&D for now
