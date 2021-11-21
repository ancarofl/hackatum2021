/* Sixt api (https://github.com/Sixt/hackatum2021) endpoints. Car is used instead of vehicle in our function cuz it's quicker to type and we are only dealing with cars (for now 🙃) */

const baseUrl = "https://us-central1-sixt-hackatum-2021.cloudfunctions.net/api/"; // general
const baseUrl1 = "https://us-central1-sixt-hackatum-2021-orange.cloudfunctions.net/api/"; // ours

async function getCars() {
	var result = null;

	await fetch(baseUrl1 + "vehicles")
		.then((response) => response.json())
		.then((data) => {
			result = data;

			console.log(Array.isArray(data));
		});

	return result;
}

async function getCarsFromTo(from, to) {
	var result = null;

	await fetch(baseUrl1 + "vehicles")
		.then((response) => response.json())
		.then((data) => {
			result = data;
			result = result.slice(from, to);
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

async function updateCarCoords(id, lat, lng, car) {
	const coords = {
		"lat": lat,
		"lng": lng
	}

	var result = null;

	await fetch(baseUrl1 + "vehicles/" + id + "/coordinates", {
		method: "POST",
		body: JSON.stringify(coords),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("updateCarCoords response: ", data);
			console.log("Coords have been update ...")
			/*result = {
				lat: data.lat,
				lng: data.lng
			};*/
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
			// console.log("endTrip response: ", data);
		});
}

async function changeChargeLevel(carID, chargeLevel) {
	const chargeBody = {
		"charge": chargeLevel
	};

	await fetch(baseUrl1 + "vehicles/" + carID + "/charge", {
		method: "POST",
		body: JSON.stringify(chargeBody),
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("changeChargeLevel response: ", data);
		});
}

async function setServiceBlockingState(carId){
	await fetch(baseUrl1 + "vehicles/" + carID + "/block", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("setServiceBlockingState response: ", data);
		});
}

async function setServiceUnBlockingState(carId){
	await fetch(baseUrl1 + "vehicles/" + carID + "/unblock", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		}
	}).then((response) => response.json())
		.then((data) => {
			// console.log("setServiceUnBlockingState response: ", data);
		});
}

