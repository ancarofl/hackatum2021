/* 2.1. */
async function getTravelDistanceAndDuration(olat, olng, dlat, dlng) {
	var result = null;

	await fetch(
		"https://router.hereapi.com/v8/routes?transportMode=car&origin=" +
		olat +
		"," +
		olng +
		"&destination=" +
		dlat +
		"," +
		dlng +
		"&return=summary&apiKey=" +
		HERE_API_KEY
	)
		.then((response) => response.json())
		.then((data) => {
			// console.log("getTravelDistanceAndDuration response: ", data);
			result = {
				duration: data.routes[0].sections[0].summary.duration,
				distance: data.routes[0].sections[0].summary.length
			};
		});

	return result;
}