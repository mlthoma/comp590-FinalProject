console.clear();

// ----------------------------------------------
// Todo: Create variables used by your solution
// ----------------------------------------------


// ----------------------------------------------
// Camera parameters
// ----------------------------------------------

let xt = 0.0;
let yt = 0.0;
let zt = 1.0;
let fov = 85;

// ----------------------------------------------
// Light parameters that are fixed (do not modify)
// ----------------------------------------------
const lxt = 0.0;
const lyt = 0.0;
const lzt = 0.0;

// ----------------------------------------------
// Camera orientation parameters (do not modify)
// ----------------------------------------------
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// ----------------------------------------------
// Map data structure. The key is a string 
// that defines the name of the image (e.g., 
// sun, earth, and moon) and the associated value 
// is also a string that defines a URL.
// (do no modify)
// ----------------------------------------------

let url_map = new Map();

url_map.set("sun", "https://127.0.0.1:8080/sun.jpg");
url_map.set("earth", "https://127.0.0.1:8080/earth.jpg");
url_map.set("moon", "https://127.0.0.1:8080/moon.jpg");

// ----------------------------------------------
// Earth orbit parameters
// ----------------------------------------------
let orbit_speed = 0;
let orbit_speed_crd = 3; 
let orbit_radius_crd = 1.0; 
let orbit_angle_crd = 0; 

// ----------------------------------------------
// Todo: You code the solution
// ----------------------------------------------

