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
var currentIsDaytime = 'Nighttime';
var currentWeather = '';
        
var weatherForecastUpdate = function nextWeatherForecastUpdate() {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.weather.gov/gridpoints/" + weatherGrid + "/forecast/hourly",
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
                    var isDaytimeDisplay = 'Nighttime';
                    if (isDaytime == true) {
                        isDaytimeDisplay = 'Daytime';
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
                        currentTempF = fTemp;
                        currentTempC = cTemp;
                        currentIsDaytime = isDaytimeDisplay;
                        currentWeather = description;
                    }

                    htmlForForecasts += '<span class="weatherForecast">'
                    htmlForForecasts += timeDisplay + '</span>&nbsp;';
                    htmlForForecasts += description + '&nbsp;(' + isDaytimeDisplay + ')&nbsp;'
                    htmlForForecasts += '<span class="temparatures">&nbsp;';
                    htmlForForecasts += cTemp + '&deg;C / ' + fTemp + '&deg;F&nbsp;';
                    htmlForForecasts += '</span><br/>';
                }

                if (document.getElementById('weather-forecast') == null) {
                    $('#main').append('<div id="weather-forecast" style="display: none"></div>');
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
        weatherForecastDiv.style.display = 'inline';
    } else {
        weatherForecastDiv.style.display = 'none';
        console.log('You closed it up!')
        // weatherForecastDiv.innerHTML = '';
    }
};

weatherForecastUpdate();
setInterval(weatherForecastUpdate,600000);
