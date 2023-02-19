// Written by Joshua Fabian, jfabi@alum.mit.edu

// For transit predictions
var transitStops = ['75', '97'];
var transitStopsMinimumWalkMinutes = {
	'75': 3,
	'97': 4
};
// For transit predictions, transit alerts
var transitRoutes = ['1', '701'];
// For shared mobility status
var sharedMobilityStations = {
	'Bluebikes': ['26', '27', '29']
};
var sharedMobilityStationOverrides = {
	'Bluebikes': {
		'27': 'Roxbury Crossing'
	}
};
// For weather forecast, severe weather updates
var weatherOffice = 'BOX';
var weatherStation = 'KBOS';
var weatherPoint = {
	'latitude': 42.35824,
	'longitude': -71.09281
};
var weatherGridPoint = {
	'x': 72,
	'y': 85
};
// For light control
var lifxToken = '1234567890';
// For message status
var googleDocumentID = '1234567890';
var googleAPIKey = '1234567890'
