class Bookings
{
	constructor()
	{
		this.BookingsList = [];
		this.onBookingAdded = [];
		this.onBookingsChanged = [];
		setTimeout(removeOldBookingsFromPoI, 5000);
	}

	addBooking(newBooking)
	{
		this.BookingsList.push(newBooking);
		this.bookingAdded(newBooking);
		this.bookingsChanged(this.BookingsList);
	}

	bookingAdded(newBooking) { this.onBookingAdded.forEach(f => f(newBooking)); }
	bookingsChanged(BookingsList) { this.onBookingsChanged.forEach(f => f(BookingsList)); }
}

function generateCityCentreBooking()
{
	pos = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, 1000)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

async function generateRealCityCentreBooking()
{
	pos = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, 1000)
	pos2 = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS);
	var bookingObject = {olat : pos.lat, olng : pos.lng, dlat : pos2.lat, dlng : pos2.lng, timestamp : Date.now()};

	// bookingsList.addBooking(bookingObject);
	await assignLowestPassengerWaitTimeCar(bookingObject.olat, bookingObject.olng, bookingObject.dlat, bookingObject.dlng);
}

function generateAirportBooking()
{
	pos = getLocation(MUNICH_AIRPORT_LAT, MUNICH_AIRPORT_LNG, 1000)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

async function generateRealAirportBooking()
{
	pos = getLocation(MUNICH_AIRPORT_LAT, MUNICH_AIRPORT_LNG, 1000)
	pos2 = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS);
	var bookingObject = {olat : pos.lat, olng : pos.lng, dlat : pos2.lat, dlng : pos2.lng, timestamp : Date.now()};

	// bookingsList.addBooking(bookingObject);
	await assignLowestPassengerWaitTimeCar(bookingObject.olat, bookingObject.olng, bookingObject.dlat, bookingObject.dlng);
}

function generateBookingCloseToPointOfInterest(pointOfInterest)
{
	pos = getLocation(pointOfInterest.lat, pointOfInterest.lng, 500)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

async function generateRealBookingCloseToPointOfInterest()
{
	if (pointsOfInterest.length < 1) { return; }

	pos = getLocation(pointsOfInterest[0].lat, pointsOfInterest[0].lng, 500)
	pos2 = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS);
	var bookingObject = {olat : pos.lat, olng : pos.lng, dlat : pos2.lat, dlng : pos2.lng, timestamp : Date.now()};

	// bookingsList.addBooking(bookingObject);
	await assignLowestPassengerWaitTimeCar(bookingObject.olat, bookingObject.olng, bookingObject.dlat, bookingObject.dlng);
}

function generateRandomBooking()
{
	pos = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

function generateRealRandomBooking()
{
	pos = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS);
	pos2 = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS);
	var bookingObject = {olat : pos.lat, olng : pos.lng, dlat : pos2.lat, dlng : pos2.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

function checkProximityOfBooking(oLat, oLng, bLat, bLng, radius)
{
	return Math.acos(Math.sin(bLat * 0.0175) * Math.sin(oLat * 0.0175) +
					 Math.cos(bLat * 0.0175) * Math.cos(oLat * 0.0175) * Math.cos((oLng * 0.0175) - (bLng * 0.0175))) *
					   6371000 <=
		   radius;
}

// For each point of interest bookings older than 1hr have to be removed
function removeOldBookingsFromPoI()
{
	// for (pointOfInterest of pointsOfInterest) { console.log("pointOfInterest.bookings: ", pointOfInterest.bookings); }

	for (pointOfInterest of pointsOfInterest) {
		bookingsToRemove = [];
		for (booking of pointOfInterest.bookings) {
			// console.log("booking.timestamp + 7000: ", booking.timestamp + 7000);
			// console.log("Date.now(): ", Date.now());
			if (booking.timestamp + 3600000 / TIME_DIVIDER < Date.now()) { bookingsToRemove.push(booking); }
		}
		// console.log("bookingsToRemove: ", bookingsToRemove);
		for (bookingToRemove of bookingsToRemove) {
			const index = pointOfInterest.bookings.indexOf(bookingToRemove);
			if (index > -1) { pointOfInterest.bookings.splice(index, 1); }
		}
	}

	setTimeout(removeOldBookingsFromPoI, 5000);
	// for (pointOfInterest of pointsOfInterest) { console.log("pointOfInterest.bookings: ", pointOfInterest.bookings); }
}

function checkProximityOfBookingToOtherPointsOfInterest(newBooking)
{
	console.log("newBooking: ", newBooking);
	for (pointOfInterest of pointsOfInterest) {
		if (checkProximityOfBooking(pointOfInterest.lat, pointOfInterest.lng, newBooking.lat, newBooking.lng, 1000)) {
			if (pointOfInterest.ID == cityCentreID) {
				// console.log("booking close to city centre");
			}
			if (pointOfInterest.ID == airportID) {
				// console.log("booking close to airport");
			}

			// console.log("booking close to ", pointOfInterest.ID);
			pointOfInterest.bookings.push(newBooking);
		}
	}
	// for (pointOfInterest of pointsOfInterest) { console.log("pointOfInterest.bookings: ", pointOfInterest.bookings); }
}
