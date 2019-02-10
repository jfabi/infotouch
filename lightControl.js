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
                colorSaturation = Math.round(parsed_json[0]['color']['saturation'] * 100);
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
    } else {
        power = 'off';
    }
};

var lifxBulbChangeBrightness = function lifxBulbChangeBrightness() {
    brightness = document.getElementById('light-slider-brightness').value;
};

var lifxBulbChangeTemperature = function lifxBulbChangeTemperature() {
    colorKelvin = document.getElementById('light-slider-temperature').value;
};

var lifxBulbChangeHue = function lifxBulbChangeHue() {
    colorHue = document.getElementById('light-slider-hue').value;

    console.log(stylesheet);
    stylesheet.deleteRule(3);
    stylesheet.insertRule('.light-slider-saturation-input {background: linear-gradient(to right, hsl(' + colorHue + ', 0%, 50%), hsl(' + colorHue + ', 100%, 50%)) !important;}', 3);
    console.log(stylesheet);
};

var lifxBulbChangeSaturation = function lifxBulbChangeSaturation() {
    colorSaturation = document.getElementById('light-slider-saturation').value;
    document.getElementById('light-value-saturation').innerHTML = colorSaturation;
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

    if (connected == true) {
        var poweredCheckbox = '';
        if (power == 'on') {
            poweredCheckbox = ' checked';
        }

        var hueFileName = 'icons/hue-black.png';
        if (overnightMode == true) {
            hueFileName = 'icons/hue-white.png';
        }

        htmlForLifxControl += '<span class="light-row">';
        htmlForLifxControl += '<span class="light-label-title">' + lightLabel + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
        htmlForLifxControl += '<span class="light-input-toggle"><label class="light-toggle"><input type="checkbox" id="lifxPowerTurn"' + poweredCheckbox + '><span class="light-toggle-power"></span></label></span>';
        htmlForLifxControl += '</span>';

        htmlForLifxControl += '<span class="light-row">';
        htmlForLifxControl += '<i class="wi wi-day-sunny light-label"></i>';
        htmlForLifxControl += '<span class="light-input"><label class="light-slider"><input type="range" min="1" max="100" value="' + brightness + '" class="light-slider-input" id="light-slider-brightness"></label></span>';
        htmlForLifxControl += '</span>';

        htmlForLifxControl += '<span class="light-row">';
        htmlForLifxControl += '<i class="wi wi-thermometer light-label"></i>';
        htmlForLifxControl += '<span class="light-input"><label class="light-slider"><input type="range" min="2500" max="9000" value="' + colorKelvin + '" class="light-slider-input light-slider-temperature-input" id="light-slider-temperature" step="100"></label></span>';
        htmlForLifxControl += '</span>';

        htmlForLifxControl += '<span class="light-row">';
        htmlForLifxControl += '<span class="light-label"><img src="' + hueFileName + '" height="46px"></img></span>';
        htmlForLifxControl += '<span class="light-input"><label class="light-slider"><input type="range" min="1" max="360" value="' + colorHue + '" class="light-slider-input light-slider-hue-input" id="light-slider-hue"></label></span>';
        htmlForLifxControl += '</span>';

        htmlForLifxControl += '<span class="light-row">';
        htmlForLifxControl += '<i class="wi wi-humidity light-label"></i>';
        htmlForLifxControl += '<span class="light-input"><label class="light-slider"><input type="range" min="0" max="100" value="' + colorSaturation + '" class="light-slider-input light-slider-saturation-input" id="light-slider-saturation"></label></span>';
        htmlForLifxControl += '</span>';

        stylesheet.deleteRule(3);
        stylesheet.insertRule('.light-slider-saturation-input {background: linear-gradient(to right, hsl(' + colorHue + ', 0%, 50%), hsl(' + colorHue + ', 100%, 50%)) !important;}', 3);
    
    } else {
        htmlForLifxControl += '<b><i>' + lightLabel + '</i></b><br><i><b>Error:</b> This light bulb is not connected!</i>';
    }

    lightControlDiv.style.display = 'inline-block';
    lightControlDiv.innerHTML = htmlForLifxControl;

    $('#lifxPowerTurn').bind('change', function(){
            lifxBulbTogglePower();
    });

    $('#light-slider-brightness').bind('input', function(){
            lifxBulbChangeBrightness();
    });

    $('#light-slider-temperature').bind('input', function(){
            lifxBulbChangeTemperature();
    });

    $('#light-slider-hue').bind('input', function(){
            lifxBulbChangeHue();
    });

    $('#light-slider-saturation').bind('input', function(){
            lifxBulbChangeSaturation();
    });

};
