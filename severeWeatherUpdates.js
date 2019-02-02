// Written by Joshua Fabian, jfabi@alum.mit.edu

//  NWS alerts (updates once every 120 seconds)
var currentWeatherWarningsIds = [];
var currentSevereImmediate = false;
var footerWarningTitle = '';
var footerWarningContentScroll = '';
        
var severeWeatherUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.weather.gov/alerts?active=1&point=" + weatherPoint,
            dataType : "json",
            success : function(parsed_json) {
                console.log("just downloaded")

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
                    if (alert['urgency'] != 'Immediate' && overnightMode == true) {
                        continue;
                    }
                    daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    expires = new Date(alert['ends']);
                    expiresDay = daysOfWeek[expires.getDay()];
                    expiresHours = expires.getHours().toString().length == 1 ? '0' + expires.getHours() : expires.getHours()
                    expiresMins = expires.getMinutes().toString().length == 1 ? '0' + expires.getMinutes() : expires.getMinutes()
                    alertName = alert['event'];
                    description = alert['instruction'];
                    severeBackground = '';

                    if (alert['severity'] == 'Severe' && (alert['urgency'] == 'Expected' || alert['urgency'] == 'Immediate')) {
                        severeBackground = ' weather-alert-severe';
                    }

                    htmlForWarning = '';
                    htmlForWarning += '<div class="weather-alert-container' + severeBackground + '"><h2>'
                    htmlForWarning += '<div class="weather-alert-type ' + 'inverse-colors' + '">';
                    htmlForWarning += alertName + '</div>';
                    htmlForWarning += '<span class="weather-alert-expire">Until ' + expiresDay + ' ';
                    htmlForWarning += expiresHours + ':' + expiresMins + ''
                    htmlForWarning += '</h2>' + description + '</div>';

                    parsedWarning = {};
                    parsedWarning['alertId'] = alert['id'];
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
                        newFooterWarningContentScroll += '  ' + description;
                    }
                }

                currentSevereImmediate = currentSevereImmediateInternal;

                for (i = 0; i < parsedWarnings.length; i++) {
                    var divId = 'severe-weather-' + parsedWarnings[i]['alertId'];
                    supressDueToSevereImmediate = (parsedWarnings[i]['severity'] != 'Severe' || parsedWarnings[i]['urgency'] != 'Immediate') && currentSevereImmediate == true

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
                        }
                        currentWeatherWarningsIds.splice(i, 1);
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

severeWeatherUpdate();
setInterval(severeWeatherUpdate,120000);
