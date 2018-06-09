// Written by Joshua Fabian, jfabi@alum.mit.edu

//  MBTA service predictions (updates once every 30 seconds)

var listOfStops = '&filter[stop]=' + '70069,70070,72,102,24482,24489,2448,1406,1423'
var listOfRoutes = '&filter[route]=' + 'Red,1,64,68,69,83'
        
var serviceUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api-v3.mbta.com/predictions?include=trip&sort=departure_time" + listOfStops + listOfRoutes,
            dataType : "json",
            success : function(parsed_json) {

                var allPredictions = parsed_json['data'];
                var allTrips = parsed_json['included'];
                var predictions = [];
                var infoAboutTrips = {};
                var htmlForPredictions = '';

                for (i = 0; i < allTrips.length; i++) {
                    var tripId = allTrips[i]['id'];
                    var tripHeadsign = allTrips[i]['attributes']['headsign'];
                    var tripName = allTrips[i]['attributes']['name'];
                    infoAboutTrips[tripId] = {};
                    infoAboutTrips[tripId]['headsign'] = tripHeadsign;
                    infoAboutTrips[tripId]['name'] = tripName;
                }

                for (i = 0; i < allPredictions.length; i++) {
                    if (allPredictions[i]['attributes']['departure_time'] == null) {
                        continue;
                    }
                    var routeId = allPredictions[i]['relationships']['route']['data']['id'];
                    var tripId = allPredictions[i]['relationships']['trip']['data']['id'];
                    var headsign = infoAboutTrips[tripId]['headsign'];
                    if (headsign == 'University Park') {
                        continue;
                    }
                    var departure = new Date(allPredictions[i]['attributes']['departure_time']);
                    var rawCountdown = (departure.getTime() - Date.now()) / 1000;
                    var countdown = 'Err';
                    if (rawCountdown < 0) {
                        countdown = 'BRD';
                    } else if (rawCountdown < 30) {
                        countdown = 'ARR';
                    } else {
                        countdown = Math.round(rawCountdown/60) + 'm';
                    }
                    htmlForPredictions += '<span class="prediction">'
                    htmlForPredictions += '<span class="route">' + routeId + '</span>&nbsp;';
                    htmlForPredictions += '<span class="headsign">' + headsign + '</span>&nbsp';
                    htmlForPredictions += '<span class="countdown">' + countdown + '</span>&nbsp';
                    htmlForPredictions += '</span><br/>';
                }

                document.getElementById("transit-predictions").innerHTML = htmlForPredictions;
            }
        });
    });

};

serviceUpdate();
setInterval(serviceUpdate,10000);

var beingClicked = false;
var longpress = 500;
var start;
