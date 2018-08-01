// Written by Joshua Fabian, jfabi@alum.mit.edu

//  NWS alerts (updates once every 120 seconds)
        
var severeWeatherUpdate = function nextServiceUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.weather.gov/alerts?active=1&point=" + weatherPoint,
            dataType : "json",
            success : function(parsed_json) {

                var allAlerts = parsed_json['features'];
                var htmlForAlerts = '';

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

                    htmlForAlerts += '<h2 class="weatherAlert" style="color: white; background-color: red">'
                    htmlForAlerts += '<span class="weatherAlertType">';
                    htmlForAlerts += alertName + '</span>';
                    htmlForAlerts += '<span class="alertExpire"> until ' + expiresDay + ' ';
                    htmlForAlerts += expiresHours + ':' + expiresMins + '</span>'
                    htmlForAlerts += '</h2>' + description + '<br/><br/>';
                }

                if (document.getElementById('severe-weather') == null && htmlForAlerts != '') {
                    // Create object and add to current rotation
                    $('#main').append('<div id="severe-weather"></div>');
                    document.getElementById('severe-weather').innerHTML = htmlForAlerts;
                    $('.rotation-group').slick('slickAdd', '#severe-weather');
                } else if (htmlForAlerts != '') {
                    // Update existing object
                    document.getElementById('severe-weather').innerHTML = htmlForAlerts;
                } else if (document.getElementById('severe-weather') != null && $('#severe-weather').attr('data-slick-index') != null) {
                    // Remove object from current rotation
                    $('.rotation-group').slick('slickRemove', $('#severe-weather').attr('data-slick-index'))
                }
            }
        });
    });

};

severeWeatherUpdate();
setInterval(severeWeatherUpdate,120000);
