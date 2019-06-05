// Written by Joshua Fabian, jfabi@alum.mit.edu

// Minimum walking times from named stops expressed in minute values
var minimumWalkingMinutes = {
	75: 3,
	97: 4
};

var listOfStops = '75,97';
var listOfRoutes = '1,701';
var sharedMobilityStations = {
	'Bluebikes': ['26', '27', '29']
}
var sharedMobilityStationOverrides = {
	'Bluebikes': {
		'27': 'Roxbury Crossing'
	}
}
var weatherPoint = '42.35824,-71.09281';
var weatherStation = 'KBOS';
var lifxToken = '1234567890';
var twitterKey = '1234567890';
var twitterSecret = '1234567890'