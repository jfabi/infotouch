// Written by Joshua Fabian, jfabi@alum.mit.edu

//  NWS alerts (updates once every 120 seconds)
var currentWeatherWarningsIds = [];
var currentSevereImmediate = false;
var footerWarningTitle = '';
var footerWarningContentScroll = '';
        
var severeWeatherUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.weather.gov/alerts?active=1&point=" + weatherPoint['latitude'] + "," + weatherPoint['longitude'],
            dataType : "json",
            success : function(parsed_json) {
                var allAlerts = parsed_json['features'];
                var parsedWarnings = [];
                var currentSevereImmediateInternal = false;
                var newFooterWarningTitle = '';
                var newFooterWarningContentScroll = '';

                for (i = 0; i < allAlerts.length; i++) {
                    alert = allAlerts[i]['properties'];
                    if (alert['severity'] == 'Minor') {
                        continue;
                    }
                    if ((alert['urgency'] != 'Immediate' && alert['urgency'] != 'Expected') && overnightMode == true) {
                        continue;
                    }
                    daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    var expires = null;
                    if (alert['ends'] != null) {
                        expires = new Date(alert['ends']);
                    } else {
                        expires = new Date(alert['expires']);
                    }
                    expiresDay = daysOfWeek[expires.getDay()];
                    expiresHours = expires.getHours().toString().length == 1 ? '0' + expires.getHours() : expires.getHours()
                    expiresMins = expires.getMinutes().toString().length == 1 ? '0' + expires.getMinutes() : expires.getMinutes()
                    alertName = alert['event'];
                    description = alert['instruction'];
                    if (description == null) {
                        description = alert['description'];
                    }
                    alertBackground = '';
                    alertTypeColors = '';

                    if (alert['severity'] == 'Severe' && (alert['urgency'] == 'Expected' || alert['urgency'] == 'Immediate')) {
                        alertBackground = 'weather-alert-severe';
                        alertTypeColors = 'weather-alert-severe-type';
                    } else {
                        alertBackground = 'normal-colors';
                        alertTypeColors = 'inverse-colors';
                    }

                    htmlForWarning = '';
                    htmlForWarning += '<div class="weather-alert-container ' + alertBackground + '"><h2>'
                    htmlForWarning += '<div class="weather-alert-type ' + alertTypeColors + '">';
                    htmlForWarning += alertName + '</div>';
                    htmlForWarning += '<span class="weather-alert-expire ' + alertBackground + '">Until ' + expiresDay + ' ';
                    htmlForWarning += expiresHours + ':' + expiresMins + ''
                    htmlForWarning += '</h2><span class="' + alertBackground + '">' + description + '</span></div>';

                    parsedWarning = {};
                    parsedWarning['alertId'] = hashId(alert['id']);
                    parsedWarning['severity'] = alert['severity'];
                    parsedWarning['urgency'] = alert['urgency'];
                    parsedWarning['html'] = htmlForWarning;
                    parsedWarnings.push(parsedWarning);

                    if (parsedWarning['severity'] == 'Severe' && parsedWarning['urgency'] == 'Immediate') {
                        currentSevereImmediateInternal = true;

                        if (newFooterWarningTitle == '') {
                            newFooterWarningTitle = alertName;
                        } else {
                            newFooterWarningTitle += ', ' + alertName
                        }
                        newFooterWarningContentScroll += '  ' + alert['headline'] + ' ' + alert['description'] + ' ' + alert['instruction'];
                        console.log('^^^^^ TRUE SHOULD BE STARTING SCROLLER')
                    } else {
                        console.log('~~~~~ false should not be starting scroller ?!')
                        console.log('severity and urgency appear next two lines:')
                        console.log(parsedWarning['severity'])
                        console.log(parsedWarning['urgency'])
                    }
                }

                currentSevereImmediate = currentSevereImmediateInternal;

                for (i = 0; i < parsedWarnings.length; i++) {
                    var divId = 'severe-weather-' + parsedWarnings[i]['alertId'];
                    supressDueToSevereImmediate = (parsedWarnings[i]['severity'] != 'Severe' || parsedWarnings[i]['urgency'] == 'Immediate') && currentSevereImmediate == true

                    if (document.getElementById(divId) == null && !supressDueToSevereImmediate) {
                        $('#main').append('<div id=' + divId + '></div>');
                        currentWeatherWarningsIds.push(parsedWarnings[i]['alertId']);
                        document.getElementById(divId).innerHTML = parsedWarnings[i]['html'];
                        $('.rotation-group').slick('slickAdd', '#' + divId);

                        // HELLO
                    } else if (!supressDueToSevereImmediate) {
                        document.getElementById(divId).innerHTML = parsedWarnings[i]['html'];

                        // HELLO
                    } else if (document.getElementById(divId) != null && $('#' + divId).attr('data-slick-index') != null) {
                        // Remove object from current rotation
                        $('.rotation-group').slick('slickRemove', $('#' + divId).attr('data-slick-index'));
                        document.getElementById('severe-weather-' + parsedWarnings[j]['alertId']).remove();
                        currentWeatherWarningsIdsCopy = Object.assign([], currentWeatherWarningsIds);
                        for (j = 0; j < currentWeatherWarningsIdsCopy.length; j++) {
                            if (currentWeatherWarningsIdsCopy[j] == parsedWarnings[i]['alertId']) {
                                currentWeatherWarningsIds.splice(j, 1);
                                break;
                            }
                        }

                        // HELLO
                    }
                }

                // Check if all currentWeatherWarningsIds are still active warnings
                console.log(currentWeatherWarningsIds);
                currentWeatherWarningsIdsCopy = Object.assign([], currentWeatherWarningsIds);

                for (i = 0; i < currentWeatherWarningsIdsCopy.length; i++) {
                    var warningStillActive = false;
                    for (j = 0; j < parsedWarnings.length; j++) {
                        if (parsedWarnings[j]['alertId'] == currentWeatherWarningsIdsCopy[i]) {
                            warningStillActive = true;
                            break;
                        }
                    }
                    if (warningStillActive == false) {
                        // This means warning is not active: remove from list, rotation, html
                        console.log("")
                        console.log("  !!! REMOVING WEATHER ALERT")
                        console.log(currentWeatherWarningsIdsCopy[i])
                        console.log($('#severe-weather-' + currentWeatherWarningsIdsCopy[i]).attr('data-slick-index'))
                        console.log(document.getElementById('severe-weather-' + currentWeatherWarningsIdsCopy[i]))
                        console.log("")
                        if ($('#severe-weather-' + currentWeatherWarningsIdsCopy[i]).attr('data-slick-index') != null) {
                            $('.rotation-group').slick('slickRemove', $('#severe-weather-' + currentWeatherWarningsIdsCopy[i]).attr('data-slick-index'));
                            if (document.getElementById('severe-weather-' + currentWeatherWarningsIdsCopy[i]) == null) {
                                console.log("*** BEFORE SPLICE")
                                console.log(currentWeatherWarningsIds)
                                indexToSplice = currentWeatherWarningsIds.indexOf(currentWeatherWarningsIdsCopy[i])
                                console.log("*** SPLICING AT INDEX...")
                                console.log(indexToSplice)
                                currentWeatherWarningsIds.splice(indexToSplice, 1);
                                // Testing 19 May
                                console.log("*** AFTER SPLICE")
                                console.log(currentWeatherWarningsIds)
                            } else {
                                console.log("*** ERROR : DID NOT ACTUALLY REMOVE SLIDE .........")
                                console.log(currentWeatherWarningsIds)
                            }
                        } else {
                            // Testing 19 May
                            console.log("*** !!! NOT ACTUALLY REMOVED ALERT ALERT...PROBABLY ALREADY GONE")
                            console.log("*** BEFORE SPLICE")
                            console.log(currentWeatherWarningsIds)
                            indexToSplice = currentWeatherWarningsIds.indexOf(currentWeatherWarningsIdsCopy[i])
                            console.log("*** SPLICING AT INDEX...")
                            console.log(indexToSplice)
                            currentWeatherWarningsIds.splice(indexToSplice, 1);
                            // Testing 19 May
                            console.log("*** AFTER SPLICE")
                            console.log(currentWeatherWarningsIds)
                        }
                    }
                }

                footerWarningTitle = newFooterWarningTitle;
                footerWarningContentScroll = newFooterWarningContentScroll;
                if (footerWarningTitle != '' && footerWarningContentScroll != '') {
                    document.getElementById('footer-title').innerHTML = footerWarningTitle;
                    document.getElementById('footer-content-scroll').innerHTML = footerWarningContentScroll;
                    document.getElementById('footer').style.display = 'inline';
                } else {
                    document.getElementById('footer-title').innerHTML = '';
                    document.getElementById('footer-content-scroll').innerHTML = '';
                    document.getElementById('footer').style.display = 'none';
                }
            }
        });
    });

};

function hashId(unhashed) {
    let hash = 0;
    for (i = 0; i < unhashed.length; i++) {
        let chr = unhashed.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

severeWeatherUpdate();
setInterval(severeWeatherUpdate,120000);
