// Written by Joshua Fabian, jfabi@alum.mit.edu

//  MBTA alerts (updates once every 120 seconds)

var staleAlertThreshold = 800000000;
var currentTransitAlertsIds = [];

var stopsFilter = '';
if (transitStops != '') {
    stopsFilter = '&filter[stop]=' + transitStops;
}
var routesFilter = '';
if (transitRoutes != '') {
    routesFilter = '&filter[route]=' + transitRoutes;
}

var causeDisplayLookup = {
    UNKNOWN_CAUSE: '',
    AUTOS_IMPEDING_SERVICE: 'due to impeding auto',
    POLICE_ACTION: 'due to police action',
    POLICE_ACTIVITY: 'due to police action',
    TRAFFIC: 'due to traffic',
    CONGESTION: 'due to congestion',
    CONSTRUCTION: 'due to construction',
    MAINTENANCE: 'due to maintenance',
    SPECIAL_EVENT: 'due to special event',
    FIRE: 'due to fire',
    ACCIDENT: 'due to crash',
    DEMONSTRATION: 'due to unrest',
    DISABLED_BUS: 'due to disabled bus',
    DISABLED_TRAIN: 'due to disabled train',
    HEAVY_RIDERSHIP: 'due to heavy crowds',
    MECHANICAL_PROBLEM: 'due to mech issue',
    MEDICAL_EMERGENCY: 'due to EMS activity',
    POWER_PROBLEM: 'due to power problem',
    SEVERE_WEATHER: 'due to weather',
    SIGNAL_PROBLEM: 'due to signal issue',
    SWITCH_PROBLEM: 'due to switch issue',
    TECHNICAL_PROBLEM: 'due to mech issue',
    UNRULY_PASSENGER: 'due to unrest',
    WEATHER: 'due to weather'
};

var effectDisplayLookup = {
    SUSPENSION: 'Suspension',
    DELAY: 'Delays',
    STATION_ISSUE: 'Station issue',
    SHUTTLE: 'Bus shuttle',
    SERVICE_CHANGE: 'Service change',
    DETOUR: 'Detour',
    TRACK_CHANGE: 'Track change',
    STOP_CLOSURE: 'Stop closure'
};

var severityDisplayLookup = {
    3: 'up to 10m',
    4: 'up to 15m',
    5: 'up to 20m',
    6: 'up to 25m',
    7: 'up to 30m',
    8: 'of 30m+',
    9: 'of 60m+'
}

var severityCategoryLookup = {
    3: 'minor',
    4: 'moderate',
    5: 'moderate',
    6: 'severe',
    7: 'severe',
    8: 'severe',
    9: 'severe'
}
        
var transitAlertsUpdate = function nextServiceUpdate() {

    // Testing 19 May
    console.log("((( CHECKING TRANSIT ALERTS NOW - PREVIOUS OPEN:")
    console.log(currentTransitAlertsIds)
    console.log("((( - - - - - - - - - - -")

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api-v3.mbta.com/alerts?include=routes&" + routesFilter,
            dataType : "json",
            success : function(parsed_json) {

                // Testing 19 May
                console.log("((( GOOD RESPONSE RE ALERTS")
                console.log("((( - - - - - - - - - - -")

                var allAlerts = parsed_json['data'];
                var allIncluded = parsed_json['included'];
                var predictions = [];
                var infoAboutRoutes = {};
                var infoAboutAlerts = [];
                var parsedAlerts = [];

                for (i = 0; i < allIncluded.length; i++) {
                    if (allIncluded[i]['type'] == 'route') {
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

                for (i = 0; i < allAlerts.length; i++) {
                    var alertId = allAlerts[i]['id'];
                    var routeId = allAlerts[i]['attributes']['informed_entity'][0]['route'];
                    var cause = causeDisplayLookup[allAlerts[i]['attributes']['cause']];
                    var effect = allAlerts[i]['attributes']['effect'];
                    var effectDisplay = effectDisplayLookup[effect];
                    var header = allAlerts[i]['attributes']['header'];
                    var severity = allAlerts[i]['attributes']['severity'];
                    var severityDisplay = severityDisplayLookup[severity];
                    var severityCategory = severityCategoryLookup[severity];
                    newAlert = {};
                    newAlert['alertId'] = alertId;
                    newAlert['routeId'] = routeId;
                    newAlert['cause'] = cause;
                    newAlert['causeDisplay'] = cause;
                    newAlert['effect'] = effect;
                    newAlert['effectDisplay'] = effectDisplay;
                    newAlert['description'] = header;
                    newAlert['severity'] = severity;
                    newAlert['severityDisplay'] = severityDisplay;
                    newAlert['severityCategory'] = severityCategory;
                    if (allAlerts[i]['attributes']['lifecycle'] != 'NEW' && allAlerts[i]['attributes']['lifecycle'] != 'ONGOING') {
                        continue;
                    }
                    for (j = 0; j < allAlerts[i]['attributes']['active_period'].length; j++) {
                        // Remove stale alerts having currently-active period more than 5 days running
                        var currentPeriod = allAlerts[i]['attributes']['active_period'][j];
                        if (currentPeriod['end'] == null) {
                            var startTime = (new Date(currentPeriod['start'])).getTime();
                            if (startTime < Date.now() - staleAlertThreshold) {
                                continue;
                            } else {
                                infoAboutAlerts.push(newAlert);
                                break;
                            }
                            // IF START TIME IS MORE THAN 5 DAYS BEFORE Date.now(), CONTINUE
                        } else {
                            var startTime = (new Date(currentPeriod['start'])).getTime();
                            var endTime = (new Date(currentPeriod['end'])).getTime();
                            if (startTime > Date.now() || endTime < Date.now()) {
                                continue;
                            } else if (startTime < Date.now() - staleAlertThreshold) {
                                continue;
                            } else {
                                infoAboutAlerts.push(newAlert);
                                break;
                            }
                        }
                    }
                }

                for (i = 0; i < infoAboutAlerts.length; i++) {
                    var routeId = infoAboutAlerts[i]['routeId'];
                    if (!routeId) {
                        continue;
                    }
                    var routeDisplay = infoAboutRoutes[routeId]['shortName'];
                    if (routeDisplay == '') {
                        routeDisplay = infoAboutRoutes[routeId]['longName'];
                    }
                    var textColor = infoAboutRoutes[routeId]['textColor'];
                    var backgroundColor = infoAboutRoutes[routeId]['backgroundColor'];
                    var effectDisplay = infoAboutAlerts[i]['effectDisplay'];
                    if (!effectDisplay) {
                        effectDisplay = '';
                    }
                    var severityDisplay = infoAboutAlerts[i]['severityDisplay'];
                    var causeDisplay = infoAboutAlerts[i]['causeDisplay'];
                    if (!causeDisplay) {
                        causeDisplay = '';
                    }
                    if (!severityDisplay || effectDisplay != 'Delays') {
                        severityDisplay = '';
                    }
                    var description = infoAboutAlerts[i]['description'];
                    if (!description) {
                        description = '';
                    }
                    if (effectDisplay != 'Delays' && effectDisplay != 'Bus shuttle' && effectDisplay != 'Detour' && effectDisplay != 'Suspension') {
                        continue;
                    }
                    if (infoAboutAlerts[i]['severityCategory'] == 'severe' && displayAlertsSevere == false && displayAlertsMinor == false) {
                        console.log("Removing alert due to displayAlertsSevere == false")
                        console.log(infoAboutAlerts[i]['alertId'])
                        continue;
                    }
                    if (infoAboutAlerts[i]['severityCategory'] != 'severe' && displayAlertsMinor == false) {
                        console.log("Removing alert due to displayAlertsMinor == false")
                        console.log(infoAboutAlerts[i]['alertId'])
                        continue;
                    }
                    if (overnightMode == true) {
                        console.log("Removing alert due to overnightMode == true")
                        console.log(infoAboutAlerts[i]['alertId'])
                        continue;
                    }
                    htmlForAlert = ''; 
                    htmlForAlert += '<div class="transit-alert-container ' + 'normal-colors' + '"><h2 class="transitAlert">'
                    htmlForAlert += '<span class="transitAlertType">';
                    htmlForAlert += '<span class="transit-alert-route" style="color: #' + textColor;
                    htmlForAlert += '; background-color: #' + backgroundColor + '">&nbsp;';
                    htmlForAlert += routeDisplay + '&nbsp;</span><br>';
                    htmlForAlert += '<span class="transit-alert-title">' + effectDisplay + ' ';
                    htmlForAlert += severityDisplay + ' ' + causeDisplay + '</span>'
                    htmlForAlert += '</h2>' + description + '</div>';

                    parsedAlert = {};
                    parsedAlert['alertId'] = infoAboutAlerts[i]['alertId'];
                    parsedAlert['severityCategory'] = infoAboutAlerts[i]['severityCategory'];
                    parsedAlert['html'] = htmlForAlert;
                    parsedAlerts.push(parsedAlert);
                }

                for (i = 0; i < parsedAlerts.length; i++) {
                    var divId = 'transit-alert-' + parsedAlerts[i]['alertId'];
                    console.log('Currently working with TRANSIT div of ID:')
                    console.log(divId)

                    if (document.getElementById(divId) == null) {
                        // Testing 19 May
                        console.log("((( ABOVE ALERT NEW - CREATING NEW DIV")
                        console.log("((( - - - - - - - - - - -")
                        $('#main').append('<div id=' + divId + '></div>');
                        currentTransitAlertsIds.push(parsedAlerts[i]['alertId']);
                        document.getElementById(divId).innerHTML = parsedAlerts[i]['html'];
                        $('.rotation-group').slick('slickAdd', '#' + divId);
                    } else {
                        // Testing 19 May
                        console.log("((( ABOVE ALERT ALREADY OPEN, NO ACTION")
                        console.log("((( - - - - - - - - - - -")
                        document.getElementById(divId).innerHTML = parsedAlerts[i]['html'];
                    } 
                }

                // Check if all currentTransitAlertsDivIds are still active alerts
                console.log(currentTransitAlertsIds);
                currentTransitAlertsIdsCopy = Object.assign([], currentTransitAlertsIds);
                // Testing 19 May
                console.log("((( - - - - - - - - - - -")

                for (i = 0; i < currentTransitAlertsIdsCopy.length; i++) {
                    // Testing 19 May
                    console.log("((( BEGIN TO CHECK FOR ALERT ID...")
                    console.log(currentTransitAlertsIdsCopy[i])
                    console.log(" ")
                    var alertStillActive = false;
                    for (j = 0; j < parsedAlerts.length; j++) {
                        // Testing 19 May
                        console.log("((( CURRENTLY CHECKING AGAINST...")
                        console.log(parsedAlerts[j]['alertId'])
                        console.log(" ")
                        if (parsedAlerts[j]['alertId'] == currentTransitAlertsIdsCopy[i]) {
                            alertStillActive = true;
                            break;
                        }
                    }
                    // Testing 19 May
                    console.log(alertStillActive)
                    if (alertStillActive == false) {
                        // This means alert is not active: remove from list, rotation, html
                        console.log("")
                        console.log("  !!! REMOVING TRANSIT ALERT")
                        console.log(currentTransitAlertsIdsCopy[i])
                        console.log($('#transit-alert-' + currentTransitAlertsIdsCopy[i]).attr('data-slick-index'))
                        console.log(document.getElementById('transit-alert-' + currentTransitAlertsIdsCopy[i]))
                        console.log("")
                        if ($('#transit-alert-' + currentTransitAlertsIdsCopy[i]).attr('data-slick-index') != null) {
                            // Testing 19 May
                            console.log("((( APPARENTLY IT IS BEING REMOVED NOW.......")
                            console.log("((( REMOVING INDEX......")
                            console.log($('#transit-alert-' + currentTransitAlertsIdsCopy[i]).attr('data-slick-index'))
                            $('.rotation-group').slick('slickRemove', $('#transit-alert-' + currentTransitAlertsIdsCopy[i]).attr('data-slick-index'))
                            // Testing 19 May
                            if (document.getElementById('transit-alert-' + currentTransitAlertsIdsCopy[i]) == null) {
                                console.log("((( BEFORE SPLICE")
                                console.log(currentTransitAlertsIds)
                                indexToSplice = currentTransitAlertsIds.indexOf(currentTransitAlertsIdsCopy[i])
                                console.log("((( SPLICING AT INDEX...")
                                console.log(indexToSplice)
                                currentTransitAlertsIds.splice(indexToSplice, 1);
                                // Testing 19 May
                                console.log("((( AFTER SPLICE")
                                console.log(currentTransitAlertsIds)
                            } else {
                                console.log("((( ERROR : DID NOT ACTUALLY REMOVE SLIDE .........")
                                console.log(currentTransitAlertsIds)
                            }
                        } else {
                            // Testing 19 May
                            console.log("((( !!! NOT ACTUALLY REMOVED ALERT ALERT...PROBABLY ALREADY GONE")
                            console.log("((( BEFORE SPLICE")
                            console.log(currentTransitAlertsIds)
                            indexToSplice = currentTransitAlertsIds.indexOf(currentTransitAlertsIdsCopy[i])
                            console.log("((( SPLICING AT INDEX...")
                            console.log(indexToSplice)
                            currentTransitAlertsIds.splice(indexToSplice, 1);
                            // Testing 19 May
                            console.log("((( AFTER SPLICE")
                            console.log(currentTransitAlertsIds)
                        }
                    }
                }
            }
        });
    });

};

transitAlertsUpdate();
setInterval(transitAlertsUpdate,120000);
