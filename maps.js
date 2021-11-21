let map;

function degrees_to_radians(degrees)
{
	var pi = Math.PI;
	return degrees * (pi / 180);
}

function getLocation(x0, y0, radius)
{
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

	foundLatitude = new_x + x0;
	foundLongitude = y + y0;
	// console.log("Longitude: " + foundLongitude + " Latitude: " + foundLatitude);
	return {lat : foundLatitude, lng : foundLongitude};
}

let markers = [];
let chargingStations = [];
let chargingStationsMarkers = [];
function generateChargingStations(numChargingStations)
{
	const infoWindow = new google.maps.InfoWindow();

	for (let i = 0; i < numChargingStations; i++) {
		const marker = new google.maps.Marker({
			position : getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS),
			map,
			label : {
				text : "\ue56d",
				fontFamily : "Material Icons",
				color : "#ffffff",
				fontSize : "18px",
			},
			title : `Charging Station No. ${i + 1}`,
			ID : markers.length
		});
		marker.addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(marker.getTitle());
			infoWindow.open(marker.getMap(), marker);
		});
		markers.push(marker);
		chargingStationsMarkers.push(marker);

		chargingStations.push({lat : marker.position.lat(), lng : marker.position.lng(), proximityToPoI : 0, ID : marker.ID});
	}
}

let sixtParkings = [];
let sixtParkingsMarkers = [];
function generateSixtParkingLocations(numSixtLocations)
{
	const infoWindow = new google.maps.InfoWindow();

	for (let i = 0; i < numSixtLocations; i++) {
		const marker = new google.maps.Marker({
			position : getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS),
			map,
			label : "Sixt",
			title : `Sixt Loc No. ${i + 1}`,
			ID : markers.length
		});
		marker.addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(marker.getTitle());
			infoWindow.open(marker.getMap(), marker);
		});
		markers.push(marker);
		sixtParkingsMarkers.push(marker);

		sixtParkings.push({lat : marker.position.lat(), lng : marker.position.lng(), proximityToPoI : 0, ID : marker.ID});
	}
}

carsOnMap = [];
function generateCars(cars)
{
	const infoWindow = new google.maps.InfoWindow();

	for (let i = 0; i < cars.length; i++) {
		const marker = new google.maps.Marker({
			position : getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS),
			map,
			label : {
				text : "\ue62c",
				fontFamily : "Material Icons",
				color : "#ffffff",
				fontSize : "18px",
			},
			title : `Car No. ${i + 1}`,
			ID : markers.length
		});
		marker.addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(marker.getTitle());
			infoWindow.open(marker.getMap(), marker);
		});
		markers.push(marker);

		carsOnMap.push({lat : marker.position.lat(), lng : marker.position.lng(), ID : marker.ID});
	}
	return carsOnMap;
}

let freeParkings = [];
let freeParkingsMarkers = [];
function generateFreeParkings(noOfFreeParkings)
{
	const infoWindow = new google.maps.InfoWindow();

	for (let i = 0; i < noOfFreeParkings; i++) {
		const marker = new google.maps.Marker({
			position : getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS),
			map,
			label : {
				text : "\ue54f",
				fontFamily : "Material Icons",
				color : "#ffffff",
				fontSize : "18px",
			},
			title : `Free Parking No. ${i + 1}`,
			ID : markers.length
		});
		marker.addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(marker.getTitle());
			infoWindow.open(marker.getMap(), marker);
		});
		markers.push(marker);
		freeParkingsMarkers.push(marker);

		freeParkings.push({lat : marker.position.lat(), lng : marker.position.lng(), proximityToPoI : 0, ID : marker.ID});
	}
}

function changeMarkerPosition(marker)
{
	var latlng = new google.maps.LatLng(40.748774, -73.985763);
	marker.setPosition(latlng);
}

function updateCarPosition(car)
{
	var latlng = new google.maps.LatLng(40.748774, -73.985763);
	marker.setPosition(latlng);
}


function initMap()
{
	map = new google.maps.Map(document.getElementById("map"), {
		center : {lat : MUNICH_CENTRE_LAT, lng : MUNICH_CENTRE_LNG},
		zoom : 11,
	});

	let numSixtLocations = 2;
	let numChargingStations = 3;
	let noOfCars = 3;
	let noOfFreeParkings = 1;
	let noOfPointsOfInterest = 1;

	// var numSixtLocations = document.getElementById('numSixtLocations').value;
	// var numChargingStations = document.getElementById('numChargingStations').value;
	// var noOfCars = document.getElementById('noOfCars').value;

	generateChargingStations(numChargingStations);
	generateSixtParkingLocations(numSixtLocations);
	generateCars(noOfCars);
	generateFreeParkings(noOfFreeParkings);

	// TODO: generate orders in a point of interest; the more orders we get in the PoI, the more we increase it's score;
	generatePointsOfInterest(noOfPointsOfInterest);
}
