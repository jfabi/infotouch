// Written by Joshua Fabian, jfabi@alum.mit.edu

var weatherIconClass = function weatherIconClass(casedCondition) {
	var iconClass = 'train';
	var condition = casedCondition.toLowerCase();

	if (condition.includes('partly cloudy') || condition.includes('mostly cloudy')) {
		iconClass = currentIsDaytime + '-cloudy';
	} else if (condition.includes('partly clear') || condition.includes('mostly clear')) {
		iconClass = currentIsDaytime + '-cloudy';
	} else if (condition == 'cloudy' || condition.includes('overcast')) {
		iconClass = 'cloudy';
	} else if (condition.includes('sunny')) {
		iconClass = 'day-sunny';
	} else if (condition.includes('clear')) {
		iconClass = 'night-clear';
	} else if (condition.includes('flood')) {
		iconClass = 'flood';
	} else if (condition.includes('snow') && condition.includes('thunderstorm')) {
		iconClass = currentIsDaytime + '-snow-thunderstorm';
	} else if (condition.includes('thunderstorm')) {
		iconClass = 'thunderstorm';
	} else if (condition.includes('snow') && condition.includes('wind')) {
		iconClass = 'snow-wind';
	} else if (condition.includes('rain') && condition.includes('wind')) {
		iconClass = 'rain-wind';
	} else if (condition.includes('wind') || condition.includes('breez')) {
		iconClass = 'strong-wind';
	} else if (condition.includes('mix')) {
		iconClass = 'rain-mix';
	} else if (condition.includes('sleet')) {
		iconClass = 'sleet';
	} else if (condition.includes('hail')) {
		iconClass = 'hail';
	} else if (condition.includes('snow')) {
		iconClass = 'snow';
	} else if (condition.includes('showers')) {
		iconClass = 'showers';
	} else if (condition.includes('sprinkles')) {
		iconClass = 'sprinkle';
	} else if (condition.includes('smoke')) {
		iconClass = 'smoke';
	} else if (condition.includes('dust')) {
		iconClass = 'dust';
	} else if (condition.includes('sandstorm')) {
		iconClass = 'sandstorm';
	} else if (condition.includes('haze') || condition.includes('hazy')) {
		iconClass = 'day-haze';
	} else if (condition.includes('hot')) {
		iconClass = 'hot';
	} else if (condition.includes('cold')) {
		iconClass = 'thermometer-exterior';
	} else if (condition.includes('fog')) {
		iconClass = 'fog';
	} else if (condition.includes('hurricane') || condition.includes('tropical storm') || condition.includes('tropical depression')) {
		iconClass = 'hurricane';
	} else if (condition.includes('tornado')) {
		iconClass = 'tornado';
	} else if (condition.includes('volcano')) {
		iconClass = 'volcano';
	} else if (condition.includes('fire')) {
		iconClass = 'fire';
	} else if (condition.includes('meteor') || condition.includes('asteroid')) {
		iconClass = 'meteor';
	}

	return ('wi-' + iconClass);
}