// Written by Joshua Fabian, jfabi@alum.mit.edu

// BlueBikes service updates (updates once every 90 seconds)

var bluebikesStations = {};
        
var sharedMobilityStatusUpdate = function nextServiceUpdate() {
    // Save names of Bluebikes stations
    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://gbfs.bluebikes.com/gbfs/en/station_information.json",
            dataType : "json",
            success : function(parsed_json) {
                bluebikesStations = {}
                var localBluebikesStationOverrides = {}
                if (typeof sharedMobilityStationOverrides !== 'undefined') {
                    if (sharedMobilityStationOverrides['Bluebikes']) {
                        localBluebikesStationOverrides = sharedMobilityStationOverrides['Bluebikes']
                    }                    
                }
                var allPredictions = parsed_json['data']['stations'];

                for (i = 0; i < allPredictions.length; i++) {
                    stationId = allPredictions[i]['station_id'];
                    bluebikesStations[stationId] = {};
                    bluebikesStations[stationId]['stationId'] = stationId;
                    if (localBluebikesStationOverrides[stationId]) {
                        bluebikesStations[stationId]['name'] = localBluebikesStationOverrides[stationId];
                    } else {
                        bluebikesStations[stationId]['name'] = allPredictions[i]['name'];
                    }
                }
            }
        });
    });


    // Check for bicycle status at Bluebikes stations
    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://gbfs.bluebikes.com/gbfs/en/station_status.json",
            dataType : "json",
            success : function(parsed_json) {
                var localBluebikesStations = sharedMobilityStations['Bluebikes']
                var allPredictions = parsed_json['data']['stations'];
                var allIncluded = parsed_json['included'];
                var predictions = [];
                var infoAboutTrips = {};
                var infoAboutRoutes = {};
                var htmlForPredictions = '';
                var htmlForAlerts = '';
                var displayablePredictions = {};

                for (i = 0; i < allPredictions.length; i++) {
                    if (!localBluebikesStations.includes(allPredictions[i]['station_id'])) {
                        continue;
                    }

                    var stationKey = allPredictions[i]['station_id']

                    var bikeFileName = 'bike-black.png';
                    if (overnightMode == true) {
                        bikeFileName = 'bike-white.png';
                    }
                    var ebikeFileName = 'ebike-black.png';
                    if (overnightMode == true) {
                        ebikeFileName = 'ebike-white.png';
                    }

                    var countBikes = Math.round(allPredictions[i]['num_bikes_available']) + ' <img src="icons/' + bikeFileName + '" width="36px" style="display:inline">';
                    var countElectricBikes = Math.round(allPredictions[i]['num_ebikes_available']) + '<span class="transit-min"> <img src="icons/' + ebikeFileName + '" width="36px" style="display:inline"></span>';
                    var currentStatus = allPredictions[i]['is_renting'];

                    // Show at most 2 upcoming predictions per route-headsign combination
                    if (!displayablePredictions[stationKey]) {
                        displayablePredictions[stationKey] = {};
                        displayablePredictions[stationKey]['stationId'] = stationKey;
                        var stationName = bluebikesStations[stationKey]['name'];
                        if (stationName.length > 23) {
                            stationName = stationName.substring(0, 23);
                        }
                        // if ()
                        displayablePredictions[stationKey]['headsign'] = stationName;
                        displayablePredictions[stationKey]['status'] = currentStatus;
                        displayablePredictions[stationKey]['predictions'] = []
                        if (currentStatus > 0) {
                            displayablePredictions[stationKey]['predictions'].push(countBikes);
                            if (allPredictions[i]['num_ebikes_available'] > 0) {
                                displayablePredictions[stationKey]['predictions'].push(countElectricBikes);
                            }
                        } else {
                            statusDisplay = "No svc";
                            displayablePredictions[stationKey]['predictions'].push(statusDisplay);
                        }
                    }
                }

                if (allPredictions != null) {

                    for (var key in displayablePredictions) {
                        if (!displayablePredictions.hasOwnProperty(key)) {
                            //The current property is not a direct property of p
                            continue;
                        }
                        var routeDisplay = 'BB';
                        var textColor = 'ffffff';
                        var backgroundColor = '0641a0';

                        htmlForPredictions += '<span class="transit-prediction">'
                        htmlForPredictions += '<span class="transit-route"><span class="transit-route-label" style="color: #' + textColor;
                        htmlForPredictions += '; background-color: #' + backgroundColor + '">&nbsp;';
                        htmlForPredictions += routeDisplay + '&nbsp;</span></span>&nbsp;&nbsp;';
                        htmlForPredictions += '<span class="shared-mobility-station">' + displayablePredictions[key]['headsign'] + '</span>';
                        htmlForPredictions += '<span class="shared-mobility-count">';
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

                if (document.getElementById('shared-mobility-status') == null && htmlForPredictions != '') {
                    $('#main').append('<div id="shared-mobility-status" class="normal-colors"></div>');
                    document.getElementById('shared-mobility-status').innerHTML = '<div style="padding: 10px" class="normal-colors">' + htmlForPredictions + '</div>';
                } else if (htmlForPredictions != '') {
                    document.getElementById('shared-mobility-status').innerHTML = '<div style="padding: 10px" class="normal-colors">' + htmlForPredictions + '</div>';
                }
            }
        });
    });

};

sharedMobilityStatusUpdate();
setInterval(sharedMobilityStatusUpdate,90000);
