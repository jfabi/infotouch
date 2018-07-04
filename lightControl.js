// Written by Joshua Fabian, jfabi@alum.mit.edu

//  Lifx light bulb control

var brightness = 0;
var power = "unknown";
var lightLabel = "Unknown";
var colorHue = 0;
var colorKelvin = 0;
var colorSaturation = 0;
        
var lifxBulbGetStatus = function lifxBulbGetStatus(nextFunction) {

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://api.lifx.com/v1/lights/all",
            type : "GET",
            dataType : "json",
            headers : {"Authorization": "Bearer " + lifxToken},
            success : function(parsed_json) {
                brightness = parsed_json[0]['brightness'];
                power = parsed_json[0]['power'];
                lightLabel = parsed_json[0]['label'];
                colorHue = Math.round(parsed_json[0]['color']['hue']);
                colorKelvin = parsed_json[0]['color']['kelvin'];
                colorSaturation = Math.round(parsed_json[0]['color']['saturation']);
                
                console.log(parsed_json)
                nextFunction()
            }
        });
    });

};
//setInterval(transitPredictionsUpdate,30000);

var showLifxControl = function showLifxControl() {
    var lightControlDiv = document.getElementById('light-control');
    var htmlForLifxControl = ''

    if (lightControlDiv.style.display === 'none') {
        lifxBulbGetStatus(populateLifxControl);
    } else {
        lightControlDiv.style.display = 'none';
        console.log('You closed it up!')
        lightControlDiv.innerHTML = '';
    }
};

var populateLifxControl = function populateLifxControl() {
    console.log('You opened it up!')
    var htmlForLifxControl = '';
    var lightControlDiv = document.getElementById('light-control');
    htmlForLifxControl += '<b><i>' + lightLabel + '</i></b>';
    htmlForLifxControl += '<br><b>Powered</b> ' + power;
    htmlForLifxControl += '<br><b>Temperature</b> ' + colorKelvin;
    htmlForLifxControl += '<br><b>Hue</b> ' + colorHue;
    htmlForLifxControl += '<br><b>Saturation</b> ' + colorSaturation;
    lightControlDiv.style.display = 'inline';
    lightControlDiv.innerHTML = htmlForLifxControl;
};
