// Written by Joshua Fabian, jfabi@alum.mit.edu

//  NWS alerts (updates once every 600 seconds, or 10 minutes)

function toCelcius(fTemp) {
    return Math.floor((fTemp - 32) * 5 / 9);
}

function toFahrenheit(cTemp) {
    return Math.floor((cTemp * 9 / 5) + 32);
}

var currentTempF = 0;
var currentTempC = 0;
var currentIsDaytime = 'day';
var currentWeather = '';
var currentWeatherIcon = 'wi-train';
        
var weatherForecastUpdate = function nextWeatherForecastUpdate() {
    // Fetch current conditions
    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.weather.gov/stations/" + weatherStation + "/observations/latest",
            dataType : "json",
            success : function(parsed_json) {

                var currentWeatherOutput = parsed_json['properties'];
                var htmlForForecasts = '';

                if (currentWeatherOutput['temperature']['unitCode'] == 'unit:degF') {
                    currentTempF = Math.round(currentWeatherOutput['temperature']['value']);
                    currentTempC = toCelcius(currentWeatherOutput['temperature']['value']);
                } else if (currentWeatherOutput['temperature']['unitCode'] == 'unit:degC') {
                    currentTempC = Math.round(currentWeatherOutput['temperature']['value']);
                    currentTempF = toFahrenheit(currentWeatherOutput['temperature']['value']);
                }
                currentWeather = currentWeatherOutput['textDescription'];
            }
        });
    });

    // Fetch upcoming forecast
    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.weather.gov/points/" + weatherPoint['latitude'] + "," + weatherPoint['longitude'] + "/forecast/hourly",
            dataType : "json",
            success : function(parsed_json) {

                var allForecasts = parsed_json['properties']['periods'];
                var htmlForForecasts = '';

                for (i = 0; i < allForecasts.length && i <= 12; i = i + 3) {
                    var description = allForecasts[i]['shortForecast'];
                    var timestamp = new Date(allForecasts[i]['startTime']);
                    var hourDisplay = timestamp.getHours().toString().length == 1 ? '0' + timestamp.getHours() : timestamp.getHours()
                    var timeDisplay = hourDisplay + ':00';
                    var isDaytime = allForecasts[i]['isDaytime'];
                    var isDaytimeDisplay = 'night';
                    if (isDaytime == true) {
                        isDaytimeDisplay = 'day';
                    }
                    var fTemp = 0;
                    var cTemp = 0;
                    if (allForecasts[i]['temperatureUnit'] == 'F') {
                        fTemp = allForecasts[i]['temperature'];
                        cTemp = toCelcius(fTemp);
                    } else if (allForecasts[i]['temperatureUnit'] == 'C') {
                        cTemp = allForecasts[i]['temperature'];
                        fTemp = toFahrenheit(cTemp);
                    }


                    if (i == 0) {
                        currentIsDaytime = isDaytimeDisplay;
                        currentWeatherIcon = weatherIconClass(currentWeather,currentIsDaytime);
                    }

                    htmlForForecasts += '<span class="weather-forecast">'
                    htmlForForecasts += '<span class="weather-forecast-time">' + timeDisplay + '</span>';
                    htmlForForecasts += '<i class="wi ' + weatherIconClass(description,isDaytimeDisplay) + ' weather-forecast-icon"></i>';
                    htmlForForecasts += '<span class="weather-forecast-text">' + description + '</span>';
                    htmlForForecasts += '<span class="weather-forecast-temp-c"><span class="weather-forecast-temp-data">' + cTemp + '&deg;</span><span class="weather-forecast-temp-label">C</span></span>'
                    htmlForForecasts += '<span class="weather-forecast-temp-f"><span class="weather-forecast-temp-data">' + fTemp + '&deg;</span><span class="weather-forecast-temp-label">F</span></span>';
                    htmlForForecasts += '</span>';
                }

                if (document.getElementById('weather-forecast') == null) {
                    $('#main').append('<div id="weather-forecast" style="display: none; margin: 10px;" class="normal-colors"></div>');
                    document.getElementById('weather-forecast').innerHTML = htmlForForecasts;
                } else {
                    document.getElementById('weather-forecast').innerHTML = htmlForForecasts;
                }
            }
        });
    });

};

var showWeatherForecast = function showWeatherForecast() {
    var weatherForecastDiv = document.getElementById('weather-forecast');
    if (weatherForecastDiv.style.display == 'none') {
        weatherForecastDiv.style.display = 'inline-block';
        statsMode = 'weather-forecast-open';
        currentStatsUpdate();
    } else {
        weatherForecastDiv.style.display = 'none';
        console.log('You closed it up!')
        statsMode = '';
        currentStatsUpdate();
    }
};

weatherForecastUpdate();
setInterval(weatherForecastUpdate,600000);
