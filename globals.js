var timeTravelledEmpty = 0;
var distanceTravelledEmpty = 0;
var timeIdleCharging = 0;

function showMetrics()
{
	console.log("Time wasted/travelled empty: ", timeTravelledEmpty / 60.0, " min");
	console.log("Distance travelled empty: ", distanceTravelledEmpty / 1000.0, " km");
	console.log("Time spent charging: ", timeIdleCharging / 60.0, " min");
}