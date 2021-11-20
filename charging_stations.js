

// fetch('https://api.shutterstock.com/v2/images/search?query=' + formattedCarString, {
// 	method: 'GET',
// 	headers: {
// 		'Authorization': 'Bearer ' + SSBT,
// 		'Accept': 'application/json',
// 		'Content-Type': 'application/json'
// 	},
// })			.then((response) => response.json())
// .then((data) => console.log(data));


//1. Generate random stations
function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
}


function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
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
	console.log("Longitude: " + foundLongitude + " Latitude: " + foundLatitude );
}


getLocation(48, 11, 500);