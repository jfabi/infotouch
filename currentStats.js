// Written by Joshua Fabian, jfabi@alum.mit.edu

//  Current time and weather display (updates once every 5 seconds)

var currentTempF = 0;
var currentTempC = 0;
var tempString = '';
var currentIsDaytime = 'Nighttime';
var currentWeather = '';
var overnightMode = false;
        
var currentStatsUpdate = function currentStatsUpdate() {

    var currentTime = new Date();
    htmlForCurrentStats = '<table><tr>'
    htmlForCurrentStats += '<td style="width: 28%; text-align: left">infoTouch by jfabi</td>'
    htmlForCurrentStats += '<td style="width: 16%; text-align: center"><a onclick="showLifxControl()" href="javascript:void(0);">BULB</a></td>'
    if (currentTime.getSeconds() % 10 < 5 && overnightMode == false) {
        // Show clock time, temp in C
        var hour = currentTime.getHours();
        if (hour < 10) {
            hour = "0" + hour;
        }
        var minute = currentTime.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }

        htmlForCurrentStats += '<td style="width: 28%; text-align: center">' + hour + ':' + minute + '</td>'
        tempString = currentTempC + '&deg;C'
    } else {
        // Show day of week, day of month, temp in F
        var day = currentTime.getDate();
        var dayOfWeek = currentTime.getDay();
        var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        htmlForCurrentStats += '<td style="width: 28%; text-align: center">' + daysOfWeek[dayOfWeek] + ' ' + day + '</td>'
        if (currentTime.getSeconds() % 10 >= 5) {
            tempString = currentTempF + '&deg;F'
        } else {
            tempString = currentTempC + '&deg;C'
        }
    }

    htmlForCurrentStats += '<td style="width: 28%; text-align: right"><a onclick="showWeatherForecast()" href="javascript:void(0);">' + tempString + ' ' + currentWeather + '</a></td>'
    htmlForCurrentStats += '</tr></table>'

    document.getElementById('current-stats').innerHTML = htmlForCurrentStats;

    var overnightModeDiv = document.getElementById('overnight-mode');
    if (overnightMode == true) {
        if (overnightModeDiv == null) {
            // Create a new div with just the time in overnight mode, add to Slick rotation
            $('#main').append('<div id="overnight-mode" style="size: 24px; color: white; background-color: black;"></div>');
            $('.rotation-group').slick('slickAdd', '#overnight-mode');
        }
        // Update the current time in overnight-mode
        var hour = currentTime.getHours();
        if (hour < 10) {
            hour = "0" + hour;
        }
        var minute = currentTime.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }
        document.getElementById('overnight-mode').innerHTML = hour + ':' + minute;
    } else {
        if (overnightModeDiv != null) {
            // Remove overnight-mode div from Slick and body
            $('.rotation-group').slick('slickRemove', $('#overnight-mode').attr('data-slick-index'));
            document.getElementById('overnight-mode').remove();
        }
    }

};

currentStatsUpdate();
setInterval(currentStatsUpdate,5000);
