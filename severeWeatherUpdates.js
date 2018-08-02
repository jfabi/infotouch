// Written by Joshua Fabian, jfabi@alum.mit.edu

//  NWS alerts (updates once every 120 seconds)
var currentWeatherWarningsIds = [];
        
var severeWeatherUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.weather.gov/alerts?active=1&point=" + weatherPoint,
            dataType : "json",
            success : function(parsed_json) {

                var allAlerts = parsed_json['features'];
                var parsedWarnings = [];
                var currentSevereImmediate = false;

                for (i = 0; i < allAlerts.length; i++) {
                    alert = allAlerts[i]['properties'];
                    if (alert['severity'] == 'minor') {
                        continue;
                    }
                    daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    expires = new Date(alert['ends']);
                    expiresDay = daysOfWeek[expires.getDay()];
                    expiresHours = expires.getHours().toString().length == 1 ? '0' + expires.getHours() : expires.getHours()
                    expiresMins = expires.getMinutes().toString().length == 1 ? '0' + expires.getMinutes() : expires.getMinutes()
                    alertName = alert['event'];
                    description = alert['description'] + ' ' + alert['instruction'];

                    htmlForWarning = '';
                    htmlForWarning += '<h2 class="weatherAlert" style="color: white; background-color: red">'
                    htmlForWarning += '<span class="weatherAlertType">';
                    htmlForWarning += alertName + '</span>';
                    htmlForWarning += '<span class="alertExpire"> until ' + expiresDay + ' ';
                    htmlForWarning += expiresHours + ':' + expiresMins + '</span>'
                    htmlForWarning += '</h2>' + description + '<br/><br/>';

                    parsedWarning = {};
                    parsedWarning['alertId'] = alert['id'];
                    parsedWarning['severity'] = alert['severity'];
                    parsedWarning['urgency'] = alert['urgency'];
                    parsedWarning['html'] = htmlForWarning;
                    parsedWarnings.push(parsedWarning);

                    if (parsedWarning['severity'] == 'Severe' && parsedWarning['urgency'] == 'Immediate') {
                        currentSevereImmediate = true;
                    }
                }

                for (i = 0; i < parsedWarnings.length; i++) {
                    var divId = 'severe-weather-' + parsedWarnings[i]['alertId'];
                    supressDueToSevereImmediate = (parsedWarnings[i]['severity'] != 'Severe' || parsedWarnings[i]['urgency'] != 'Immediate') && currentSevereImmediate == true

                    if (document.getElementById(divId) == null && !supressDueToSevereImmediate) {
                        $('#main').append('<div id=' + divId + '></div>');
                        currentWeatherWarningsIds.push(parsedWarnings[i]['alertId']);
                        document.getElementById(divId).innerHTML = parsedWarnings[i]['html'];
                        $('.rotation-group').slick('slickAdd', '#' + divId);
                    } else if (!supressDueToSevereImmediate) {
                        document.getElementById(divId).innerHTML = parsedWarnings[i]['html'];
                    } else if (document.getElementById(divId) != null && $('#' + divId).attr('data-slick-index') != null) {
                        // Remove object from current rotation
                        $('.rotation-group').slick('slickRemove', $('#' + divId).attr('data-slick-index'));
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
                        if ($('#severe-weather-' + parsedWarnings[j]['alertId']).attr('data-slick-index') != null) {
                            $('.rotation-group').slick('slickRemove', $('#severe-weather-' + parsedWarnings[j]['alertId']).attr('data-slick-index'));
                        }
                        document.getElementById('severe-weather-' + parsedWarnings[j]['alertId']).remove();
                        currentWeatherWarningsIds.splice(i, 1);
                    }
                }
            }
        });
    });

};

severeWeatherUpdate();
setInterval(severeWeatherUpdate,120000);
