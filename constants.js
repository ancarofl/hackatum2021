/* All distances are expressed in METRES. All durations are expressed in SECONDS. Mainly because that is the HERE API default. */

const FULL_CHARGE_TRAVEL_DISTANCE = 300000;
const SAFETY_BATTERY_TRAVEL_DISTANCE = 10000;

const SAFETY_BATTERY_PERCENTAGE = 10;
const LOWER_SAFETY_BATTERY_PERCENTAGE = 20;
const UPPER_SAFETY_BATTERY_PERCENTAGE = 80;

const MUNICH_CENTRE_LAT = 48.137154;
const MUNICH_CENTRE_LNG = 11.576124;
const MUNICH_AIRPORT_LAT = 48.353144657793344;
const MUNICH_AIRPORT_LNG = 11.786160706625926;
const MUNICH_TUM_LAT = 48.149803141861;
const MUNICH_TUM_LNG = 11.567860198670074;
const RADIUS = 15000;

//Score constants
const SCORE_a = 0.5;
const SCORE_b = 0.2;
const SCORE_c = 0.3;

//Divider to modify time duration from the UI
// const TIME_DIVIDER = 500.0

const TIME_DIVIDER = 200.0