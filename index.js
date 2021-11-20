// For testing assign lat/lng pairs that we know work so we don't have to fill in the 'form'
// Otherwise we get a 400 Malformed request, cause: 'Error while parsing request: \n\n\tInvalid location specification at ','\n\tInvalid waypoint at ','\n\tUnexpected input at ','\n\tInvalid value for parameter 'origin' at ',''.
// The form should later be changed to work with address instead of lat/lng.

// TUM coords
var olat = 48.149803141861;
var olng = 11.567860198670074;

// UvA coords
//var dlat = 52.35632784585438;
//var dlng = 4.971252886117597;

// Munich Airpoty coords
var dlat = 48.353144657793344;
var dlng = 11.786160706625926;

// For reference
// Using HERE 
// https://wego.here.com/directions/mix/Munich-Airport,-Terminalstra%C3%9Fe-West,-85356-Oberding:276u287h-33978e49adeb4b2fa026780cb8d88bef/Technische-Universit%C3%A4t-M%C3%BCnchen,-Arcisstra%C3%9Fe-21,-80333-Munich:276u281z-68ca4dc5f40c475e8f5d5793dcec32b9?map=48.25352,11.67727,12,normal
// Using Google
// https://www.google.com/maps/dir/Munich+Airport,+M%C3%BCnchen-Flughafen,+Germany/Technische+Universit%C3%A4t+M%C3%BCnchen,+Arcisstra%C3%9Fe+21,+80333+M%C3%BCnchen,+Germany/@48.2531166,11.5341618,11z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x479e13dfa898f107:0xcb3789d757b96c43!2m2!1d11.7862396!2d48.3527322!1m5!1m1!1s0x479e7261336d8c11:0x79a04d44dc5bf19d!2m2!1d11.5678602!2d48.14966!3e0
var timesToPassengerArray = [];

let cars = null;

if (!cars) {
	fetch(
		'https://us-central1-sixt-hackatum-2021-orange.cloudfunctions.net/api/vehicles'
	)
		.then((response) => response.json())
		.then((data) => {
			console.log('Cars: ', data);
			cars = data;
		});
}

function callTaxi() {
	console.log('Call taxi!');
}

async function assignLowestPassengerWaitTimeCar() {
	/* 	Consider each trip a distance + duration object as both are relevant at various stages.

		1. Calculate requested trip by car based on origin & destination (use HERE API) - only once!

		2. Find lowest TIME TO PASSENGER car =>
			2.1. For each car calculate TIME TO PASSENGER as such:
				2.1.1. FREE car = current car location to requested trip origin
				2.1.2. BOOKED car = (current car location to current trip destination) + (current trip destination to requested trip origin) 
				2.1.3. CHARGING/SERVICE car = TBD
				2.1.4. Check car battery is enough as such:
					2.1.4.1. Get base distance = distance a car can drive if charge is 100 (for now using FULL_CHARGE_TRAVEL_DISTANCE for all cars)
					2.1.4.2. Calculate if it has enough battery to drive
								the distance to the requested trip origin + 
								the distance from 1 (requested trip distance) + 
								a safety of a number of KM (let's say 10, defined as SAFETY_BATTERY_TRAVEL_DISTANCE) + 
								somewhere to drive after, calculated by a different algorithm which is TBD
				2.1.5. If battery enough, add car ID + time to passenger of that car to all times to passenger array (timesToPassengerArray)

						Maybe it would be better to store for each car max distance so we don't calculate it at every - question of memory vs speed - maybe not after discussing - simple to calculate. 
						
		3. Sort the array in ascending order and grab the first element - lowest wait time for the passenger - and send that car. */

	var requestedTrip = {
		duration: 0,
		distance: 0
	};
	if (requestedTrip.distance === 0 && requestedTrip.duration === 0) {
		requestedTrip = await getRequestedTrip();
	}

	// To do less requests for now pretend car fleet = 6 cars.
	var iterations = 0;
	for (const car of cars) {
		if (iterations >= 6) break;
		iterations++;

		var carToPassengerTrip = {
			duration: 0,
			distance: 0
		};

		if (car.status === 'FREE') {
			// If car FREE, car to passenger = current car location to requested trip origin
			var idleCarToPassengerTrip = await getCarToPassengerTrip(car.lat, car.lng);
			carToPassengerTrip = idleCarToPassengerTrip;
		}
		else if (car.status === 'BOOKED') {
			// If car BOOKED, time to passenger = (current car location to current trip destination) + (current trip destination to requedted trip origin)
			console.log('BOOKED NOT IMPLEMENTED YET');
		} else if (car.status === 'SERVICE_BLOCK') {
			console.log('SERVICE BLOCK NOT IMPLEMENTED YET.');
		}

		/* 2.1.4.2. */
		var totalCarTravelDistanceNeeded =
			carToPassengerTrip.distance +
			requestedTrip.distance +
			SAFETY_BATTERY_TRAVEL_DISTANCE;
		// console.log('Total car travel distance needed: ', totalCarTravelDistanceNeeded);

		/* 2.1.5 */
		if (isBatteryEnough(car, totalCarTravelDistanceNeeded)) {
			let potentialCarInfo = {
				vehicleID: car.vehicleID,
				carToPassengerDuration: carToPassengerTrip.duration
			};
			timesToPassengerArray.push(potentialCarInfo);
		}
	}

	/* 3 */
	timesToPassengerArray.sort((a, b) =>
		a.carToPassengerDuration > b.carToPassengerDuration ? 1 : -1
	);
	var carId = timesToPassengerArray[0].vehicleID;

	console.log('Assignment done. Car ', carId, ' will arrive to the passenger in ', timesToPassengerArray[0].carToPassengerDuration, ' seconds aka ', timesToPassengerArray[0].carToPassengerDuration / 60, ' minutes, then the trip from TUM to the airport will take ', requestedTrip.duration / 60, ' minutes!!!');
}

/* 1. */
async function getRequestedTrip() {
	console.log('Getting requested trip...');

	var result = null;

	await fetch(
		'https://router.hereapi.com/v8/routes?transportMode=car&origin=' +
		olat +
		',' +
		olng +
		'&destination=' +
		dlat +
		',' +
		dlng +
		'&return=summary&apiKey=' +
		HERE_API_KEY
	)
		.then((response) => response.json())
		.then((data) => {
			console.log('Requested trip response: ', data);
			result = {
				duration: data.routes[0].sections[0].summary.duration,
				distance: data.routes[0].sections[0].summary.length
			};
		});

	return result;
}

/* 2.1. */
async function getCarToPassengerTrip(clat, clng) {
	var result = null;

	await fetch(
		'https://router.hereapi.com/v8/routes?transportMode=car&origin=' +
		clat +
		',' +
		clng +
		'&destination=' +
		olat +
		',' +
		olng +
		'&return=summary&apiKey=' +
		HERE_API_KEY
	)
		.then((response) => response.json())
		.then((data) => {
			console.log('Car to passenger trip response: ', data);
			result = {
				duration: data.routes[0].sections[0].summary.duration,
				distance: data.routes[0].sections[0].summary.length
			};
		});

	return result;
}

/* 2.1.5 */
function isBatteryEnough(car, totalCarTravelDistanceNeeded) {
	// console.log('Travel distance needed ', totalCarTravelDistanceNeeded);

	maxDistanceCar = (car.charge * FULL_CHARGE_TRAVEL_DISTANCE) / 100;
	// console.log('Max travel distance car ', maxDistanceCar);

	return totalCarTravelDistanceNeeded < maxDistanceCar;
}