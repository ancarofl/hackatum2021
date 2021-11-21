/* 2.1.5 */
function isBatteryEnoughForDistance(car, travelDistance) {
	maxDistanceWithCurrentCharge = (car.charge * FULL_CHARGE_TRAVEL_DISTANCE) / 100;
	return travelDistance < maxDistanceWithCurrentCharge;
}

// Assumes linear car battery usage.
function getCarChargeAfterTravel(car, travelDistance) {
	var chargeSpent = (travelDistance * 100) / FULL_CHARGE_TRAVEL_DISTANCE;
	return car.charge - chargeSpent;
}