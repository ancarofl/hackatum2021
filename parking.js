async function updateCarChargeLevel(carID)
{
	const car = await getCar(carID); // command waits until completion
	if (car.status === "SERVICE_BLOCK") {
		if (car.charge === 100) {
			await setServiceUnBlockingState(car.vehicleID);
			return;
		}

		await changeChargeLevel(car.vehicleID, car.charge + 5);
		console.log("Car charging... Level: ", car.charge);
	} else {
		return;
	}

	setTimeout(async function() { updateCarChargeLevel(carID); }, 5000);
}

async function findParkingSpot(carID)
{
	// get car data from API using carID
	// let car = new Car(lat, long);
	// var carID = "znNi2b9aAn0YMxFeEqC8";
	const car = await getCar(carID); // command waits until completion

	// let cars = [];
	// cars.push(car);
	// // TODO: remove me
	// generateCars(cars);

	// console.log("car.charge: ", car.charge);
	// console.log("car.lng: ", car.lng);
	// console.log("car.lat: ", car.lat);

	// if battery is less than 20 we have to look for a charging station
	const chargingStationsInfo = await getChargingStationInfos(car);
	if (car.charge <= SAFETY_BATTERY_PERCENTAGE) {
		console.log("Battery low. Car: ", carID, " will go ", chargingStationsInfo[0].distance / 1000.0, " km to charging station at (",
					chargingStationsInfo[0].lat, ", ", chargingStationsInfo[0].lng, ") ");

		setTimeout(async function() {
			await updateCarCoords(car.vehicleID, chargingStationsInfo[0].lat, chargingStationsInfo[0].lng).then((data) => { updateCarPosition(data); });
			await changeChargeLevel(car.vehicleID, car.charge - (chargingStationsInfo[0].distance / 3000));
			await setServiceBlockingState(car.vehicleID);
		}, chargingStationsInfo[0].duration);

		setTimeout(async function(){
			updateCarChargeLevel(carID);
		}, 5000);

		return;
	}

	// if the battery is more than enough (20%, which corresponds to 60km, we look for the taxi parking)
	if (car.charge >= UPPER_SAFETY_BATTERY_PERCENTAGE) {
		console.log("Battery more than enough.Looking for free or sixt parking...");
		let freeAndSixtParkings = [...freeParkings, ...sixtParkings];
		// let freeAndSixtParkings_TEST = [...parkings_TEST ];
		let freeAndSixtParkingsRes = [];
		for (parking of freeAndSixtParkings) {
			var res = await getTravelDistanceAndDuration(car.lat, car.lng, parking.lat, parking.lng);
			// distance = res.distance;
			// duration = res.duration;

			// console.log("res.distance: ", res.distance);
			// console.log("res.duration: ", res.duration);

	
			// console.log("distance: ", distance);
			// console.log("SCORE_a * (500000/distance): ", SCORE_a * (500000.0/distance));
			// console.log("SCORE_b * parking.type: ", SCORE_b * parking.type);
			// console.log("SCORE_c * parking.proximityToPoI / (distance/1000) * 15:", SCORE_c * parking.proximityToPoI / (distance/10000)) *
			// 15;
	
			freeAndSixtParkingsRes.push({parking : parking, distance : res.distance, duration: res.duration});
		}
		const closest = freeAndSixtParkingsRes.reduce((acc, loc) => acc.distance < loc.distance ? acc : loc);

		distanceTravelledEmpty += closest.distance;
		timeTravelledEmpty += closest.duration;

		setTimeout(async function() {
			await updateCarCoords(car.vehicleID, closest.parking.lat, closest.parking.lng).then((data) => { updateCarPosition(data); });
			await changeChargeLevel(car.vehicleID, car.charge - (closest.distance / 3000));

		}, closest.duration);
		return;
	}

	// compute score to find best parking among free parkings, Sixt parkings or Charging Stations and go to parking based on score
	await computeParkingPoIScore();
	// let testParkings = [...parkings_TEST ];
	let allParkings = [...freeParkings, ...sixtParkings, ...chargingStations];
	let arr = [];
	for (parking of allParkings) {
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

		arr.push({parking : parking, score : score, distance : res.distance, duration: res.duration});
	}
	const closest = arr.reduce((acc, loc) => acc.score > loc.score ? acc : loc);
	// console.log("car: ", carID, "chooses parking place: ", closest.parking.ID);

	distanceTravelledEmpty += closest.distance;
	timeTravelledEmpty += closest.duration;

	setTimeout(async function() {
		await updateCarCoords(car.vehicleID, closest.parking.lat, closest.parking.lng).then((data) => { updateCarPosition(data); });
		await changeChargeLevel(car.vehicleID, car.charge - (closest.distance / 3000));
		//! we don't need this here as we can leave, as battery is not critical
		// await setServiceBlockingState(car.vehicleID); 
	}, closest.duration);
}

async function resetPositionForTest()
{
	await updateCarCoords("znNi2b9aAn0YMxFeEqC8", 48.11482515837076, 11.58003360789794).then((data) => {
		updateCarPosition(data);
	});
}

async function resetToMaximumChargeForTest() { await changeChargeLevel("znNi2b9aAn0YMxFeEqC8", 95); }
async function resetToMinimumChargeForTest() { await changeChargeLevel("znNi2b9aAn0YMxFeEqC8", 5); }
async function resetToMediumChargeForTest() { await changeChargeLevel("znNi2b9aAn0YMxFeEqC8", 50); }

async function computeParkingPoIScore(/* parkings, pointsOfInterest */)
{
	let parkings = [...freeParkings, ...sixtParkings, ...chargingStations];
	// let parkings = [...parkings_TEST ];
	// let pointsOfInterest = [...pointsOfInterest_TEST ];

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
		// var keys = Object.keys(chargingStation);
		// console.log(keys);
		// console.log(chargingStation.proximityToPoI);

		// console.log("car.lng: ", car.lng);
		// console.log("car.lat: ", car.lat);

		const res = await getTravelDistanceAndDuration(car.lat, car.lng, chargingStation.lat, chargingStation.lng);

		// console.log("carToChargingStationDistance: ", res.distance);
		// console.log("carToChargingStationDuration: ", res.duration);

		const info = {
			distance : res.distance,
			duration : res.duration,
			lat : chargingStation.lat,
			lng : chargingStation.lng,
		};

		// console.log("info: ", info);
		chargingStationsInfo.push(info);
	}
	chargingStationsInfo.sort((a, b) => (a.distance > b.distance ? 1 : -1));
	return chargingStationsInfo;
}
