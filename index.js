/*
 * Train Runner
 * A SimplyJS Pebble App
 * 
 * Authored on a train, by Chris Connelly
 * @Cornally
 */


/*
 * Extend.js - Written by Andrew Dupont, optimized by Addy Osmani
 */
function extend(destination, source) {
    var toString = Object.prototype.toString,
        objTest = toString.call({});
    for (var property in source) {
        if (source[property] && objTest === toString.call(source[property])) {
            destination[property] = destination[property] || {};
            extend(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
}

/*
 * Namespace "Train Runner"
 */
var TR = TR || {};

extend(TR, {

	/* 
	 * Parse date to format JSON url
	 * @year: 	4-digit year, e.g. 2014
	 * @month: 	1 or 2-digit month, e.g. 1
	 * @day: 	2-digit day, e.g. 06
	 * @hour: 	4-digit military time, e.g. 0700
	 */
	dates: {
		year: 	new Date().getFullYear(),
		month: 	new Date().getMonth() + 1,
		day: 	new Date().getDate(),
		hour: 	(new Date().getHours() * 100).toString().length === 4 ? new Date().getHours() * 100 : '0' + new Date().getHours() * 100
	},

	/* 
	 * The official MTA app uses the following JSON structure, it's brittle and I sniped it with a proxy
	 * e.g. http://ws.nee1983.org/ws/Trainstatus/1/188/2014/6/18/2000/5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json?_=1403139502881
	 * @originStation: 		Starting point (e.g. 1 = Grand Central Terminal)
	 * @destinationStation: End point (e.g. 188 = Fairfield Metro)
	 * @reverse: 			Flip the origin and destination stations by pressing the forward button on the watch
	 * @url: 				Url to be passed in to ajax construct
	 */
	url: {
		originStation: 			1,
		destinationStation: 	188,
		reverse: 				false,
		url: 					''
	},

	// TODO: Sometimes, there will be no viable trains for an hour
	// and we have to push ahead a day & re-fetch (around midnight).
	// return the url construct's date portion
	/*formatDate: function() {
		var d = new Date();

		TR.dates.year = 	d.getFullYear();
		TR.dates.month = 	d.getMonth() + 1;
		TR.dates.day = 		d.getDate();

		var tomorrow = new Date(+new Date() + 86400000); //var tomorrow = new Date().getDate() + 1;
		if (tomorrow.day === 1){
			TR.dates.day = tomorrow;
			TR.dates.month++;
			if (TR.dates.month === 12){
				TR.dates.month = 1;
				TR.dates.year++;
			}
		}
	},*/

	/* 
	 * Iterate through ajax response to get next valid index.
	 * The service flags trains that have departed and
	 * nulls out their station stops once they've departed.
	 * @data: json response
	 */
	getNextUndepartedTrain: function(data) {
		var trips = data.GetTripStatusJsonResult;
		for (var k = 0; k < trips.length; ++k) {
			if (trips[k].TrainStatus !== 'Departed' && trips[k].StationStops !== null && trips[k].StationStops !== undefined){
				return k;
			}
		}
	},

	/*
	 * Return a list of stations for the first
	 * viable result, outputted on new lines.
	 * @data: json response
	 */
	formatStationStops: function(data) {
		var i = this.getNextUndepartedTrain(data),
			stationStops = data.GetTripStatusJsonResult[i].StationStops;
		return stationStops.split(",").join("\n");
	},
	
	/*
	 * Return the URL to be passed to SimplyJS baby ajax wrapper
	 */
	getUrl: function() {
		if (!TR.url.reverse) {
			return "http://ws.nee1983.org/ws/Trainstatus/" + TR.url.originStation + "/" + TR.url.destinationStation + "/" + TR.dates.year + "/" + TR.dates.month + "/" + TR.dates.day + "/" + TR.dates.hour + "/" + "5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json";
		} else {
			return "http://ws.nee1983.org/ws/Trainstatus/" + TR.url.destinationStation + "/" + TR.url.originStation + "/" + TR.dates.year + "/" + TR.dates.month + "/" + TR.dates.day + "/" + TR.dates.hour + "/" + "5860c1ee-1ade-4825-b47a-1f07466b0840/tripstatus.json";
		}
	},

	/*
	 * The main call to grab data and update our Pebble
	 */
	fetch: function() {
		// Simply mini ajax structure
		ajax({ 
			url: TR.getUrl(),
			type: 'json',
			cache: false
		}, 
		function(data) {
			var headlineText = '',
				bodyText = '';
			if (data) {
				// Fetch next viable train
				var i = TR.getNextUndepartedTrain(data);

				// Check for a valid returned index
				if (i === null || i === undefined){
					simply.title("No Data " + i);
					simply.body("The date " + TR.dates.month + "/" + TR.dates.day + "/" + TR.dates.year + " at " + TR.dates.hour +" is empty.");
					return;
				}

				// Clean up response for presentation
				var destination = data.GetTripStatusJsonResult[i].Destination ? data.GetTripStatusJsonResult[i].Destination : "No data",
					departureTime = data.GetTripStatusJsonResult[i].OriginTime ? data.GetTripStatusJsonResult[i].OriginTime : "No track time",
					departureTrack = data.GetTripStatusJsonResult[i].Track ? "Track " + data.GetTripStatusJsonResult[i].Track : "No track info",
					stationStops = TR.formatStationStops(data);

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
	},

	/*
	 * Bind Pebble events
	 */
	bindEvents: function() {
		// Click select button to flip origin and destination and update
		simply.on('singleClick', function(e) {
			if (TR.url.reverse) {
				TR.url.reverse = false;
			} else {
				TR.url.reverse = true;
			}
			TR.fetch();
		});

		// Shake to update
		simply.on('accelTap', function(e) {
	  		TR.fetch();
		});

		// Up & down buttons to scroll
		simply.scrollable(true);
	},

	/*
	 * Initialization
	 */
	init: function() {
		TR.fetch();
		TR.bindEvents();
	}

});

TR.init();
