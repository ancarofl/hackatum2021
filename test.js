function computeParkingPoIScore_TEST()
{
	let parkings_TEST = [];

	parkings_TEST.push({lat : 48.24485883803592, lng : 11.566880849264454, proximityToPoI : 0, ID : 1001});
	parkings_TEST.push({lat : 48.137154, lng : 11.576124, proximityToPoI : 0, ID : 1002});
	parkings_TEST.push({lat : 48.04594674183316, lng : 11.506859096809007, proximityToPoI : 0, ID : 1003});
	parkings_TEST.push({lat : 48.35315005900295, lng : 11.79164231790762, proximityToPoI : 0, ID : 1004});

	let pointsOfInterest_TEST = [];

	pointsOfInterest_TEST.push({lat : 48.35948715826656, lng : 11.786154019133207, ID : 3001, bookings : [ 1, 2, 3, 4, 5 ]});
	pointsOfInterest_TEST.push(
				{lat : 48.348014865807656, lng : 11.786244159138988, ID : 3002, bookings : [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ]});
	pointsOfInterest_TEST.push({lat : 48.348014865807656, lng : 11.786244159138988, ID : 3002, bookings : [ 1, 2, 3 ]});

	function testMap()
	{
		map = new google.maps.Map(document.getElementById("map"), {
			center : {lat : MUNICH_CENTRE_LAT, lng : MUNICH_CENTRE_LNG},
			zoom : 11,
		});

		for (parkings of parkings_TEST) {
			const marker = new google.maps.Marker({
				position : {lat : parkings.lat, lng : parkings.lng},
				map,
				label : {
					text : "\ue54f",
					fontFamily : "Material Icons",
					color : "#ffffff",
					fontSize : "18px",
				},
				title : `Parking No. ${i + 1}`,
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
					text : "\ue54f",
					fontFamily : "Material Icons",
					color : "#ffffff",
					fontSize : "18px",
				},
				title : `PoI No. ${i + 1}`,
				ID : markers.length
			});
			marker.addListener("click", () => {
				infoWindow.close();
				infoWindow.setContent(marker.getTitle());
				infoWindow.open(marker.getMap(), marker);
			});
		}
	}

	computeParkingPoIScore(parkings_TEST, pointsOfInterest_TEST);
}
