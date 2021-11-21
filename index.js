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
