// SIM LOCAL OBJECTS
var bookingsList = new Bookings();
bookingsList.onBookingAdded.push((newBooking) => checkProximityOfBookingToOtherPointsOfInterest(newBooking));
bookingsList.onBookingsChanged.push((newBookingsList) => console.log("New bookings list: ", newBookingsList));

var cars = null;
var bookings = null;

var timesToPassengerArray = [];
var localBookingsArray = [];

async function startSimulation() {
	/*let carNumber = null;
	carNumber = document.getElementById("car_number").value;*/

	let bookingNumber = null;
	bookingNumber = document.getElementById("booking_number").value;

	// "Validation"
	/*if (!carNumber) {
		text = "A car number is required to run the simulation.";
		document.getElementById("car_number_error").innerHTML = text;

		return;
	} else if (carNumber < MIN_CARS || carNumber > MAX_CARS) {
		text = "The car number must be between " + MIN_CARS + " and " + MAX_CARS + ".";
		document.getElementById("car_number_error").innerHTML = text;

		return;
	} else {
		text = "";
		document.getElementById("car_number_error").innerHTML = text;
	}*/

	if (!bookingNumber) {
		text = "A booking number is required to run the simulation.";
		document.getElementById("booking_number_error").innerHTML = text;

		return;
	} else if (bookingNumber < MIN_BOOKINGS || bookingNumber > MAX_BOOKINGS) {
		text = "The booking number must be between " + MIN_BOOKINGS + " and " + MAX_BOOKINGS + ".";
		document.getElementById("booking_number_error").innerHTML = text;
		return;
	} else {
		text = "";
		document.getElementById("booking_number_error").innerHTML = text;
	}

	//console.log("Starting sim with " + carNumber + " cars and " + bookingNumber + " bookings.");
	console.log("Starting sim with " + bookingNumber + " bookings.");

	// cars = await getCars();
	cars = await getCarsFromTo(10, 17);
	generateCars(cars);

	for (var i = 0; i < bookingNumber; i++) {
		generateRealRandomBooking();
	}

	for (const b of bookingsList.BookingsList) {
		assignLowestPassengerWaitTimeCar(b.olat, b.olng, b.dlat, b.dlng);
	}
}



async function assignLowestPassengerWaitTimeCar(olat, olng, dlat, dlng) {
	cars = await getCarsFromTo(10, 17);
	// console.log("Cars: ", cars);

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

	for (const car of cars) {
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
			// console.log("SERVICE BLOCK NOT IMPLEMENTED YET.");

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
	}

	if (timesToPassengerArray.length > 0) {
		/* 3 */
		timesToPassengerArray.sort((a, b) =>
			a.carToPassengerDuration > b.carToPassengerDuration ? 1 : -1
		);

		/* 4 + 5*/
		var carId = timesToPassengerArray[0].vehicleID;

		var car = await getCar(carId);

		if(car.status === "SERVICE_BLOCK"){
			await setServiceUnBlockingState(car.vehicleID);
		}

		console.log("Times to passenger array ", timesToPassengerArray);

		timeTravelledEmpty += timesToPassengerArray[0].emptyTime;
		distanceTravelledEmpty += timesToPassengerArray[0].emptyDist;

		createLocalAndDBBooking(requestedTrip, car, (carToPassengerTrip.distance + requestedTrip.distance), olat, olng, dlat, dlng);
		console.log("Assignment done. Car ", carId, " will arrive to the passenger in ", timesToPassengerArray[0].carToPassengerDuration, " seconds aka ", timesToPassengerArray[0].carToPassengerDuration / 60, " minutes, then the trip from TUM to the airport will take ", requestedTrip.duration / 60, " minutes!!!");
	} else {
		console.log("Oh no no no, no cars available.");
	}
}

async function createLocalAndDBBooking(requestedTrip, car, distance, olat, olng, dlat, dlng) {
	console.log("Booking car " + car.vehicleID + ".");

	var bookingId = await createBooking(olat, olng, dlat, dlng);
	// console.log("Test:", bookingId);
	await assignCarToBooking(bookingId, car.vehicleID);

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

	var requestedJourneyDuration = (bookingObject.tripEndTime - Date.now()) / TIME_DIVIDER;
	var timeFromNowTillstart = (bookingObject.tripStartTime - Date.now()) / TIME_DIVIDER;

	// After the time between now and tripStartTime has elapsed, assume the onboarding was super efficient and the passenger got on.

	console.log("ANCANCANCA", timeFromNowTillstart);
	setTimeout(async function () {
		await startTrip(bookingObject.id);

	}, timeFromNowTillstart);

	// After the time between now and tripStartTime has elapsed, assume everything was super smooth, add trip calculated duration, and end trip + update car coords;
	setTimeout(async function () {
		await endTrip(bookingObject.id);
		await updateCarCoords(car.vehicleID, dlat, dlng);
		var updatedCar = await getCar(car.vehicleID);

		console.log("Hey bro ", updatedCar);

		updateCarPosition(updatedCar);

		await findParkingSpot(car.vehicleID);
		await changeChargeLevel(car.vehicleID, car.charge - (bookingObject.tripDistance / 3));

	}, (timeFromNowTillstart + requestedJourneyDuration));

}

/* DEBUG/TEST FUNCTIONS */
async function consoleLogCars() {
	cars = await getCars()
	console.log("Cars: ", cars);
}

async function consoleLogCar() {
	var carId = document.getElementById("car_id").value;
	if (!carId) return;

	var car = await getCar(carId);
	console.log("Car: ", car);
}

async function endAllActiveBookings() {
	console.log("Ending all VEHICLE_ASSIGNED bookings thus making the cars FREE again (YEY FOR INDEPENDENCE).");

	bookings = await getBookings();
	for (const booking of bookings) {
		if (booking.status === "VEHICLE_ASSIGNED") {
			// console.log("Vehicle assigned booking: ", booking);

			await startTrip(booking.bookingID);
			await endTrip(booking.bookingID);
		}
	}
	localBookingsArray = [];
}
