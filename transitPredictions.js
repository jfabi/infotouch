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
        
var transitPredictionsUpdate = function nextServiceUpdate() {

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
                        }
                    }

                    for (i = 0; i < allPredictions.length; i++) {
                        if (allPredictions[i]['attributes']['departure_time'] == null) {
                            continue;
                        }
                        var stopId = allPredictions[i]['relationships']['stop']['data']['id'];
                        var routeId = allPredictions[i]['relationships']['route']['data']['id'];
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
                        var textColor = infoAboutRoutes[routeId]['textColor'];
                        var backgroundColor = infoAboutRoutes[routeId]['backgroundColor'];

                        htmlForPredictions += '<span class="prediction">'
                        htmlForPredictions += '<span class="route" style="color: #' + textColor;
                        htmlForPredictions += '; background-color: #' + backgroundColor + '">&nbsp;';
                        htmlForPredictions += routeDisplay + '&nbsp;</span>&nbsp;';
                        htmlForPredictions += '<span class="headsign">' + displayablePredictions[key]['headsign'] + '</span>&nbsp';
                        htmlForPredictions += '<span class="countdown">';
                        for (i = 0; i < displayablePredictions[key]['predictions'].length; i++) {
                            htmlForPredictions += displayablePredictions[key]['predictions'][i];
                            if (i + 1 < displayablePredictions[key]['predictions'].length) {
                                // Separate out each predictions
                                htmlForPredictions += ', ';
                            }
                        }
                        htmlForPredictions += '</span>&nbsp';
                        htmlForPredictions += '</span><br/>';
                    }
                }

                if (document.getElementById('transit-predictions') == null && htmlForPredictions != '') {
                    $('#main').append('<div id="transit-predictions"></div>');
                    document.getElementById('transit-predictions').innerHTML = htmlForPredictions;
                    $('.rotation-group').slick('slickAdd', '#transit-predictions');
                } else if (htmlForPredictions != '') {
                    document.getElementById('transit-predictions').innerHTML = htmlForPredictions;
                } else if (document.getElementById('transit-predictions') != null) {
                    // Remove object from current rotation
                    $('.rotation-group').slick('slickRemove', $('#transit-predictions').attr('data-slick-index'))
                }
            }
        });
    });

};

transitPredictionsUpdate();
setInterval(transitPredictionsUpdate,30000);
