// Written by Joshua Fabian, jfabi@alum.mit.edu

//  Current time and weather display (updates once every 5 seconds)

var currentTempF = 0;
var currentTempC = 0;
var tempString = '';
var currentIsDaytime = 'Nighttime';
var currentWeather = '';
var statsMode = '';
var overnightMode = false;
var weekdayPredict = true;
var sundayPredict = true;
var weekdayHideTwitter = false;
var colorClass = 'normal-colors';
var inverseColorClass = 'overnight-colors';
        
var currentStatsUpdate = function currentStatsUpdate() {

    var currentTime = new Date();
    htmlForCurrentStats = '<table id="header-container" class="normal-colors"><tr>'
    htmlForCurrentStats += '<td style="width: 27%; text-align: left;" class="app-title"><b>infoTouch</b> by jfabi</td>'

    if ((currentTime.getSeconds() % 10 < 5 && overnightMode == false) || statsMode == 'weather-forecast-open' || statsMode == 'light-control-open') {
        // Show clock time, day of week
        var dayOfWeek = currentTime.getDay();
        var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var hour = currentTime.getHours();
        if (hour < 10) {
            hour = "0" + hour;
        }
        var minute = currentTime.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }

        htmlForCurrentStats += '<td style="width: 53%; text-align: right;">'
        htmlForCurrentStats += '<span class="header-smaller">' + daysOfWeek[dayOfWeek] + ' </span>'
        htmlForCurrentStats += '<span class="header-larger">' + hour + ':' + minute + '</span>'
        htmlForCurrentStats += '</td>'
    } else {
        // Show temp in C, temp in F
        htmlForCurrentStats += '<td style="width: 53%; text-align: right;">'
        htmlForCurrentStats += '<a onclick="showWeatherForecast()" href="javascript:void(0);" class="' + 'normal-colors' + '">'
        htmlForCurrentStats += '<i class="wi ' + currentWeatherIcon + ' weather-icon-header"></i>&nbsp;&nbsp;'
        htmlForCurrentStats += '<span class="header-larger">' + currentTempC + '&deg;</span><span class="header-smaller">C</span>'
        htmlForCurrentStats += '<span class="header-larger"> ' + currentTempF + '&deg;</span><span class="header-smaller">F</span>'
        htmlForCurrentStats += '</a></td>'
    }

    if (statsMode == 'weather-forecast-open') {
        // Upper-right button for closing weather forecast
        htmlForCurrentStats += '<td style="width: 7%; text-align: right; vertical-align: inherit;"><a onclick="showWeatherForecast()" href="javascript:void(0);" class="inverse-colors header-close-button">&#10006;</a></td>'
    } else if (statsMode == 'light-control-open') {
        // Upper-right button for closing light control
        htmlForCurrentStats += '<td style="width: 7%; text-align: right; vertical-align: inherit;"><a onclick="showLifxControl()" href="javascript:void(0);" class="inverse-colors header-close-button">&#10006;</a></td>'
    } else {
        // Light bulb icons created by Numero Uno from Noun Project (CC)
        var bulbFileName = 'bulb-unlit-black.png';
        if (overnightMode == true) {
            bulbFileName = 'bulb-unlit-white.png';
        }
        htmlForCurrentStats += '<td style="width: 7%; text-align: right; vertical-align: inherit;"><a onclick="showLifxControl()" href="javascript:void(0);" class="normal-colors"><img src="icons/' + bulbFileName + '" height="58px"></a></td>'
    }

    htmlForCurrentStats += '</tr>'
    htmlForCurrentStats += '</table><div class="header-delineator ' + 'inverse-colors' + '"></div>'

    document.getElementById('current-stats').innerHTML = htmlForCurrentStats;

    var overnightModeDiv = document.getElementById('overnight-mode');
    if (overnightMode == true) {
        if (overnightModeDiv == null) {
            // Create a new div with just the time in overnight mode, add to Slick rotation
            $('#main').append('<div id="overnight-mode"></div>');
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
        document.getElementById('overnight-mode').innerHTML = '<div class="overnight-mode-container">' + hour + ':' + minute + '</div>';
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
