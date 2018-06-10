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

var causeDisplayLookup = {
    UNKNOWN_CAUSE: '',
    POLICE_ACTION: 'due to police action',
    TRAFFIC: 'due to traffic',
    CONSTRUCTION: 'due to construction',
    MAINTENANCE: 'due to maintenance',
    SPECIAL_EVENT: 'due to special event',
    FIRE: 'due to fire'
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
                    console.log(allAlerts[i]['attributes']['informed_entity']);
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
                    newAlert['effect'] = effect;
                    newAlert['effectDisplay'] = effectDisplay;
                    newAlert['description'] = header;
                    newAlert['severity'] = severity;
                    newAlert['severityDisplay'] = severityDisplay;
                    infoAboutAlerts.push(newAlert);
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
                    if (!severityDisplay || causeDisplay != 'Delays') {
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
