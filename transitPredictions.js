// Written by Joshua Fabian, jfabi@alum.mit.edu

//  MBTA service predictions (updates once every 30 seconds)

var stopsFilter = '';
if (transitStops != '') {
    stopsFilter = '&filter[stop]=' + transitStops;
}
var routesFilter = '';
if (transitRoutes != '') {
    routesFilter = '&filter[route]=' + transitRoutes;
}
        
var transitPredictionsUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api-v3.mbta.com/predictions?include=trip,route,vehicle&sort=departure_time" + stopsFilter + routesFilter,
            dataType : "json",
            success : function(parsed_json) {

                var allPredictions = parsed_json['data'];
                var allIncluded = parsed_json['included'];
                var predictions = [];
                var infoAboutTrips = {};
                var infoAboutRoutes = {};
                var infoAboutVehicles = {};
                var htmlForPredictions = '';
                var htmlForAlerts = '';
                var displayablePredictions = {};

                if (allPredictions != null && allIncluded != null) {
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
                        } else if (allIncluded[i]['type'] == 'vehicle') {
                            var vehicleId = allIncluded[i]['id'];
                            var occupancyStatus = allIncluded[i]['attributes']['occupancy_status'];
                            infoAboutVehicles[vehicleId] = {};
                            infoAboutVehicles[vehicleId]['occupancyStatus'] = occupancyStatus;
                        }
                    }

                    for (i = 0; i < allPredictions.length; i++) {
                        if (allPredictions[i]['attributes']['departure_time'] == null) {
                            continue;
                        }
                        var stopId = allPredictions[i]['relationships']['stop']['data']['id'];
                        var routeId = allPredictions[i]['relationships']['route']['data']['id'];
                        var tripId = allPredictions[i]['relationships']['trip']['data']['id'];
                        var headsign = infoAboutTrips[tripId]['headsign'].replace("(Limited Stops)", "<small><i>(Limited)</i></small>");
                        if (headsign == 'University Park') {
                            continue;
                        }
                        var crowding = '';
                        var crowdingImage = '';
                        if (allPredictions[i]['relationships']['vehicle']['data'] != null) {
                            var vehicleId = allPredictions[i]['relationships']['vehicle']['data']['id'];
                            crowding = infoAboutVehicles[vehicleId]['occupancyStatus'];
                            if (crowding != null) {
                                var crowdingFileName = 'crowding-none.png';
                                if (crowding == 'MANY_SEATS_AVAILABLE') {
                                    crowdingFileName = 'crowding-low.png';
                                } else if (crowding == 'FEW_SEATS_AVAILABLE') {
                                    crowdingFileName = 'crowding-medium.png';
                                } else if (crowding == 'FULL') {
                                    crowdingFileName = 'crowding-high.png';
                                }
                                crowdingImage = '<img src="icons/' + crowdingFileName + '" width="36px" style="display:inline; padding-top: 5px;">';
                            }
                        }
                        var departure = new Date(allPredictions[i]['attributes']['departure_time']);
                        var rawCountdown = (departure.getTime() - Date.now()) / 1000;
                        if (transitStopsMinimumWalkMinutes[stopId] > Math.round(rawCountdown/60)) {
                            continue;
                        }
                        var countdown = 'Err';
                        if (rawCountdown < 0) {
                            countdown = 'BRD';
                        } else if (rawCountdown < 30) {
                            countdown = 'ARR';
                        } else {
                            countdown = crowdingImage + ' ' + Math.round(rawCountdown/60) + '<span class="transit-min"> min</span>';
                        }

                        routeHeadsignKey = routeId + '-' + headsign;
                        // Show at most 2 upcoming predictions per route-headsign combination
                        if (!displayablePredictions[routeHeadsignKey]) {
                            displayablePredictions[routeHeadsignKey] = {};
                            displayablePredictions[routeHeadsignKey]['routeId'] = routeId;
                            displayablePredictions[routeHeadsignKey]['headsign'] = headsign;
                            displayablePredictions[routeHeadsignKey]['predictions'] = []
                            displayablePredictions[routeHeadsignKey]['predictions'].push(countdown);
                        } else if (displayablePredictions[routeHeadsignKey]['predictions'].length < 2) {
                            displayablePredictions[routeHeadsignKey]['routeId'] = routeId;
                            displayablePredictions[routeHeadsignKey]['headsign'] = headsign;
                            displayablePredictions[routeHeadsignKey]['predictions'].push(countdown);
                        }
                    }

                    for (var key in displayablePredictions) {
                        if (!displayablePredictions.hasOwnProperty(key)) {
                            //The current property is not a direct property of p
                            continue;
                        }
                        var routeId = displayablePredictions[key]['routeId'];
                        var routeDisplay = infoAboutRoutes[routeId]['shortName'];
                        if (routeDisplay == '') {
                            routeDisplay = infoAboutRoutes[routeId]['longName'];
                        }
                        if (routeDisplay == 'Red Line') {
                            routeDisplay = 'RL'
                        } else if (routeDisplay == 'Orange Line') {
                            routeDisplay = 'OL'
                        } else if (routeDisplay == 'Blue Line') {
                            routeDisplay = 'BL'
                        }
                        var textColor = infoAboutRoutes[routeId]['textColor'];
                        var backgroundColor = infoAboutRoutes[routeId]['backgroundColor'];

                        htmlForPredictions += '<span class="transit-prediction">'
                        htmlForPredictions += '<span class="transit-route"><span class="transit-route-label" style="color: #' + textColor;
                        htmlForPredictions += '; background-color: #' + backgroundColor + '">&nbsp;';
                        htmlForPredictions += routeDisplay + '&nbsp;</span></span>&nbsp;&nbsp;';
                        htmlForPredictions += '<span class="transit-headsign">' + displayablePredictions[key]['headsign'] + '</span>';
                        htmlForPredictions += '<span class="transit-countdown">';
                        for (i = 0; i < displayablePredictions[key]['predictions'].length; i++) {
                            if (i == 0) {
                                htmlForPredictions += '<span class="transit-first-prediction">'
                                htmlForPredictions += displayablePredictions[key]['predictions'][i];
                                htmlForPredictions += '</span>'
                            } else {
                                htmlForPredictions += displayablePredictions[key]['predictions'][i];
                            }
                            if (i + 1 < displayablePredictions[key]['predictions'].length) {
                                // Separate out each predictions
                                htmlForPredictions += '  ';
                            }
                        }
                        htmlForPredictions += '</span>&nbsp';
                        htmlForPredictions += '</span>';
                    }
                }

                if (document.getElementById('transit-predictions') == null && htmlForPredictions != '') {
                    $('#main').append('<div id="transit-predictions" class="normal-colors"></div>');
                    document.getElementById('transit-predictions').innerHTML = '<div style="padding: 10px" class="normal-colors">' + htmlForPredictions + '</div>';
                } else if (htmlForPredictions != '') {
                    document.getElementById('transit-predictions').innerHTML = '<div style="padding: 10px" class="normal-colors">' + htmlForPredictions + '</div>';
                }
            }
        });
    });

};

transitPredictionsUpdate();
setInterval(transitPredictionsUpdate,30000);
