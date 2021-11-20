// const { time } = require("console");

// class Car {
//   constructor(lat, long) {
//     this.lat = lat;
//     this.long = long;
//   }
// }

async function getCar(carID) {
	return fetch("https://us-central1-sixt-hackatum-2021.cloudfunctions.net/api/vehicles/" + carID)
		.then((response) => response.json())
		.then((data) => {
			console.log("Car: ", data);
			return JSON.parse(JSON.stringify(data));
		});
}

async function findParkingSpot() {
	// get car data from API using carID
	// let car = new Car(lat, long);
	var carID = "77ADiv9eITdsFPv2VnF9";

	//   var car = null;

	const car = await this.getCar(carID); // command waits until completion

	//   let carToChargingStationDistances = [];
	//   let carToChargingStationDurations = [];

	let chargingStationsInfo = [];

	// 1. first we need to check for the closest charging Station
	console.log(car.charge);
	console.log(car.lng);
	console.log(car.lat);

	// 1. first we need to check for the closest charging Station
	if (car.charge <= SAFETY_BATTERY_PERCENTAGE) {
		// must look for charging station; Pick the closest one by distance;
		for (chargingStation of chargingStations) {
			// var keys = Object.keys(chargingStation);
			// console.log(keys);
			console.log("chargingStation.position.lat(): ", chargingStation.position.lat());
			console.log("chargingStation.position.lng(): ", chargingStation.position.lng());

			const res = await getTripDistanceAndTime(car.lat, car.lng, chargingStation.position.lat(), chargingStation.position.lng());

			console.log("carToChargingStationDistance: ", res.distance);
			console.log("carToChargingStationDuration: ", res.duration);

			const info = {
				distance: res.distance,
				time: res.duration,
				lat: chargingStation.position.lat(),
				long: chargingStation.position.lng(),
			};

			console.log("info: ", info);

			chargingStationsInfo.push(info);
		}
		chargingStationsInfo.sort((a, b) => (a.distance > b.distance ? 1 : -1));

		console.log("Battery low. Car: ", carID, " will go ", chargingStationsInfo[0].distance / 1000.0, " km to charging station at (",
			chargingStationsInfo[0].lat, ", ", chargingStationsInfo[0].long, ") ");
	}

	// 2. then if the battery is more than enough (20%, which corresponds to 60km, we look for the taxi parking)

	// 3. free parking (maybe Rewe, Lidl etc.)

	// 4. nearest Sixt parking

	for (sixtParking of sixtParkings) { }

	// 5. road side while trying to go to 3,4

	/**
	 * if battery is less than 20 we have to look for a charging station
	 */
}

async function getChargingStationInfos() {
	let chargingStationsInfo = [];

	// must look for charging station; Pick the closest one by distance;
	for (chargingStation of chargingStations) {
		// var keys = Object.keys(chargingStation);
		// console.log(keys);
		// console.log("chargingStation.position.lat(): ", chargingStation.position.lat());
		// console.log("chargingStation.position.lng(): ", chargingStation.position.lng());

		const res = await getTripDistanceAndTime(car.lat, car.lng, chargingStation.position.lat(), chargingStation.position.lng());

		// console.log("carToChargingStationDistance: ", res.distance);
		// console.log("carToChargingStationDuration: ", res.duration);

		const info = {
			distance: res.distance,
			time: res.duration,
			lat: chargingStation.position.lat(),
			long: chargingStation.position.lng(),
		};

		console.log("info: ", info);

		chargingStationsInfo.push(info);
	}
}

async function getTripDistanceAndTime(carLat, carLong, csLat, csLong) {
	var result = null;

	console.log("carLat: ", carLat);
	console.log("carLong: ", carLong);
	console.log("csLat: ", csLat);
	console.log("csLong: ", csLong);

	await fetch("https://router.hereapi.com/v8/routes?transportMode=car&origin=" + carLat + "," + carLong + "&destination=" + csLat +
		"," + csLong + "&return=summary&apiKey=" + HERE_API_KEY)
		.then((response) => response.json())
		.then((data) => {
			console.log("Car to charging station trip response: ", data);
			result = {
				duration: data.routes[0].sections[0].summary.duration,
				distance: data.routes[0].sections[0].summary.length,
			};
		});

	return result;
}
