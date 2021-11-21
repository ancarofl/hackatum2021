// For testing assign lat/lng pairs that we know work so we don't have to fill in the 'form'
// Otherwise we get a 400 Malformed request, cause: 'Error while parsing request: \n\n\tInvalid location specification at ','\n\tInvalid
// waypoint at ','\n\tUnexpected input at ','\n\tInvalid value for parameter 'origin' at ',''. The form should later be changed to work with
// address instead of lat/lng.

// TUM coords
var olat = MUNICH_TUM_LAT;
var olng = MUNICH_TUM_LNG;

// UvA coords
// var dlat = 52.35632784585438;
// var dlng = 4.971252886117597;

// Munich Airport coords
var dlat = MUNICH_AIRPORT_LAT;
var dlng = MUNICH_AIRPORT_LNG;

// For reference
// Using HERE
// https://wego.here.com/directions/mix/Munich-Airport,-Terminalstra%C3%9Fe-West,-85356-Oberding:276u287h-33978e49adeb4b2fa026780cb8d88bef/Technische-Universit%C3%A4t-M%C3%BCnchen,-Arcisstra%C3%9Fe-21,-80333-Munich:276u281z-68ca4dc5f40c475e8f5d5793dcec32b9?map=48.25352,11.67727,12,normal
// Using Google
// https://www.google.com/maps/dir/Munich+Airport,+M%C3%BCnchen-Flughafen,+Germany/Technische+Universit%C3%A4t+M%C3%BCnchen,+Arcisstra%C3%9Fe+21,+80333+M%C3%BCnchen,+Germany/@48.2531166,11.5341618,11z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x479e13dfa898f107:0xcb3789d757b96c43!2m2!1d11.7862396!2d48.3527322!1m5!1m1!1s0x479e7261336d8c11:0x79a04d44dc5bf19d!2m2!1d11.5678602!2d48.14966!3e0

var cars = null;
var bookings = null;

var timesToPassengerArray = [];
var localBookingsArray = [];

/*function callTaxi() {
	console.log("Call taxi!");
}*/





async function assignLowestPassengerWaitTimeCar() {
	cars = await getCars()
	generateCars(cars);

	console.log("Cars: ", cars);

	bookings = await getBookings();
	// console.log("Bookings: ", bookings);

	timesToPassengerArray = [];

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
								a safety of a number of KM (let"s say 10, defined as SAFETY_BATTERY_TRAVEL_DISTANCE) + 
								somewhere to drive after, calculated by a different algorithm which is TBD
				2.1.5. If battery enough, add car ID + time to passenger of that car to all times to passenger array (timesToPassengerArray)

						Maybe it would be better to store for each car max distance so we don"t calculate it at every - question of memory vs speed - maybe not after discussing - simple to calculate. 
						
		3. Sort the array in ascending order and grab the first element - lowest wait time for the passenger - and send that car.

		4. Make booking.

		5. Assign vehicle. */

	var requestedTrip = {
		duration: 0,
		distance: 0
	};

	/* 1 */
	requestedTrip = await getTravelDistanceAndDuration(olat, olng, dlat, dlng);
	// console.log("Requested trip: ", requestedTrip);

	// To do less requests for now pretend car fleet = 6 cars.
	var iterations = 0;
	for (const car of cars) {
		if (iterations >= 6) break;
		iterations++;

		var carToPassengerTrip = { duration: 0, distance: 0 };

		// console.log("Car " + car.vehicleID + "status: " + car.status);
		if (car.status === "FREE") {
			carToPassengerTrip = { duration: 0, distance: 0 };

			// If car FREE, car to passenger = current car location to requested trip origin
			var idleCarToPassengerTrip = await getTravelDistanceAndDuration(car.lat, car.lng, dlat, dlng);
			carToPassengerTrip = idleCarToPassengerTrip;

			// console.log("FREE CAR");

			/* 2.1.4.2. */
			var totalCarTravelDistanceNeeded =
				carToPassengerTrip.distance +
				requestedTrip.distance +
				SAFETY_BATTERY_TRAVEL_DISTANCE;

			/* 2.1.5 */
			if (isBatteryEnoughForDistance(car, totalCarTravelDistanceNeeded)) {
				let potentialCarInfo = {
					vehicleID: car.vehicleID,
					carToPassengerDuration: carToPassengerTrip.duration,
					emptyTime: carToPassengerTrip.duration,
					emptyDist: carToPassengerTrip.distance,
				};
				timesToPassengerArray.push(potentialCarInfo);
			}
		}
		else if (car.status === "BOOKED") {
			carToPassengerTrip = { duration: 0, distance: 0 };
			// If car BOOKED, time to passenger = (current car location to current trip destination) + (current trip destination to requedted trip origin)

			/* 	For now traveling along a route and therefore real-time location is not simulated.
				Instead, by knowing the trip end time we calculate remaining time as trip end time - current time.
				This is of course not 100% accurate - but it is our assumption that in a real-world scenario a car would be reporting its location via GPS. 
				Even if that were not the case and GPS was taken out of the equation, not doing all the extra distance/route checks might still be worth it, as we anticipate the impact on the algorithm's efficiency is not that high.
				We aim to calculate this impact later on, but we expect that trips that are a bit quicker and those that are a bit slower should even things out, thus meaning that
			only some outliers when something major happens (e.g. an accident or a natural disaster or a technical issue) are not accounted for by our current model.
				Same story regarding battery(?) - we'll only update battery level at the end of a trip for ease - but assume that's updated live. */

			// Find what trip the car is on
			var bookingData = null;
			if (localBookingsArray.length > 0) {
				for (const localBooking of localBookingsArray) {
					if (localBooking.vehicleID == car.vehicleID) {
						bookingData = localBooking;
						break;
					}
				}
				if (bookingData != null) {
					var timeToEndTrip = bookingData.tripEndTime - Date.now();
					var busyCarTripEndToPassengerTrip = await getTravelDistanceAndDuration(bookingData.tripEndLat, bookingData.tripEndLng, dlat, dlng);
					carToPassengerTrip.duration = timeToEndTrip + busyCarTripEndToPassengerTrip.duration;

					//console.log("Time to end current trip: ", timeToEndTrip);
					//console.log("Current trip destination to requested trip origin: ", busyCarTripEndToPassengerTrip.duration);
					//console.log("Time for busy car to get to passenger in sec: ", carToPassengerTrip.duration);

					/* 2.1.4.2. */
					var totalCarTravelDistanceNeeded =
						bookingData.tripDistance +
						requestedTrip.distance +
						SAFETY_BATTERY_TRAVEL_DISTANCE;
					// ADAUGA BUSY TRIP . DISTANCE AICI

					/* 2.1.5 */
					if (isBatteryEnoughForDistance(car, totalCarTravelDistanceNeeded)) {
						let potentialCarInfo = {
							vehicleID: car.vehicleID,
							carToPassengerDuration: carToPassengerTrip.duration,
							emptyTime: busyCarTripEndToPassengerTrip.duration,
							emptyDist: busyCarTripEndToPassengerTrip.distance,
						};
						timesToPassengerArray.push(potentialCarInfo);
					}
				}
			}
		} else if (car.status === "SERVICE_BLOCK") {
			console.log("SERVICE BLOCK NOT IMPLEMENTED YET.");
		}
	}

	if (timesToPassengerArray.length > 0) {
		/* 3 */
		timesToPassengerArray.sort((a, b) =>
			a.carToPassengerDuration > b.carToPassengerDuration ? 1 : -1
		);

		/* 4 + 5*/
		var carId = timesToPassengerArray[0].vehicleID;

		var car = await getCar(carId);

		console.log("Times to passenger array ", timesToPassengerArray);

		timeTravelledEmpty += timesToPassengerArray[0].emptyTime;
		distanceTravelledEmpty += timesToPassengerArray[0].emptyDist;

		createLocalAndDBBooking(requestedTrip, car, (carToPassengerTrip.distance + requestedTrip.distance));
		console.log("Assignment done. Car ", carId, " will arrive to the passenger in ", timesToPassengerArray[0].carToPassengerDuration, " seconds aka ", timesToPassengerArray[0].carToPassengerDuration / 60, " minutes, then the trip from TUM to the airport will take ", requestedTrip.duration / 60, " minutes!!!");
	} else {
		console.log("Oh no no no, no cars available.");
	}
}

async function createLocalAndDBBooking(requestedTrip, car, distance) {
	console.log("Booking car " + car.vehicleID + ".");

	var bookingId = await createBooking(olat, olng, dlat, dlng);
	console.log("Test:", bookingId);
	assignCarToBooking(bookingId, car.vehicleID);

	var bookingObject = {
		id: bookingId,
		vehicleID: car.vehicleID,
		tripStartTime: Date.now() + (timesToPassengerArray[0].carToPassengerDuration * 1000),
		tripEndTime: Date.now() + (timesToPassengerArray[0].carToPassengerDuration + requestedTrip.duration) * 1000,
		tripEndLat: dlat,
		tripEndLng: dlng,
		tripDistance: requestedTrip.distance,
		chargeAfterTrip: getCarChargeAfterTravel(car, distance)
	};
	localBookingsArray.push(bookingObject);
	console.log("Local bookings: ", localBookingsArray);

	var duration = (bookingObject.tripEndTime - Date.now()) / 1000;
	console.log("QWERTY", duration);

	setTimeout(async function () {
		await updateCarCoords(car.vehicleID, 48.1374796958508, 11.412401703683802).then((data) => {
			updateCarPosition(data);
			// findParkingSpot(car.vehicleID);
		});

	}, duration);

}

/* DEBUG/TEST FUNCTIONS */

async function endAllActiveBookings() {
	console.log("Ending all VEHICLE_ASSIGNED bookings thus making the cars FREE again (YEY FOR INDEPENDENCE).");
	for (const booking of bookings) {
		if (booking.status === "VEHICLE_ASSIGNED") {
			// console.log("Vehicle assigned booking: ", booking);

			await startTrip(booking.bookingID);
			await endTrip(booking.bookingID);
		}
	}
	localBookingsArray = [];
}
