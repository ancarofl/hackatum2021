// class Car {
//   constructor(lat, long) {
//     this.lat = lat;
//     this.long = long;
//   }
// }

// async function getCar2(carID) {
// 	return fetch("https://us-central1-sixt-hackatum-2021.cloudfunctions.net/api/vehicles/" + carID)
// 		.then((response) => response.json())
// 		.then((data) => {
// 			console.log("Car: ", data);
// 			return JSON.parse(JSON.stringify(data));
// 		});
// }

// TODO: use getCar from apis/sixtApi.js
async function findParkingSpot(carIDreal)
{
	// get car data from API using carID
	// let car = new Car(lat, long);
	var carID = "znNi2b9aAn0YMxFeEqC8";
	const car = await getCar(carID); // command waits until completion

	let cars = [];
	cars.push(car);
	// TODO: remove me
	generateCars(cars);

	// 1. first we need to check for the closest charging Station
	console.log("car.charge: ", car.charge);
	console.log("car.lng: ", car.lng);
	console.log("car.lat: ", car.lat);

	// if battery is less than 20 we have to look for a charging station
	const chargingStationsInfo = await getChargingStationInfos(car);
	if (car.charge <= SAFETY_BATTERY_PERCENTAGE) {
		console.log("Battery low. Car: ", carID, " will go ", chargingStationsInfo[0].distance / 1000.0, " km to charging station at (",
					chargingStationsInfo[0].lat, ", ", chargingStationsInfo[0].long, ") ");
		return;
	}

	// 2. then if the battery is more than enough (20%, which corresponds to 60km, we look for the taxi parking)
	if (car.charge >= UPPER_SAFETY_BATTERY_PERCENTAGE) {
		console.log("look for free or sixt parking");
		// TODO: take again proximity to either free parking or sixt parking;
		return;
	}

	// compute score to find best parking among free parkings, Sixt parkings or Charging Stations and go to parking based on score
	await computeParkingPoIScore();
	let parkings = [...parkings_TEST ];
	let arr = [];
	for (parking of parkings) {
		var res = await getTravelDistanceAndDuration(car.lat, car.lng, parking.lat, parking.lng);
		distance = res.distance;

		// console.log("distance: ", distance);
		// console.log("SCORE_a * (500000/distance): ", SCORE_a * (500000.0/distance));
		// console.log("SCORE_b * parking.type: ", SCORE_b * parking.type);
		// console.log("SCORE_c * parking.proximityToPoI / (distance/1000) * 15:", SCORE_c * parking.proximityToPoI / (distance/10000)) *
		// 15;

		const score =
					SCORE_a * (1800000.0 / distance) + SCORE_b * parking.type + SCORE_c * parking.proximityToPoI / (distance / 10000) * 15;
		// console.log("parking id:", parking.ID, "score: ", score);

		arr.push({parking : parking, score : score});
	}
	const closest = arr.reduce((acc, loc) => acc.score > loc.score ? acc : loc);
	// console.log("car: ", carID, "chooses parking place: ", closest.parking.ID);

	await updateCarCoords(car.vehicleID, closest.parking.lat, closest.parking.lng).then((data) => { updateCarPosition(data); });
}

async function resetPositionForTest()
{
	await updateCarCoords("znNi2b9aAn0YMxFeEqC8", 48.11482515837076, 11.58003360789794).then((data) => {
		updateCarPosition(data);
	});
}

async function computeParkingPoIScore(/* parkings, pointsOfInterest */)
{
	// let parkings = [...freeParkings, ...sixtParkings, ...chargingStations];
	let parkings = [...parkings_TEST ];
	let pointsOfInterest = [...pointsOfInterest_TEST ];

	for (parking of parkings) {
		parking.proximityToPoI = 0;
		for (pointOfInterest of pointsOfInterest) {
			// console.log("parking.lat: ", parking.lat);
			// console.log("parking.lng: ", parking.lng);
			// console.log("pointOfInterest.lat: ", pointOfInterest.lat);
			// console.log("pointOfInterest.lng: ", pointOfInterest.lng);
			const res = await getTravelDistanceAndDuration(parking.lat, parking.lng, pointOfInterest.lat, pointOfInterest.lng);
			// console.log("Trip info: ", data);
			// console.log("res.distance: ", res.distance);
			// console.log("pointOfInterest.bookings.length: ", pointOfInterest.bookings.length);
			parking.proximityToPoI += pointOfInterest.bookings.length * 5000 / res.distance;
		}

		// console.log("parking.ID: ", parking.ID, "; parking.proximityToPoI: ", parking.proximityToPoI);
	}
}

async function getChargingStationInfos(car)
{
	let chargingStationsInfo = [];

	// must look for charging station; Pick the closest one by distance;
	for (chargingStation of chargingStations) {
		var keys = Object.keys(chargingStation);
		console.log(keys);

		console.log(chargingStation.proximityToPoI);
		// console.log("chargingStation.position.lat(): ", chargingStation.position.lat());
		// console.log("chargingStation.position.lng(): ", chargingStation.position.lng());

		const res = await getTravelDistanceAndDuration(car.lat, car.lng, chargingStation.position.lat(), chargingStation.position.lng());

		// console.log("carToChargingStationDistance: ", res.distance);
		// console.log("carToChargingStationDuration: ", res.duration);

		const info = {
			distance : res.distance,
			time : res.duration,
			lat : chargingStation.position.lat(),
			long : chargingStation.position.lng(),
		};

		console.log("info: ", info);
		chargingStationsInfo.push(info);
	}
	chargingStationsInfo.sort((a, b) => (a.distance > b.distance ? 1 : -1));
	return chargingStationsInfo;
}
