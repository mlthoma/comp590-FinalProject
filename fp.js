console.clear();

// ----------------------------------------------
// Todo: Create variables used by your solution
// ----------------------------------------------
let webgl_context = null;
let attr_vertex = null;
let attr_normal = null;
let attr_vTexCoord = null;
let uniform_color = null;
let uniform_view = null;
let uniform_perspective = null;
let uniform_light = null;
let uniform_trans = null;
let uniform_eye = null;
let uniform_texture = null;
let uniform_shading = null;
let vertex_data = [];
let normal_data = [];
let texture_data = [];
let canvas = null;
let program = null;
let sun_axis_index = 0;
let earth_axis_index = 0;
let moon_axis_index = 0;
let uniform_props = null;
let sun_y_rot = 0;
let earth_y_rot = 0;
let moon_y_rot = 0;
const NUM_TEXTURES = 3;
let textures = new Array(NUM_TEXTURES);
const SUN_SCALE = 2.5;    
const EARTH_SCALE = 0.5;
const MOON_SCALE = 0.25; 


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

function configure() {
    
    canvas = document.getElementById("webgl-canvas");
    
    webgl_context = canvas.getContext("webgl");
    program = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
    webgl_context.useProgram(program);
    
    webgl_context.viewport(0, 0, canvas.width, canvas.height);
       
    attr_vertex = webgl_context.getAttribLocation(program, "vertex");
    attr_normal = webgl_context.getAttribLocation(program, "normal");
    attr_vTexCoord = webgl_context.getAttribLocation(program, "vTexCoord");
    
    uniform_view = webgl_context.getUniformLocation(program, "V");
    uniform_perspective = webgl_context.getUniformLocation(program, "P");
    uniform_props = webgl_context.getUniformLocation(program, "props");
    uniform_trans = webgl_context.getUniformLocation(program, "trans");
    uniform_light = webgl_context.getUniformLocation(program, "light");
    uniform_texture = webgl_context.getUniformLocation(program, "texture");
    uniform_shading = webgl_context.getUniformLocation(program, "shading_enabled");
    
    webgl_context.enable(webgl_context.DEPTH_TEST);
}


function createVertexData() {
    let row = 0;

    sun_axis_index = row;
    for (let i = 0; i < F.length; i++) {
        vertex_data[row++] = V[F[i][0]];
        vertex_data[row++] = V[F[i][1]];
        vertex_data[row++] = V[F[i][2]];
    }
    
    earth_axis_index = row;
    for (let i = 0; i < F.length; i++) {
        vertex_data[row++] = V[F[i][0]];
        vertex_data[row++] = V[F[i][1]];
        vertex_data[row++] = V[F[i][2]];
    }
    
    moon_axis_index = row;
    for (let i = 0; i < F.length; i++) {
        vertex_data[row++] = V[F[i][0]];
        vertex_data[row++] = V[F[i][1]];
        vertex_data[row++] = V[F[i][2]];
    }
}

function createNormalData() {
    normal_data = vertex_data.map((v) => {
      const n = vec3(v[0], v[1], v[2]);
      return normalize(n);
    });
}
  
function createTextureData() {

    for (let i = 0; i < vertex_data.length; i++) {
        let x = vertex_data[i][0];
        let y = vertex_data[i][1];
        let z = vertex_data[i][2];
        
        let r = Math.sqrt(x * x + y * y + z * z);
        let theta = Math.acos(y / r);
        let phi = Math.atan2(z, x);
        
        let s = -(phi + Math.PI) / (2 * Math.PI);
        let t = 1 - (theta / Math.PI);
        
        texture_data.push(vec2(s, t));
    }
  
  
}
  
  
function createTexture() {
    let textureIndex = 0;
    url_map.forEach((url, key) => {
        const idx = textureIndex++;
        let image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            let texture = webgl_context.createTexture();
            webgl_context.activeTexture(webgl_context.TEXTURE0 + idx);
            webgl_context.bindTexture(webgl_context.TEXTURE_2D, texture);
            webgl_context.pixelStorei(webgl_context.UNPACK_FLIP_Y_WEBGL, true);
            webgl_context.texImage2D(
                webgl_context.TEXTURE_2D, 0,
                webgl_context.RGB, webgl_context.RGB,
                webgl_context.UNSIGNED_BYTE, image
            );
            webgl_context.generateMipmap(webgl_context.TEXTURE_2D);
            webgl_context.texParameteri(
                webgl_context.TEXTURE_2D,
                webgl_context.TEXTURE_MIN_FILTER,
                webgl_context.NEAREST_MIPMAP_LINEAR
            );
            webgl_context.texParameteri(
                webgl_context.TEXTURE_2D,
                webgl_context.TEXTURE_MAG_FILTER,
                webgl_context.NEAREST
            );
            textures[idx] = texture;
        };
        image.src = url;
    });
}
  
  
function allocateMemory() {
    let vertex_id = webgl_context.createBuffer();

    webgl_context.bindBuffer(webgl_context.ARRAY_BUFFER, vertex_id);
    webgl_context.vertexAttribPointer(attr_vertex, 3, webgl_context.FLOAT, false, 0, 0);
    webgl_context.enableVertexAttribArray(attr_vertex);
    webgl_context.bufferData(webgl_context.ARRAY_BUFFER, flatten(vertex_data), webgl_context.STATIC_DRAW);
    
    let normal_id = webgl_context.createBuffer();

    webgl_context.bindBuffer(webgl_context.ARRAY_BUFFER, normal_id);
    webgl_context.vertexAttribPointer(attr_normal, 3, webgl_context.FLOAT, false, 0, 0);
    webgl_context.enableVertexAttribArray(attr_normal);
    webgl_context.bufferData(webgl_context.ARRAY_BUFFER, flatten(normal_data), webgl_context.STATIC_DRAW);
    
    let texbuff_id = webgl_context.createBuffer();

    webgl_context.bindBuffer(webgl_context.ARRAY_BUFFER, texbuff_id);
    webgl_context.vertexAttribPointer(attr_vTexCoord, 2, webgl_context.FLOAT, false, 0, 0);
    webgl_context.enableVertexAttribArray(attr_vTexCoord);
    webgl_context.bufferData(webgl_context.ARRAY_BUFFER, flatten(texture_data), webgl_context.STATIC_DRAW);
}


function calculateEarthPosition() {
    let r = orbit_radius_crd;
    let theta = radians(orbit_speed);
    let phi = radians(orbit_angle_crd);
    
  
    let x = r * Math.sin(theta) * Math.cos(phi);
    let y = r * Math.sin(theta) * Math.sin(phi);
    let z = r * Math.cos(theta);
    
    return [x, y, z];
}


function calculateMoonPosition(earthPos) {
    let rm = 0.5;
    let thetam = radians(orbit_speed * 3.0);
    let phim = 0;
    
    let xm = rm * Math.sin(thetam) * Math.cos(phim);
    let ym = rm * Math.sin(thetam) * Math.sin(phim);
    let zm = rm * Math.cos(thetam);

    let xd = xm - earthPos[0];
    let yd = ym - earthPos[1];
    let zd = zm - earthPos[2];

    let rd = Math.sqrt(xd*xd + yd*yd + zd*zd);
    let thetad = Math.acos(zd / rd);
    let phid = Math.atan2(yd, xd)

    
    let xt = earthPos[0] - rd * Math.sin(thetad) * Math.cos(phid);
    let yt = earthPos[1] - rd * Math.sin(thetad) * Math.sin(phid);
    let zt = earthPos[2] - rd * Math.cos(thetad);

    return [xt, yt, zt];

}

  
  
function drawSun() {
    webgl_context.activeTexture(webgl_context.TEXTURE0);
    webgl_context.bindTexture(webgl_context.TEXTURE_2D, textures[0]);
    webgl_context.uniform1i(uniform_texture, 0);
    webgl_context.uniform1i(uniform_shading, 1);
    webgl_context.uniform4f(uniform_props, 0, radians(sun_y_rot), 0, SUN_SCALE);
    webgl_context.uniform4f(uniform_trans, 0, 0, 0, 1.0);
    webgl_context.drawArrays(webgl_context.TRIANGLES, sun_axis_index, earth_axis_index - sun_axis_index);

}


function drawEarth(earthPos) {
    webgl_context.activeTexture(webgl_context.TEXTURE1);
    webgl_context.bindTexture(webgl_context.TEXTURE_2D, textures[1]);
    webgl_context.uniform1i(uniform_texture, 1);
    webgl_context.uniform1i(uniform_shading, 0);
    webgl_context.uniform4f(uniform_props, 0, radians(earth_y_rot), 0, EARTH_SCALE);
    webgl_context.uniform4f(uniform_trans, earthPos[0], earthPos[1], earthPos[2], 1.0);
    webgl_context.drawArrays(webgl_context.TRIANGLES, earth_axis_index, moon_axis_index - earth_axis_index);

}

function drawMoon(moonPos) {
    webgl_context.activeTexture(webgl_context.TEXTURE2);
    webgl_context.bindTexture(webgl_context.TEXTURE_2D, textures[2]);
    webgl_context.uniform1i(uniform_texture, 2);
    webgl_context.uniform1i(uniform_shading, 0);
    webgl_context.uniform4f(uniform_props, 0, radians(moon_y_rot), 0, MOON_SCALE);
    webgl_context.uniform4f(uniform_trans, moonPos[0], moonPos[1], moonPos[2], 1.0);
    webgl_context.drawArrays(webgl_context.TRIANGLES, moon_axis_index, vertex_data.length - moon_axis_index);

}



function draw() {
    webgl_context.clear(webgl_context.COLOR_BUFFER_BIT | webgl_context.DEPTH_BUFFER_BIT);
    
    let eye = vec3(xt, yt, zt);
    let V = lookAt(eye, at, up);
    let P = perspective(fov, 1.0, 0.3, 3.0);
    
    webgl_context.uniformMatrix4fv(uniform_view, false, flatten(V));
    webgl_context.uniformMatrix4fv(uniform_perspective, false, flatten(P));
    

    let light = vec4(0.0, 0.0, 0.0, 0.0);
    webgl_context.uniform4fv(uniform_light, light);

    drawSun();
    
    let earthPos = calculateEarthPosition();
    drawEarth(earthPos);

    let moonPos = calculateMoonPosition(earthPos);
    drawMoon(moonPos);

    sun_y_rot = (sun_y_rot + 1) % 360;
    earth_y_rot = (earth_y_rot + 5) % 360;
    moon_y_rot = (moon_y_rot + 10) % 360;
    orbit_speed = (orbit_speed + orbit_speed_crd) % 360;

}
  
configure();
createVertexData();
createTextureData();
createTexture();
createNormalData();
allocateMemory();
setInterval(draw, 100);
