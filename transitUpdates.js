// Written by Joshua Fabian, jfabi@alum.mit.edu

//  MBTA service predictions (updates once every 30 seconds)

var stopsFilter = '';
if (listOfStops != '') {
    stopsFilter = '&filter[stop]=' + listOfStops;
}
var routesFilter = '';
if (listOfRoutes != '') {
    routesFilter = '&filter[route]=' + listOfRoutes;
}
        
var serviceUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api-v3.mbta.com/predictions?include=trip,route&sort=departure_time" + stopsFilter + routesFilter,
            dataType : "json",
            success : function(parsed_json) {

                var allPredictions = parsed_json['data'];
                var allIncluded = parsed_json['included'];
                var predictions = [];
                var infoAboutTrips = {};
                var infoAboutRoutes = {};
                var htmlForPredictions = '';

                for (i = 0; i < allIncluded.length; i++) {
                    if (allIncluded[i]['type'] == 'trip') {
                        var tripId = allIncluded[i]['id'];
                        var tripHeadsign = allIncluded[i]['attributes']['headsign'];
                        var tripName = allIncluded[i]['attributes']['name'];
                        infoAboutTrips[tripId] = {};
                        infoAboutTrips[tripId]['headsign'] = tripHeadsign;
                        infoAboutTrips[tripId]['name'] = tripName;
                    } else if (allIncluded[i]['type'] == 'route') {
                        var routeId = allIncluded[i]['id'];
                        var textColor = allIncluded[i]['attributes']['text_color'];
                        var backgroundColor = allIncluded[i]['attributes']['color'];
                        var longName = allIncluded[i]['attributes']['long_name'];
                        var shortName = allIncluded[i]['attributes']['short_name'];
                        infoAboutRoutes[routeId] = {};
                        infoAboutRoutes[routeId]['textColor'] = textColor;
                        infoAboutRoutes[routeId]['backgroundColor'] = backgroundColor;
                        infoAboutRoutes[routeId]['longName'] = longName;
                        infoAboutRoutes[routeId]['shortName'] = shortName;
                    }
                }

                for (i = 0; i < allPredictions.length; i++) {
                    if (allPredictions[i]['attributes']['departure_time'] == null) {
                        continue;
                    }
                    var stopId = allPredictions[i]['relationships']['stop']['data']['id'];
                    var routeId = allPredictions[i]['relationships']['route']['data']['id'];
                    var routeDisplay = infoAboutRoutes[routeId]['shortName'];
                    if (routeDisplay == '') {
                        routeDisplay = infoAboutRoutes[routeId]['longName'];
                    }
                    var textColor = infoAboutRoutes[routeId]['textColor'];
                    var backgroundColor = infoAboutRoutes[routeId]['backgroundColor'];
                    var tripId = allPredictions[i]['relationships']['trip']['data']['id'];
                    var headsign = infoAboutTrips[tripId]['headsign'];
                    if (headsign == 'University Park') {
                        continue;
                    }
                    var departure = new Date(allPredictions[i]['attributes']['departure_time']);
                    var rawCountdown = (departure.getTime() - Date.now()) / 1000;
                    if (minimumWalkingMinutes[stopId] > Math.round(rawCountdown/60)) {
                        continue;
                    }
                    var countdown = 'Err';
                    if (rawCountdown < 0) {
                        countdown = 'BRD';
                    } else if (rawCountdown < 30) {
                        countdown = 'ARR';
                    } else {
                        countdown = Math.round(rawCountdown/60) + 'm';
                    }
                    htmlForPredictions += '<span class="prediction">'
                    htmlForPredictions += '<span class="route" style="color: #' + textColor;
                    htmlForPredictions += '; background-color: #' + backgroundColor + '">&nbsp;';
                    htmlForPredictions += routeDisplay + '&nbsp;</span>&nbsp;';
                    htmlForPredictions += '<span class="headsign">' + headsign + '</span>&nbsp';
                    htmlForPredictions += '<span class="countdown">' + countdown + '</span>&nbsp';
                    htmlForPredictions += '</span><br/>';
                }

                document.getElementById('transit-predictions').innerHTML = htmlForPredictions;
            }
        });
    });

};

serviceUpdate();
setInterval(serviceUpdate,30000);

var beingClicked = false;
var longpress = 500;
var start;
