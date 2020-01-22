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
                    var informedEntity = allAlerts[i]['attributes']['informed_entity'];
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
                    newAlert['informedEntity'] = informedEntity;
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
                    infoAboutAlerts[i]['textColor'] = textColor;
                    var backgroundColor = infoAboutRoutes[routeId]['backgroundColor'];
                    infoAboutAlerts[i]['backgroundColor'] = backgroundColor;
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
                    htmlForAlert += '</h2>' + description;

                    parsedAlert = {};
                    parsedAlert['alertId'] = infoAboutAlerts[i]['alertId'];
                    parsedAlert['severityCategory'] = infoAboutAlerts[i]['severityCategory'];
                    parsedAlert['effect'] = infoAboutAlerts[i]['effect'];
                    parsedAlert['informedEntity'] = infoAboutAlerts[i]['informedEntity'];
                    parsedAlert['textColor'] = infoAboutAlerts[i]['textColor'];
                    parsedAlert['backgroundColor'] = infoAboutAlerts[i]['backgroundColor'];
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

                        // Create alert diagram if applicable
                        console.log(parsedAlerts[i])
                        console.log(parsedAlerts[i]['effect'])
                        generateAlertDiagram(parsedAlerts[i])

                        parsedAlerts[i]['html'] =  parsedAlerts[i]['html'] + '</div>';

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

var generateAlertDiagram = function generateAlertDiagram(alert) {
    if (alert['effect'] == 'SHUTTLE') {

        var routeId = alert['informedEntity'][0]['route'];
        console.log(routeId)
        var apiUrl = 'https://api-v3.mbta.com/stops?filter[route]=' + routeId + '&filter[direction_id]=0';
        
        jQuery(document).ready(function($) {
            $.ajax({
                url : apiUrl,
                dataType : "json",
                success : function(parsed_json) {
                    var stationsOnRoute = parsed_json['data'];
                    console.log(stationsOnRoute)
                    var stationsOnRouteAlert = [];
                    var haveStartedShuttle = false;

                    for (i = 0; i < stationsOnRoute.length; i++) {
                        var stationStatus = 'normal';
                        for (j = 0; j < alert['informedEntity'].length; j++) {
                            if (alert['informedEntity'][j]['stop'] == stationsOnRoute[i]['id']) {
                                // We found a station impacted by the alert
                                if (i == 0) {
                                    stationStatus = 'shuttle start + route edge';
                                    haveStartedShuttle = true;
                                } else if (i == stationsOnRoute.length - 1) {
                                    stationStatus = 'shuttle end + route edge';
                                } else if (alert['informedEntity'][j]['activities'].length == 2 && haveStartedShuttle == false) {
                                    stationStatus = 'shuttle start';
                                    haveStartedShuttle = true;
                                } else if (alert['informedEntity'][j]['activities'].length == 2) {
                                    stationStatus = 'shuttle end';
                                } else {
                                    stationStatus = 'shuttle';
                                }
                                break;
                            } else if (i == 0 || i == stationsOnRoute.length - 1) {
                                stationStatus = 'route edge';
                            }
                        }
                        stationsOnRouteAlert.push({
                            stopId: stationsOnRoute[i]['id'],
                            stationName: stationsOnRoute[i]['attributes']['name'],
                            stationStatus: stationStatus
                        })
                    }

                    // Remove stations which have normal service and aren't on edge of route
                    var filteredStationsOnRouteAlert = stationsOnRouteAlert.filter(function(e) {
                        return e['stationStatus'] !== 'normal'
                    })
                    console.log('TAKE 1 !!!')
                    console.log(filteredStationsOnRouteAlert)
                    var onlyShuttle = filteredStationsOnRouteAlert.filter(function(e) {
                        return e['stationStatus'] == 'shuttle'
                    })
                    console.log('TAKE 2 !!!')
                    console.log(onlyShuttle)
                    var finalAlertStations = [];
                    if (onlyShuttle.length > 3) {
                        var alertStationFinal = onlyShuttle[onlyShuttle.length - 1]['stopId'];
                        var shuttleCounter = 0;
                        for (i = 0; i < filteredStationsOnRouteAlert.length; i++) {
                            if (filteredStationsOnRouteAlert[i]['stationStatus'] == 'shuttle') {
                                if (shuttleCounter < 1) {
                                    finalAlertStations.push(filteredStationsOnRouteAlert[i]);
                                    shuttleCounter = shuttleCounter + 1;
                                } else if (filteredStationsOnRouteAlert[i]['stopId'] == alertStationFinal) {
                                    finalAlertStations.push(filteredStationsOnRouteAlert[i]);
                                } else if (shuttleCounter == 1) {
                                    finalAlertStations.push({
                                        stopId: null,
                                        stationName: null,
                                        stationStatus: '...'
                                    })
                                    shuttleCounter = shuttleCounter + 1;
                                }
                            } else {
                                finalAlertStations.push(filteredStationsOnRouteAlert[i]);
                            }
                        }
                    } else {
                        finalAlertStations = filteredStationsOnRouteAlert;
                    }

                    console.log('@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(')
                    for (i = 0; i < filteredStationsOnRouteAlert.length; i++) {
                        console.log(filteredStationsOnRouteAlert[i]['stationName'] + ' -- ' + filteredStationsOnRouteAlert[i]['stationStatus'])
                    }
                    console.log('@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(')
                    console.log('')
                    console.log('')
                    
                    console.log('@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(')
                    for (i = 0; i < finalAlertStations.length; i++) {
                        console.log(finalAlertStations[i]['stationName'] + ' -- ' + finalAlertStations[i]['stationStatus'])
                    }
                    console.log('@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(@(')
                    console.log('')
                    console.log('')

                    // DRAW OUR FINAL SVG DIAGRAM AND STUFF HERE USING finalAlertStations
                    var svgNS = 'http://www.w3.org/2000/svg';

                    var currentX = 25;
                    for (i = 0; i < finalAlertStations.length; i++) {
                        if (i == 0 && finalAlertStations[i]['stationStatus'] == 'route edge') {
                            var shape2 = document.createElementNS(svgNS, 'polygon');
                            shape2.setAttributeNS(null, 'points', (currentX + 22) + ' 204, ' + (currentX + 22) + ' 246, '+ currentX +' 225');
                            shape2.setAttributeNS(null, 'fill', '#' + alert['backgroundColor']);

                            currentX = currentX + 22;

                            var shape0 = document.createElementNS(svgNS, 'rect');
                            shape0.setAttributeNS(null, 'x', currentX);
                            shape0.setAttributeNS(null, 'y', 204);
                            shape0.setAttributeNS(null, 'width', 300);
                            shape0.setAttributeNS(null, 'height', 42);
                            shape0.setAttributeNS(null, 'fill', '#' + alert['backgroundColor']);

                            var shape = document.createElementNS(svgNS, 'text');
                            shape.setAttributeNS(null, 'x', currentX + 10);
                            shape.setAttributeNS(null, 'y', 233);
                            shape.setAttributeNS(null, 'fill', '#' + alert['textColor']);
                            shape.setAttributeNS(null, 'font-weight', 'bold');
                            var textNode = document.createTextNode(finalAlertStations[i]['stationName']);
                            shape.appendChild(textNode);
                            console.log('########## MAKING TEXT NODE')

                            console.log('########## s width = ' + shape.getComputedTextLength())
                            // console.log('########## tN width = ' + textNode.getComputedTextLength())

                            currentX = currentX + 300;

                            var shape3 = document.createElementNS(svgNS, 'rect');
                            shape3.setAttributeNS(null, 'x', currentX + 28);
                            shape3.setAttributeNS(null, 'y', 215);
                            shape3.setAttributeNS(null, 'width', 18);
                            shape3.setAttributeNS(null, 'height', 20);
                            shape3.setAttributeNS(null, 'fill', 'black');

                            document.getElementById('mySVG').appendChild(shape3);
                            document.getElementById('mySVG').appendChild(shape0);
                            document.getElementById('mySVG').appendChild(shape);
                            document.getElementById('mySVG').appendChild(shape2);
                        } else if (finalAlertStations[i]['stationStatus'] == 'route edge') {
                            currentX = currentX - 70;

                            var shape0 = document.createElementNS(svgNS, 'rect');
                            shape0.setAttributeNS(null, 'x', currentX);
                            shape0.setAttributeNS(null, 'y', 204);
                            shape0.setAttributeNS(null, 'width', 300);
                            shape0.setAttributeNS(null, 'height', 42);
                            shape0.setAttributeNS(null, 'fill', '#' + alert['backgroundColor']);

                            var shape = document.createElementNS(svgNS, 'text');
                            shape.setAttributeNS(null, 'x', currentX + 20);
                            shape.setAttributeNS(null, 'y', 233);
                            shape.setAttributeNS(null, 'fill', '#' + alert['textColor']);
                            shape.setAttributeNS(null, 'font-weight', 'bold');
                            var textNode = document.createTextNode(finalAlertStations[i]['stationName']);
                            shape.appendChild(textNode);
                            console.log('########## MAKING TEXT NODE')

                            console.log('########## s width = ' + shape.getComputedTextLength())
                            // console.log('########## tN width = ' + textNode.getComputedTextLength())

                            currentX = currentX + 300;

                            var shape2 = document.createElementNS(svgNS, 'polygon');
                            shape2.setAttributeNS(null, 'points', currentX + ' 207, ' + currentX + ' 242, '+ (currentX + 22) +' 225');
                            shape2.setAttributeNS(null, 'fill', '#' + alert['backgroundColor']);

                            document.getElementById('mySVG').appendChild(shape0);
                            document.getElementById('mySVG').appendChild(shape);
                            document.getElementById('mySVG').appendChild(shape2);

                            currentX = currentX + 25;
                        } else if (finalAlertStations[i]['stationStatus'].includes('shuttle')) {
                            var shape = document.createElementNS(svgNS, 'text');
                            shape.setAttributeNS(null, 'x', currentX + 25);
                            shape.setAttributeNS(null, 'y', 200);
                            shape.setAttributeNS(null, 'fill', 'black');
                            shape.setAttributeNS(null, 'transform', 'rotate(-45,' + currentX + ',200)');
                            shape.setAttributeNS(null, 'font-weight', 'bold');
                            var textNode = document.createTextNode(finalAlertStations[i]['stationName']);
                            shape.appendChild(textNode);

                            var shape1 = document.createElementNS(svgNS, 'circle');
                            shape1.setAttributeNS(null, 'cx', currentX);
                            shape1.setAttributeNS(null, 'cy', 225);
                            shape1.setAttributeNS(null, 'r', 18);
                            if (finalAlertStations[i]['stationStatus'] == 'shuttle start' || finalAlertStations[i]['stationStatus'] == 'shuttle end') {
                                shape1.setAttributeNS(null, 'stroke', '#' + alert['backgroundColor']);
                            } else {
                                shape1.setAttributeNS(null, 'stroke', 'black');
                            }
                            shape1.setAttributeNS(null, 'stroke-width', 6);
                            shape1.setAttributeNS(null, 'fill', 'white');

                            if (!finalAlertStations[i]['stationStatus'].includes('shuttle end')) {
                                var shape0 = document.createElementNS(svgNS, 'rect');
                                shape0.setAttributeNS(null, 'x', currentX + 28);
                                shape0.setAttributeNS(null, 'y', 215);
                                shape0.setAttributeNS(null, 'width', 18);
                                shape0.setAttributeNS(null, 'height', 20);
                                shape0.setAttributeNS(null, 'fill', 'black');

                                document.getElementById('mySVG').appendChild(shape0);
                            }

                            document.getElementById('mySVG').appendChild(shape);
                            document.getElementById('mySVG').appendChild(shape1);

                            currentX = currentX + 75;
                        } else if (finalAlertStations[i]['stationStatus'] == '...') {

                            var shape1 = document.createElementNS(svgNS, 'circle');
                            shape1.setAttributeNS(null, 'cx', currentX + 10);
                            shape1.setAttributeNS(null, 'cy', 225);
                            shape1.setAttributeNS(null, 'r', 3);
                            shape1.setAttributeNS(null, 'fill', 'black');

                            var shape2 = document.createElementNS(svgNS, 'circle');
                            shape2.setAttributeNS(null, 'cx', currentX);
                            shape2.setAttributeNS(null, 'cy', 225);
                            shape2.setAttributeNS(null, 'r', 3);
                            shape2.setAttributeNS(null, 'fill', 'black');

                            var shape3 = document.createElementNS(svgNS, 'circle');
                            shape3.setAttributeNS(null, 'cx', currentX - 10);
                            shape3.setAttributeNS(null, 'cy', 225);
                            shape3.setAttributeNS(null, 'r', 3);
                            shape3.setAttributeNS(null, 'fill', 'black');

                            var shape0 = document.createElementNS(svgNS, 'rect');
                            shape0.setAttributeNS(null, 'x', currentX + 28);
                            shape0.setAttributeNS(null, 'y', 215);
                            shape0.setAttributeNS(null, 'width', 18);
                            shape0.setAttributeNS(null, 'height', 20);
                            shape0.setAttributeNS(null, 'fill', 'black');

                            document.getElementById('mySVG').appendChild(shape1);
                            document.getElementById('mySVG').appendChild(shape2);
                            document.getElementById('mySVG').appendChild(shape3);
                            document.getElementById('mySVG').appendChild(shape0);

                            currentX = currentX + 75;
                        }
                    }

                }
            });
        });
        

    }
};

var mbtaApiCall = function mbtaApiCall(apiUrl) {
    var parsed_json = '';
    
};
