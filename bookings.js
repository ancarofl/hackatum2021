class Bookings
{
	constructor()
	{
		this.BookingsList = [];
		this.onBookingAdded = [];
		this.onBookingsChanged = [];
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
let bookingsList = new Bookings();

function generateCityCentreBooking()
{
	pos = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, 1000)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

function generateAirportBooking()
{
	pos = getLocation(MUNICH_AIRPORT_LAT, MUNICH_AIRPORT_LNG, 1000)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

function generateBookingCloseToPointOfInterest(pointOfInterest)
{
	pos = getLocation(pointOfInterest.lat, pointOfInterest.lng, 500)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

function generateRandomBooking()
{
	pos = getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS)
	var bookingObject = {lat : pos.lat, lng : pos.lng, timestamp : Date.now()};

	bookingsList.addBooking(bookingObject);
}

function checkProximityOfBooking(oLat, oLng, bLat, bLng, radius)
{
	return Math.acos(Math.sin(bLat * 0.0175) * Math.sin(oLat * 0.0175) +
					 Math.cos(bLat * 0.0175) * Math.cos(oLat * 0.0175) * Math.cos((oLng * 0.0175) - (bLng * 0.0175))) *
					   6371000 <=
		   radius;
}

function checkProximityOfBookingToCityCentre(newBooking)
{
	if (checkProximityOfBooking(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, newBooking.lat, newBooking.lng, 1000)) {
		console.log("booking close to city centre");
	}
}

function checkProximityOfBookingToAirport(newBooking)
{
	if (checkProximityOfBooking(MUNICH_AIRPORT_LAT, MUNICH_AIRPORT_LNG, newBooking.lat, newBooking.lng, 1000)) {
		console.log("booking close to airport");
	}
}

function checkProximityOfBookingToOtherPointsOfInterest(newBooking)
{
	for(pointOfInterest of pointsOfInterest){
		if (checkProximityOfBooking(pointOfInterest.lat, pointOfInterest.lng, newBooking.lat, newBooking.lng, 1000)) {
			console.log("booking close to ", pointOfInterest.ID);
			pointOfInterest.bookings.push(newBooking);
		}
	}
}

bookingsList.onBookingAdded.push((newBooking) => checkProximityOfBookingToCityCentre(newBooking));
bookingsList.onBookingAdded.push((newBooking) => checkProximityOfBookingToAirport(newBooking));
bookingsList.onBookingAdded.push((newBooking) => checkProximityOfBookingToOtherPointsOfInterest(newBooking));

//! add this only if you need to get info about added bookings
// bookingsList.onBookingsChanged.push((newBookingsList) => console.log("New Bookings List: ", newBookingsList));
