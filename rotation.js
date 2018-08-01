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

var rotationUpdate = function rotationUpdate() {

    var currentTime = new Date();

    // FUTURE: Replace with config.js variables
    var weekdayPredict = currentTime.getHours() >= 8 && currentTime.getHours() < 10 && currentTime.getDay() > 0 && currentTime.getDay() < 6
    var sundayPredict = currentTime.getHours() >= 10 && currentTime.getHours() < 13 && currentTime.getDay() == 0
    var weekdayHideTwitter = currentTime.getHours() >= 8 && currentTime.getHours() < 10 && currentTime.getDay() > 0 && currentTime.getDay() < 6

    var transitPredictionsDiv = document.getElementById('transit-predictions');
    if (transitPredictionsDiv != null) {
	    if (weekdayPredict || sundayPredict) {
	    	slickIndex = $('transit-predictions').attr('data-slick-index');
	    	console.log("Mode A")
	    	console.log(slickIndex)
	    	transitPredictionsDiv.style.display = 'inline';
	    	if (slickIndex == null) {
	    		$('.rotation-group').slick('slickAdd', '#transit-predictions');
	    	}
	    } else {
	    	slickIndex = $('transit-predictions').attr('data-slick-index');
	    	console.log("Mode B")
	    	console.log(slickIndex)
	    	transitPredictionsDiv.style.display = 'none';
	    	if (slickIndex != null) {
	        	$('.rotation-group').slick('slickRemove', slickIndex);
	    	}
	    }
	}

    var messageStatusDiv = document.getElementById('message-status');
    if (messageStatusDiv != null) {
	    if (!weekdayHideTwitter) {
	    	slickIndex = $('message-status').attr('data-slick-index');
	    	console.log("Mode T")
	    	console.log(slickIndex)
	    	messageStatusDiv.style.display = 'inline';
	    	if (slickIndex == null) {
	    		$('.rotation-group').slick('slickAdd', '#message-status');
	    	}
	    } else {
	    	slickIndex = $('message-status').attr('data-slick-index');
	    	console.log("Mode U")
	    	console.log(slickIndex)
	    	messageStatusDiv.style.display = 'none';
	    	if (slickIndex != null) {
	        	$('.rotation-group').slick('slickRemove', slickIndex);
	    	}
	    }
	}

    currentTime.getHours();
    currentTime.getMinutes();
};

rotationUpdate();
setInterval(rotationUpdate,15000);