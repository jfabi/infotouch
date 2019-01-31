$(document).ready(function(){
  $('.rotation-group').slick({
    infinite: true,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 0,
    adaptiveHeight: true
  });

  $('.rotation-group').slick('slickFilter', '.rotation-include');
  // Rotate between elements with class 'rotation-include'
});

var displayAlertsMinor = true;
var displayAlertsSevere = true;

var rotationUpdate = function rotationUpdate() {

    var currentTime = new Date();

    // FUTURE: Replace with config.js variables
    var weekdayPredict = currentTime.getHours() >= 0 && currentTime.getHours() < 24 && currentTime.getDay() > 0 && currentTime.getDay() <= 6
    var sundayPredict = currentTime.getHours() >= 10 && currentTime.getHours() < 13 && currentTime.getDay() == 0
    var weekdayHideTwitter = currentTime.getHours() >= 8 && currentTime.getHours() < 10 && currentTime.getDay() > 0 && currentTime.getDay() < 6
    var displayAlertsMinor = currentTime.getHours() >= 0 && currentTime.getHours() < 24 && currentTime.getDay() > 0 && currentTime.getDay() < 6
    overnightMode = currentTime.getHours() >= 1 && currentTime.getHours() < 7

    var transitPredictionsDiv = document.getElementById('transit-predictions');
    if (transitPredictionsDiv != null) {
    	if (transitPredictionsDiv.children.length > 0) {
		    if ((weekdayPredict || sundayPredict) && currentSevereImmediate == false && overnightMode == false) {
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
