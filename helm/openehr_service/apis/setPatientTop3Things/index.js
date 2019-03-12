var uuid = require('uuid/v4');
var tools = require('../../../utils/tools');

function postTop3Things(args, finished) {

	var payload = args.req.body;
	var patientId = args.patientId;

	// override patientId for PHR Users - only allowed to see their own data

	if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

	var valid = tools.isPatientIdValid(patientId);

	if (valid.error) return finished(valid);

	console.log('postTop3Things - payload = ' + JSON.stringify(payload));

	if (!payload.name1 || payload.name1 === '') {
		return finished({error: 'You must specify at least 1 Top Thing'});
	}

	if (!payload.description1 || payload.description1 === '') {
		return finished({error: 'You must specify at least 1 Top Thing'});
	}

	if (!payload.name2 || payload.name2 === '') {
		if (payload.description2 && payload.description2 !== '') {
			return finished({error: 'A Description for the 2nd Top Thing was defined, but its summary name was not defined'});
		}
		payload.name2 = '';
		payload.description2 = '';
	}
	else {
		payload.description2 = payload.description2 || '';
	}

	if (!payload.name3 || payload.name3 === '') {
		if (payload.description3 && payload.description3 !== '') {
			return finished({error: 'A Description for the 3rd Top Thing was defined, but its summary name was not defined'});
		}
		payload.name3 = '';
		payload.description3 = '';
	}
	else {
		payload.description3 = payload.description3 || '';
	}

	var doc = this.db.use('Top3Things');
	// create a sourceId uuid
	var sourceId = uuid();
	var dateCreated = new Date().getTime();

	doc.$(['bySourceId', sourceId]).setDocument({
		patientId: patientId,
		date: dateCreated,
		data: payload
	});

	byPatient = doc.$(['byPatient', patientId]);
	byPatient.$(['byDate', dateCreated]).value = sourceId;
	byPatient.$('latest').value = sourceId;

	finished({sourceId: sourceId});
}

module.exports = postTop3Things;
