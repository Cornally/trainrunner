 // Iterate through ajax response to get next valid index.
 // The service flags trains that have departed and
 // nulls out their station stops once they've departed.
 // @data: json response
var getNextUndepartedTrain = function(data){
	var trips = data.GetTripStatusJsonResult;
	for (var k = 0; k < trips.length; ++k) {
		if (trips[k].TrainStatus !== 'Departed' && trips[k].StationStops !== null && trips[k].StationStops !== undefined){
			return k;
		}
	}
};

// Return a list of stations for the first
// viable result, outputted on new lines.
// @data: json response
var formatStationStops = function(data){
	var i = getNextUndepartedTrain(data);
	var stationStops = data.GetTripStatusJsonResult[i].StationStops;
	return stationStops.split(",").join("\n");
};

// Parse date to format JSON url
// @year: 	4-digit year, e.g. 2014
// @month: 	1 or 2-digit month, e.g. 1
// @day: 	2-digit day, e.g. 06
// @hour: 	4-digit military time, e.g. 0700
var year = new Date().getFullYear(),
	month = new Date().getMonth() + 1,
	day = new Date().getDate(),
	hour = formatHours(); 				//var hour = new Date().getHours() * 100;

// Append a leading "0" if necessary
function formatHours(){
	var currentHour = new Date().getHours() * 100;
	if (currentHour.toString().length === 4){
		return currentHour;
	} else {
		return '0' + currentHour;
	}
};

// The official MTA app uses the following JSON structure, it's brittle and I sniped it with a proxy
// e.g. http://ws.nee1983.org/ws/Trainstatus/1/188/2014/6/18/2000/5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json?_=1403139502881
// @reverse: 			Flip the origin and destination stations by pressing the forward button on the watch
// @url: 				Url to be passed in to ajax construct
// @originStation: 		Starting point (e.g. 1 = Grand Central Terminal)
// @destinationStation: End point (e.g. 188 = Fairfield Metro)
var originStation = 1,
	destinationStation = 188,
	reverse = false,
	url;

var getUrl = function(){
	if (!reverse) {
		return "http://ws.nee1983.org/ws/Trainstatus/" + originStation + "/" + destinationStation + "/" + year + "/" + month + "/" + day + "/" + hour + "/" + "5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json";
	} else {
		return "http://ws.nee1983.org/ws/Trainstatus/" + destinationStation + "/" + originStation + "/" + year + "/" + month + "/" + day + "/" + hour + "/" + "5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json";
	}
}

// The main call to grab data and update our Pebble
function fetch(){
	// Simply mini ajax structure
	ajax({ 
		url: getUrl(),
		type: 'json',
		cache: false
	}, 
	function(data){
		var headlineText = '';
		var bodyText = '';
		if (data){
			// Fetch next viable train
			var i = getNextUndepartedTrain(data);

			// Check for a valid returned index
			if (i === null || i === undefined){
				simply.title("No Data " + i);
				simply.body("The date " + month + "/" + day + "/" + year + " at " + hour +" is empty.");
				return;
			}

			// Clean up response for presentation
			var destination = data.GetTripStatusJsonResult[i].Destination ? data.GetTripStatusJsonResult[i].Destination : "No data";
			var departureTime = data.GetTripStatusJsonResult[i].OriginTime ? data.GetTripStatusJsonResult[i].OriginTime : "No track time";
			var departureTrack = data.GetTripStatusJsonResult[i].Track ? "Track " + data.GetTripStatusJsonResult[i].Track : "No track info";
			var stationStops = formatStationStops(data);

			// Formulate response
			headlineText = destination;
			bodyText = departureTime + "\n" + departureTrack;

			// Populate Pebble display fields
		  	simply.title(headlineText);
		  	simply.subtitle(departureTrack);
		  	simply.body(departureTime + "\n" + "-----------" + "\n" + stationStops);
		}

	  	// For your pleasure
	  	simply.vibe('short');
	});
}

// TODO
// Sometimes, there will be no viable trains for an hour
// and we have to push ahead a day & re-fetch (around midnight).
function incrementDate(){
	var tomorrow = new Date().getDate() + 1;
	day = tomorrow;
	if (day === 1){
		month++;
		if (month === 12){
			month = 1;
			year++;
		}
	}
}

// Bind Pebble events
function bindEvents(){
	// Click select button to flip origin and destination and update
	simply.on('singleClick', function(e) {
		if (reverse) {
			reverse = false;
		} else {
			reverse = true;
		}
		fetch();
	});

	// Shake to update
	simply.on('accelTap', function(e) {
  		fetch();
	});

	// Up & down buttons to scroll
	simply.scrollable(true);
}

// Initialization
function init(){
	fetch();
	bindEvents();
}

init();
