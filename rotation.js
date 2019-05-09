$(document).ready(function(){
  $('.rotation-group').slick({
    infinite: true,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 0,
    adaptiveHeight: true,
    pauseOnHover: false,
    useTransform: false,
  });

  $('.rotation-group').slick('slickFilter', '.rotation-include');
  // Rotate between elements with class 'rotation-include'
});

var displayAlertsMinor = true;
var displayAlertsSevere = true;
var stylesheet = document.styleSheets[4]

var rotationUpdate = function rotationUpdate() {

    var currentTime = new Date();

    // FUTURE: Replace with config.js variables
    weekdayPredict = currentTime.getHours() >= 0 && currentTime.getHours() < 24 && currentTime.getDay() > 0 && currentTime.getDay() <= 6
    sundayPredict = currentTime.getHours() >= 9 && currentTime.getHours() < 24 && (currentTime.getDay() == 0 || currentTime.getDay() == 7)
    weekdayHideTwitter = currentTime.getHours() >= 8 && currentTime.getHours() < 9 && currentTime.getDay() > 0 && currentTime.getDay() < 6
    displayAlertsMinor = currentTime.getHours() >= 0 && currentTime.getHours() < 24 && currentTime.getDay() > 0 && currentTime.getDay() < 6

    overnightMode = currentTime.getHours() >= 1 && currentTime.getHours() <= 6
    if (overnightMode == false) {
		stylesheet.deleteRule(2)
		stylesheet.deleteRule(1)
		stylesheet.insertRule('.normal-colors {color: black; background-color: white; border-color: black;}', 1);
		stylesheet.insertRule('.inverse-colors {color: white; background-color: black; border-color: white;}', 2);
	} else {
		stylesheet.deleteRule(2)
		stylesheet.deleteRule(1)
		stylesheet.insertRule('.normal-colors {color: white; background-color: black; border-color: white;}', 1);
		stylesheet.insertRule('.inverse-colors {color: black; background-color: white; border-color: black;}', 2);
	}

    var transitPredictionsDiv = document.getElementById('transit-predictions');
    if (transitPredictionsDiv != null) {
    	if (transitPredictionsDiv.children.length > 0) {
		    if ((weekdayPredict || sundayPredict) && overnightMode == false) {
		    	slickIndex = $('#transit-predictions').attr('data-slick-index');
		    	console.log("Mode A")
		    	console.log(transitPredictionsDiv)
		    	console.log(slickIndex)
		    	transitPredictionsDiv.style.display = 'inline';
		    	if (slickIndex == null) {
		    		$('.rotation-group').slick('slickAdd', '#transit-predictions');
		    	}
		    } else {
		    	slickIndex = $('#transit-predictions').attr('data-slick-index');
		    	console.log("Mode B")
		    	console.log(transitPredictionsDiv)
		    	console.log(slickIndex)
		    	transitPredictionsDiv.style.display = 'none';
		    	if (slickIndex != null) {
		    		console.log("")
		    		console.log(" !!!!! REMOVING PREDICTIONS")
		    		console.log(slickIndex)
		    		console.log("")
		        	$('.rotation-group').slick('slickRemove', slickIndex);
		    	}
		    }
		}
	}

    var messageStatusDiv = document.getElementById('message-status');
    if (messageStatusDiv != null) {
    	if (messageStatusDiv.children.length > 0) {
		    if (!weekdayHideTwitter && currentSevereImmediate == false && overnightMode == false) {
		    	slickIndex = $('#message-status').attr('data-slick-index');
		    	console.log("Mode T")
		    	console.log(slickIndex)
		    	messageStatusDiv.style.display = 'inline';
		    	if (slickIndex == null) {
		    		$('.rotation-group').slick('slickAdd', '#message-status');
		    	}
		    } else {
		    	slickIndex = $('#message-status').attr('data-slick-index');
		    	console.log("Mode U")
		    	console.log(slickIndex)
		    	messageStatusDiv.style.display = 'none';
		    	lastDisplayText = '';
		    	if (slickIndex != null) {
		    		console.log("")
		    		console.log(" !!!!! REMOVING TWITTER")
		    		console.log(slickIndex)
		    		console.log("")
		        	$('.rotation-group').slick('slickRemove', slickIndex);
		    	}
		    }
		}
	}
};

setInterval(rotationUpdate,15000);
