exports.handler = function(context, event, callback) {
	
	const patientList = ['test.csv']
	const response = new Twilio.Response();
	// Set the CORS headers to allow Flex to make an error-free HTTP request
	// to this Function
	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
	response.appendHeader('Content-Type', 'application/json');
	response.setBody(patientList);
	// Return a success response using the callback function
	return callback(null, response);
	
	// callback(null, patientList);
};
