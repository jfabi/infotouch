// Written by Joshua Fabian, jfabi@alum.mit.edu

//  Current time and weather display (updates once every 5 seconds)

var currentTempF = 0;
var currentTempC = 0;
var tempString = '';
var currentIsDaytime = 'Nighttime';
var currentWeather = '';
        
var currentStatsUpdate = function currentStatsUpdate() {

    var currentTime = new Date();
    htmlForCurrentStats = '<table><tr>'
    htmlForCurrentStats += '<td style="width: 28%; text-align: left">infoTouch by jfabi</td>'
    htmlForCurrentStats += '<td style="width: 16%; text-align: center"><a onclick="showLifxControl()" href="javascript:void(0);">BULB</a></td>'
    if (currentTime.getSeconds() % 10 < 5) {
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
        htmlForCurrentStats += '<td style="width: 28%; text-align: center">' + daysOfWeek[dayOfWeek] + ' ' + dayOfWeek + '</td>'
        tempString = currentTempF + '&deg;F'
    }

    htmlForCurrentStats += '<td style="width: 28%; text-align: right"><a onclick="showWeatherForecast()" href="javascript:void(0);">' + tempString + ' ' + currentWeather + '</a></td>'
    htmlForCurrentStats += '</tr></table>'

    document.getElementById('current-stats').innerHTML = htmlForCurrentStats;

};

currentStatsUpdate();
setInterval(currentStatsUpdate,5000);
