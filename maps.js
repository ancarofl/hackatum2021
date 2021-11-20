let map;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

const MUNICH_CENTRE_LAT = 48.137154;
const MUNICH_CENTRE_LNG = 11.576124;

const radius = 15000;

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

  foundLatitude = new_x + x0;
  foundLongitude = y + y0;
  // console.log("Longitude: " + foundLongitude + " Latitude: " + foundLatitude);
  return { lat: foundLatitude, lng: foundLongitude };
}

let numChargingStations = 25;
let markers = [];

function generateChargingStations(numChargingStations) {

  const infoWindow = new google.maps.InfoWindow();

  for (let i = 0; i < numChargingStations; i++) {
    const marker = new google.maps.Marker({
      position: getLocation(MUNICH_CENTRE_LAT, MUNICH_CENTRE_LNG, radius),
      map,
      label: "CS",
      title: `Charging Station No. ${i}`,
    });
    marker.addListener("click", () => {
      infoWindow.close();
      infoWindow.setContent(marker.getTitle());
      infoWindow.open(marker.getMap(), marker);
    });
    markers.push(marker);
  }
}

function initMap() {
  //   const myLatLng = { lat: 48.137154, lng: 11.576124 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: MUNICH_CENTRE_LAT, lng: MUNICH_CENTRE_LNG },
    zoom: 11,
  });

  generateChargingStations(numChargingStations);
}
