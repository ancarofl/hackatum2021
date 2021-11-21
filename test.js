let parkings_TEST = [];
let pointsOfInterest_TEST = [];
function generateTestMarkers()
{

	parkings_TEST.push({lat : 48.159289546390205, lng: 11.555676460124683, proximityToPoI : 0, ID : 1001, type: 70});
	parkings_TEST.push({lat: 48.35948715826656, lng : 11.786154019133207, proximityToPoI : 0, ID : 1002, type: 50});
	parkings_TEST.push({lat : 48.13712731268249, lng: 11.610436438088461, proximityToPoI : 0, ID : 1003, type: 50});
	parkings_TEST.push({lat : 48.13162932269756, lng: 11.554733638675039, proximityToPoI : 0, ID : 1004, type: 30});
	parkings_TEST.push({lat : 48.11352399233051, lng: 11.47027624198279, proximityToPoI : 0, ID : 1005, type: 70});
	parkings_TEST.push({lat : 48.05088512744211, lng: 11.513622316663211, proximityToPoI : 0, ID : 1006, type: 50});
	

	pointsOfInterest_TEST.push({lat : 48.137154, lng : 11.576124 , ID : 3001, bookings : [ 1, 2, 3, 4, 5 ]});
	pointsOfInterest_TEST.push(
		{lat : 48.348014865807656, lng : 11.786244159138988, ID : 3002, bookings : [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ]});
	pointsOfInterest_TEST.push({lat : 48.06677334969835, lng: 11.430008325871313 , ID : 3003, bookings : [ 1, 2, 3, 4, 5, 6, 7 ]});


	const infoWindow = new google.maps.InfoWindow();

	for (parking of parkings_TEST) {
		const marker = new google.maps.Marker({
			position : {lat : parking.lat, lng : parking.lng},
			map,
			label : {
				text : "\ue54f",
				fontFamily : "Material Icons",
				color : "#ffffff",
				fontSize : "18px",
			},
			title : `Parking ${parking.ID}`,
			ID : markers.length
		});
		marker.addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(marker.getTitle());
			infoWindow.open(marker.getMap(), marker);
		});
	}

	for (poi of pointsOfInterest_TEST) {
		const marker = new google.maps.Marker({
			position : {lat : poi.lat, lng : poi.lng},
			map,
			label : {
				text : "\uea52",
				fontFamily : "Material Icons",
				color : "#ffffff",
				fontSize : "18px",
			},
			title : `PoI ${poi.ID}`,
			ID : markers.length
		});
		marker.addListener("click", () => {
			infoWindow.close();
			infoWindow.setContent(marker.getTitle());
			infoWindow.open(marker.getMap(), marker);
		});
	}

	// computeParkingPoIScore(parkings_TEST, pointsOfInterest_TEST);
}
