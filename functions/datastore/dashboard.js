exports.handler = function(context, event, callback) {
	const dashboardData =  {
		surveyName: 'Survey-2022',
		patients: [
			{
				name: 'John Doe',
				status: 'pending',
				results: [
					{
						"text" : "Do you have allergies?",
						"type" : "boolean",
						"answer": "",
					},
					{
						"text" : "The provider listened carefully to me",
						"type" : "boolean",
						"answer": ""
					},
					{
						"text" : "Leave feedback",
						"type" : "text",
						"answer": ""
					}
				]
			},
			{
				name: 'Mary Sue',
				status: 'sent',
				results: [
					{
						"text" : "Do you have allergies?",
						"type" : "boolean",
						"answer": "false",
					},
					{
						"text" : "The provider listened carefully to me",
						"type" : "boolean",
						"answer": "true"
					},
					{
						"text" : "Leave feedback",
						"type" : "text",
						"answer": "All was good"
					},
					
				]
			},
			{
				name: 'Jack Smith',
				status: 'Scheduling',
				results: []
			},
		]
	}
	const response = new Twilio.Response()
	// Set the CORS headers to allow Flex to make an error-free HTTP request
	// to this Function
	response.appendHeader('Content-Type', 'application/json');
	
	if (context.DOMAIN_NAME.startsWith('localhost:')) {
		response.appendHeader('Access-Control-Allow-Origin', '*');
		response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
		response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
	}
	
	response.setStatusCode(200);
	response.setBody(dashboardData);
	// Return a success response using the callback function
	return callback(null, response);
}
