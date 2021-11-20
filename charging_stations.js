//1. Generate random stations
function getRandomInRange(from, to, fixed) {
	return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
	// .toFixed() returns string, so ' * 1' is a trick to convert to number
}


function degrees_to_radians(degrees) {
	var pi = Math.PI;
	return degrees * (pi / 180);
}

function getLocation(x0, y0, radius) {
	// Random random = new Random();

	// Convert radius from meters to degrees
	radiusInDegrees = radius / 111000.0;

	u = Math.random();
	v = Math.random();
	w = radiusInDegrees * Math.sqrt(u);
	t = 2 * Math.PI * v;
	x = w * Math.cos(t);
	y = w * Math.sin(t);

	// Adjust the x-coordinate for the shrinking of the east-west distances
	new_x = x / Math.cos(degrees_to_radians(y0));

	foundLongitude = new_x + x0;
	foundLatitude = y + y0;
	// System.out.println();
	console.log("Longitude: " + foundLongitude + " Latitude: " + foundLatitude);
}


getLocation(48, 11, 500);
getLocation(48, 11, 50);


/* @Miki: am mutat requestul aici din index.htnl <script>
	// example request: https://router.hereapi.com/v8/routes?transportMode=car&origin=52.5308,13.3847&destination=52.5264,13.3686&return=summary

	const token = `eyJhbGciOiJSUzUxMiIsImN0eSI6IkpXVCIsImlzcyI6IkhFUkUiLCJhaWQiOiJjeDlCTVdCSFlHZnZpeVQyRnRsRiIsImlhdCI6MTYzNzM2MjU4OSwiZXhwIjoxNjM3NDQ4OTg5LCJraWQiOiJqMSJ9.ZXlKaGJHY2lPaUprYVhJaUxDSmxibU1pT2lKQk1qVTJRMEpETFVoVE5URXlJbjAuLm15cHdKdUhZUWtxXzAxOEk2NGEwZ3cuTE5FaXFOYklreEVCNC1aMDNPU1lySktJQlM4SnE4eWNYOTBzVzlLSzZZN25VWm5nc3hDYTliWVl1eGhnUzZFWnhxZlhSTFlWWktPT0o2QnpJU0FVa21sYnhTdzBkMlhzQTZTVWNIYzR1NXcxYXJWaEJyTDBoVV9McU8xMXppZ1JTLU9GTWZYbjVCTHdIWXZsQS1lRzVBLmw0ZXhrSEhQcFU0eU1lVGp3SEtlbVNydnc3TmhzT3ZLS3Vja0lXMmxFT28.RWuqupgiPV8ypJ9rfxz-_VXA6p6egQARJljrDhUYYJfMbn-KBWWQvhR3vmnlhJQ5QyKOcuUBFSyp4X2uYNkLJExPQ9zYop9kso3ynEAxzVwKwisqSls17fbCm4U4wdWWqsZp8AUu41myOCl02X6Pgto-7ReDS35qa8KGbp3IoiZefhEdr1_e83SENnqvvQ8EE4vA9K006b2S8gyFvGHWExQ4gLMbsc-9kXQHxi91pmM4RWT1IrIOqcHvAOy1TZsopm1dpjXvKt6E9zoyC3D-auGvFBEpBry53KSXhDWDqWcUsI4saS_JG1V1e6rknfRFI_TXR_GcwXqkFpKPXYV-7Q`

	function getChargingStations() {
		fetch('https://ev-v2.cit.cc.api.here.com/ev/stations.json?prox=52.516667,13.383333,5000&connectortype=31', {
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + token,
				// 'Accept': 'application/json',
				// 'Content-Type': 'application/json'
			},
		}).then((response) => response.json())
			.then((data) => console.log(data));

*/
