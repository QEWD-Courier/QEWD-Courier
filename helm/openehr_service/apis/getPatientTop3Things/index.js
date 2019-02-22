var tools = require('../../../utils/tools');

function getTop3ThingsDetail(args, finished) {

	var patientId = args.patientId;

	// override patientId for PHR Users - only allowed to see their own data

	if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

	var valid = tools.isPatientIdValid(patientId);
	if (valid.error) return finished(valid);

	//var doc = this.db.use('Top3Things', ['bySourceId', sourceId]);

	var doc = this.db.use('Top3Things');
	var sourceId = doc.$(['byPatient', patientId, 'latest']).value;

	/*
	if (!doc.exists) {
		return finished({error: 'Invalid SourceId'});
	}

	var top3 = doc.getDocument();
	*/

	if (sourceId === '') {
		return finished([]);
	}

	var top3 = doc.$(['bySourceId', sourceId]).getDocument();

	var detail = {
		source: 'QEWDDB',
		sourceId: sourceId,
		dateCreated: top3.date,
		name1: top3.data.name1,
		description1: top3.data.description1,
		name2: top3.data.name2,
		description2: top3.data.description2,
		name3: top3.data.name3,
		description3: top3.data.description3
	};

	finished(detail);
}

module.exports = getTop3ThingsDetail;
