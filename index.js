


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
