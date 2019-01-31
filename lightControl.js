// Written by Joshua Fabian, jfabi@alum.mit.edu

//  Lifx light bulb control

var brightness = 0;
var power = 'unknown';
var lightLabel = 'Unknown';
var colorHue = 0;
var colorKelvin = 0;
var colorSaturation = 0;
var connected = 'unknown';
        
var lifxBulbGetStatus = function lifxBulbGetStatus(nextFunction) {
    jQuery(document).ready(function($) {
        $.ajax({
            url : 'https://api.lifx.com/v1/lights/all',
            type : 'GET',
            dataType : 'json',
            headers : {'Authorization': 'Bearer ' + lifxToken},
            success : function(parsed_json) {
                brightness = Math.round(parsed_json[0]['brightness'] * 100);
                power = parsed_json[0]['power'];
                lightLabel = parsed_json[0]['label'];
                colorHue = Math.round(parsed_json[0]['color']['hue']);
                colorKelvin = parsed_json[0]['color']['kelvin'];
                colorSaturation = Math.round(parsed_json[0]['color']['saturation']);
                connected = parsed_json[0]['connected'];
                
                console.log(parsed_json)
                console.log("GS - About to execute...")
                console.log(nextFunction)
                nextFunction()
            }
        });
    });
};
//setInterval(transitPredictionsUpdate,30000);

var lifxBulbTogglePower = function lifxBulbTogglePower() {
    if (power == 'off') {
        power = 'on';
        document.getElementById('lifxPower').innerHTML = power;
        document.getElementById('lifxPowerTurn').innerHTML = 'OFF';
    } else {
        power = 'off';
        document.getElementById('lifxPower').innerHTML = power;
        document.getElementById('lifxPowerTurn').innerHTML = 'ON';
    }
};

var lifxBulbChangeBrightness = function lifxBulbChangeBrightness(delta) {
    brightness += delta;
    brightness = Math.max(brightness, 0);
    brightness = Math.min(brightness, 100);
    document.getElementById('lifxBrightness').innerHTML = brightness;
};

var lifxBulbChangeTemperature = function lifxBulbChangeTemperature(delta) {
    colorKelvin += delta;
    colorKelvin = Math.max(colorKelvin, 2500);
    colorKelvin = Math.min(colorKelvin, 9000);
    document.getElementById('lifxTemperature').innerHTML = colorKelvin;
};

var lifxBulbChangeHue = function lifxBulbChangeHue(delta) {
    colorHue += delta;
    colorHue = Math.max(colorHue, 0);
    colorHue = Math.min(colorHue, 360);
    document.getElementById('lifxHue').innerHTML = colorHue;
};

var lifxBulbChangeSaturation = function lifxBulbChangeSaturation(delta) {
    colorSaturation += delta;
    colorSaturation = Math.max(colorSaturation, 0);
    colorSaturation = Math.min(colorSaturation, 100);
    document.getElementById('lifxSaturation').innerHTML = colorSaturation;
};

var lifxBulbSetState = function lifxBulbSetState() {
    jQuery(document).ready(function($) {
        $.ajax({
            url : 'https://api.lifx.com/v1/lights/all/state',
            type : 'PUT',
            data : {
                'power' : power,
                'color' : 'kelvin:' + colorKelvin + ' hue:' + colorHue + ' saturation:' + (colorSaturation * 0.01),
                'brightness' : brightness * 0.01,
                'duration' : 1,
                'fast' : true,
            },
            dataType : 'json',
            headers : {'Authorization': 'Bearer ' + lifxToken},
            success : function(parsed_json) {
                console.log(parsed_json)
                console.log("SS - Just executed state setting...")
            }
        });
    });
};

var showLifxControl = function showLifxControl() {
    var lightControlDiv = document.getElementById('light-control');
    var htmlForLifxControl = ''

    if (lightControlDiv.style.display == 'none') {
        lifxBulbGetStatus(populateLifxControl);
    } else {
        lightControlDiv.style.display = 'none';
        console.log('You closed it up!')
        // Update light bulb with parameters set in menu
        lifxBulbSetState();
        lightControlDiv.innerHTML = '';
    }
};

var populateLifxControl = function populateLifxControl() {
    console.log('You opened it up!')
    var htmlForLifxControl = '';
    var lightControlDiv = document.getElementById('light-control');
    htmlForLifxControl += '<b><i>' + lightLabel + '</i></b>';

    if (connected == true) {
        htmlForLifxControl += '<br><b>Powered</b> <span id="lifxPower">' + power + '</span>';
        if (power == 'off') {
            htmlForLifxControl += ' <a onclick="lifxBulbTogglePower()" href="javascript:void(0);">TURN <span id="lifxPowerTurn">ON</span></a>';
        } else {
            htmlForLifxControl += ' <a onclick="lifxBulbTogglePower()" href="javascript:void(0);">TURN <span id="lifxPowerTurn">OFF</span></a>';
        }

        htmlForLifxControl += '<br><a onclick="lifxBulbChangeBrightness(-3)" href="javascript:void(0);">DOWN</a> ';
        htmlForLifxControl += '<b>Brightness</b> <span id="lifxBrightness">' + brightness + '</span>';
        htmlForLifxControl += ' <a onclick="lifxBulbChangeBrightness(3)" href="javascript:void(0);">UP</a>';

        htmlForLifxControl += '<br><a onclick="lifxBulbChangeTemperature(-250)" href="javascript:void(0);">WARMER</a> ';
        htmlForLifxControl += '<b>Temperature</b> <span id="lifxTemperature">' + colorKelvin + '</span>';
        htmlForLifxControl += ' <a onclick="lifxBulbChangeTemperature(250)" href="javascript:void(0);">COOLER</a>';

        htmlForLifxControl += '<br><a onclick="lifxBulbChangeHue(-15)" href="javascript:void(0);">DOWN</a> ';
        htmlForLifxControl += '<b>Hue</b> <span id="lifxHue">' + colorHue + '</span>';
        htmlForLifxControl += ' <a onclick="lifxBulbChangeHue(15)" href="javascript:void(0);">UP</a>';

        htmlForLifxControl += '<br><a onclick="lifxBulbChangeSaturation(-3)" href="javascript:void(0);">DOWN</a> ';
        htmlForLifxControl += '<b>Saturation</b> <span id="lifxSaturation">' + colorSaturation + '</span>';
        htmlForLifxControl += ' <a onclick="lifxBulbChangeSaturation(3)" href="javascript:void(0);">UP</a>';
    } else {
        htmlForLifxControl += '<br><i><b>Error:</b> This light bulb is not connected!</i>';
    }

    lightControlDiv.style.display = 'inline';
    lightControlDiv.innerHTML = htmlForLifxControl;
};
