// Written by Joshua Fabian, jfabi@alum.mit.edu

//  MBTA alerts (updates once every 120 seconds)

var staleAlertThreshold = 800000000;
var currentTransitAlertsIds = [];

var stopsFilter = '';
if (listOfStops != '') {
    stopsFilter = '&filter[stop]=' + listOfStops;
}
var routesFilter = '';
if (listOfRoutes != '') {
    routesFilter = '&filter[route]=' + listOfRoutes;
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
    DELAY: 'Delays',
    STATION_ISSUE: 'Station issue',
    SHUTTLE: 'Bus shuttle',
    SERVICE_CHANGE: 'Service change',
    DETOUR: 'Diversion',
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
    6: 'moderate',
    7: 'severe',
    8: 'severe',
    9: 'severe'
}
        
var transitAlertsUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api-v3.mbta.com/alerts?include=routes&" + routesFilter,
            dataType : "json",
            success : function(parsed_json) {

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
                    if (effectDisplay != 'Delays' && effectDisplay != 'Bus shuttle' && effectDisplay != 'Diversion') {
                        continue;
                    }
                    if (infoAboutAlerts[i]['severityCategory'] == 'severe' && displayAlertsSevere == false && displayAlertsMinor == false) {
                        continue;
                    }
                    if (infoAboutAlerts[i]['severityCategory'] != 'severe' && displayAlertsMinor == false) {
                        continue;
                    }
                    if (overnightMode == true) {
                        continue;
                    }
                    htmlForAlert = ''; 
                    htmlForAlert += '<h2 class="transitAlert" style="color: white; background-color: red">'
                    htmlForAlert += '<span class="transitAlertType">';
                    htmlForAlert += '<span class="transit-route-label" style="color: #' + textColor;
                    htmlForAlert += '; background-color: #' + backgroundColor + '">&nbsp;';
                    htmlForAlert += routeDisplay + '&nbsp;</span>&nbsp;';
                    htmlForAlert += '<span class="transitAlertTitle">' + effectDisplay + ' ';
                    htmlForAlert += severityDisplay + ' ' + causeDisplay + '</span>'
                    htmlForAlert += '</h2>' + description + '<br/><br/>';

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
                        $('#main').append('<div id=' + divId + '></div>');
                        currentTransitAlertsIds.push(parsedAlerts[i]['alertId']);
                        document.getElementById(divId).innerHTML = parsedAlerts[i]['html'];
                        $('.rotation-group').slick('slickAdd', '#' + divId);
                    } else {
                        document.getElementById(divId).innerHTML = parsedAlerts[i]['html'];
                    } 
                }

                // Check if all currentTransitAlertsDivIds are still active alerts
                console.log(currentTransitAlertsIds);
                currentTransitAlertsIdsCopy = Object.assign([], currentTransitAlertsIds);

                for (i = 0; i < currentTransitAlertsIdsCopy.length; i++) {
                    var alertStillActive = false;
                    for (j = 0; j < parsedAlerts.length; j++) {
                        if (parsedAlerts[j]['alertId'] == currentTransitAlertsIdsCopy[i]) {
                            alertStillActive = true;
                            break;
                        }
                    }
                    if (alertStillActive == false) {
                        // This means alert is not active: remove from list, rotation, html
                        console.log("")
                        console.log("  !!! REMOVING TRANSIT ALERT")
                        console.log(currentTransitAlertsIdsCopy[i])
                        console.log($('#transit-alert-' + currentTransitAlertsIdsCopy[i]).attr('data-slick-index'))
                        console.log(document.getElementById('transit-alert-' + currentTransitAlertsIdsCopy[i]))
                        console.log("")
                        if ($('#transit-alert-' + currentTransitAlertsIdsCopy[i]).attr('data-slick-index') != null) {
                            $('.rotation-group').slick('slickRemove', $('#transit-alert-' + currentTransitAlertsIdsCopy[i]).attr('data-slick-index'));
                        }
                        currentTransitAlertsIds.splice(i, 1);
                    }
                }
            }
        });
    });

};

transitAlertsUpdate();
setInterval(transitAlertsUpdate,120000);
