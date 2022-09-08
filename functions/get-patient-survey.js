exports.handler = function(context, event, callback) {
	const response = new Twilio.Response({
		"resourceType" : "Questionnaire",
		"id" : "3141",
		"title" : "Basic Questionnaire",
		"status" : "draft",
		"experimental" : true,
		"subjectType" : ["Patient"],
		"item" : [{
			"linkId" : "1",
			"text" : "Do you have allergies?",
			"type" : "boolean"
		},
			{
				"linkId" : "2",
				"text" : "Leave feedback",
				"type" : "text"
			}
		]
	});
	// Set the CORS headers to allow Flex to make an error-free HTTP request
	// to this Function
	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
	response.appendHeader('Content-Type', 'application/json');
	response.setBody(response);
	// Return a success response using the callback function
	return callback(null, response);
	
};
