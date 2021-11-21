let pointsOfInterest = [];
let pointsOfInterestMarkers = [];
var cityCentreID;
var airportID;
function generatePointsOfInterest(noOfPointsOfInterest)
{
	const infoWindow = new google.maps.InfoWindow();

	const airportMarker = new google.maps.Marker({
		position : {lat : MUNICH_AIRPORT_LAT, lng : MUNICH_AIRPORT_LNG},
		map,
		label : {
			text : "\uea52",
			fontFamily : "Material Icons",
			color : "#ffffff",
			fontSize : "18px",
		},
		title : `Airport`,
		ID : markers.length
	});
	airportMarker.addListener("click", () => {
		infoWindow.close();
		infoWindow.setContent(airportMarker.getTitle());
		infoWindow.open(airportMarker.getMap(), marker);
	});
	markers.push(airportMarker);
	pointsOfInterestMarkers.push(airportMarker);
	airportID = airportMarker.ID;
	pointsOfInterest.push({lat : airportMarker.position.lat(), lng : airportMarker.position.lng(), ID: airportMarker.ID, bookings: []});

	const cityCentreMarker = new google.maps.Marker({
		position : {lat : MUNICH_CENTRE_LAT, lng : MUNICH_CENTRE_LNG},
		map,
		label : {
			text : "\uea52",
			fontFamily : "Material Icons",
			color : "#ffffff",
			fontSize : "18px",
		},
		title : `City Centre`,
		ID : markers.length
	});
	cityCentreMarker.addListener("click", () => {
		infoWindow.close();
		infoWindow.setContent(cityCentreMarker.getTitle());
		infoWindow.open(cityCentreMarker.getMap(), marker);
	});
	markers.push(cityCentreMarker);
	cityCentreID = cityCentreMarker.ID;
	pointsOfInterestMarkers.push(cityCentreMarker);

	pointsOfInterest.push({lat : cityCentreMarker.position.lat(), lng : cityCentreMarker.position.lng(), ID: cityCentreMarker.ID, bookings: []});

	for (let i = 0; i < noOfPointsOfInterest; i++) {
		const marker = new google.maps.Marker({
			position : getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, RADIUS),
			map,
			label : {
				text : "\uea52",
				fontFamily : "Material Icons",
				color : "#ffffff",
				fontSize : "18px",
			},
			title : `Point of Interest No. ${i + 1}`,
			ID : markers.length
		});
		marker.addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(marker.getTitle());
			infoWindow.open(marker.getMap(), marker);
		});
		markers.push(marker);
		pointsOfInterestMarkers.push(marker);

		pointsOfInterest.push({lat : marker.position.lat(), lng : marker.position.lng(), ID: marker.ID, bookings: []});
		console.log("pointsOfInterest: ", pointsOfInterest);
	}
}