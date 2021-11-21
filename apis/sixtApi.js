/* Sixt api (https://github.com/Sixt/hackatum2021) endpoints. Car is used instead of vehicle in our function cuz it's quicker to type and we are only dealing with cars (for now 🙃) */

const baseUrl = "https://us-central1-sixt-hackatum-2021.cloudfunctions.net/api/"; // general
const baseUrl1 = "https://us-central1-sixt-hackatum-2021-orange.cloudfunctions.net/api/"; // ours

async function getCars() {
	var result = null;

	await fetch(baseUrl1 + "vehicles")
		.then((response) => response.json())
		.then((data) => {
			result = data;
		});

	return result;
}

async function getCar(id) {
	var result = null;

	await fetch(baseUrl1 + "vehicles/" + id)
		.then((response) => response.json())
		.then((data) => {
			// console.log("getCar response:", data);
			result = data;
		});

	return result;
}

async function getBookings() {
	var result = null;

	await fetch(baseUrl1 + "bookings")
		.then((response) => response.json())
		.then((data) => {
			result = data;
		});

	return result;
}

async function createBooking(olat, olng, dlat, dlng) {
	const booking = {
		"pickupLat": olat,
		"pickupLng": olng,
		"destinationLat": dlat,
		"destinationLng": dlng
	}

	var result = null;

	await fetch(baseUrl1 + "bookings", {
		method: "POST",
		body: JSON.stringify(booking),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("createBooking response: ", data);
			result = data.bookingID;
		});

	return result;
}

async function assignCarToBooking(bookingId, vehicleId) {
	await fetch(baseUrl1 + "bookings/" + bookingId + "/assignVehicle/" + vehicleId, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("assignCarToBooking response: ", data);
		});
}

async function startTrip(bookingId) {
	await fetch(baseUrl1 + "bookings/" + bookingId + "/passengerGotOn", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("startTrip response: ", data);
		});
}

async function endTrip(bookingId) {
	await fetch(baseUrl1 + "bookings/" + bookingId + "/passengerGotOff", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("startTrip response: ", data);
		});
}
