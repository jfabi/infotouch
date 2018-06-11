// Written by Joshua Fabian, jfabi@alum.mit.edu

//  MBTA alerts (updates once every 120 seconds)

var staleAlertThreshold = 432000000;

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
                var htmlForAlerts = '';

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
                    newAlert = {};
                    newAlert['routeId'] = routeId;
                    newAlert['cause'] = cause;
                    newAlert['causeDisplay'] = cause;
                    newAlert['effect'] = effect;
                    newAlert['effectDisplay'] = effectDisplay;
                    newAlert['description'] = header;
                    newAlert['severity'] = severity;
                    newAlert['severityDisplay'] = severityDisplay;
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
                    htmlForAlerts += '<h2 class="transitAlert" style="color: white; background-color: red">'
                    htmlForAlerts += '<span class="transitAlertType">';
                    htmlForAlerts += '<span class="route" style="color: #' + textColor;
                    htmlForAlerts += '; background-color: #' + backgroundColor + '">&nbsp;';
                    htmlForAlerts += routeDisplay + '&nbsp;</span>&nbsp;';
                    htmlForAlerts += '<span class="transitAlertTitle">' + effectDisplay + ' ';
                    htmlForAlerts += severityDisplay + ' ' + causeDisplay + '</span>'
                    htmlForAlerts += '</h2>' + description + '<br/><br/>';
                }

                document.getElementById('transit-alerts').innerHTML = htmlForAlerts;
            }
        });
    });

};

transitAlertsUpdate();
setInterval(transitAlertsUpdate,120000);

var beingClicked = false;
var longpress = 500;
var start;
