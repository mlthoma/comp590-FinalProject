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
let vertex_data = [];
let texture_data = [];
let canvas = null;
let program = null;
let image = null;
let size = 3;
let earth_axis_index = 0;
let moon_axis_index = 0;
let uniform_props = null;
let texture_size = 2;
let sun_y_rot = 0;
let earth_y_rot = 0;
let moon_y_rot = 0;
let keys = ["sun", "earth", "moon"];

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
    canvas = document.getElementById( "webgl-canvas" );
    
    webgl_context = canvas.getContext( "webgl" );
    program = initShaders( webgl_context, "vertex-shader", "fragment-shader" );
    webgl_context.useProgram( program );
    
    webgl_context.viewport( 0, 0, canvas.width, canvas.height );
       
    attr_vertex = webgl_context.getAttribLocation( program, "vertex" );
    attr_normal = webgl_context.getAttribLocation( program, "normal" );
    attr_vTexCoord = webgl_context.getAttribLocation( program, "vTexCoord" );
    uniform_color = webgl_context.getUniformLocation( program, "color" );
    uniform_view = webgl_context.getUniformLocation( program, "V" );
    uniform_perspective = webgl_context.getUniformLocation( program, "P" );
    uniform_props = webgl_context.getUniformLocation( program, "props" );
    uniform_trans = webgl_context.getUniformLocation( program, "trans" );
    uniform_light = webgl_context.getUniformLocation( program, "light" );
    uniform_eye = webgl_context.getUniformLocation( program, "eye" );

    uniform_texture = webgl_context.getUniformLocation(program, "texture");
  
    webgl_context.enable(webgl_context.DEPTH_TEST);
}


function createVertexData() {
    let row = 0;
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
  
function createTextureData() {

    let row = 0;
    
    for (let i = 0; i < vertex_data.length; i++) {
      let x = vertex_data[i][0];
      let y = vertex_data[i][1];
      let z = vertex_data[i][2];
  
      let r = Math.sqrt(x * x + y * y + z * z);
      let phi = Math.acos(y / r);
      let theta = Math.atan2(z, x);
  
      let s = -(theta + Math.PI) / (2 * Math.PI);
      let t = 1 - (phi / Math.PI);
      
      texture_data[row++] = vec2(s, t);
    }
  
  
}
  
  
function createTexture() {
    for(let i = 0; i < keys.length; i++) {
      image = new Image();
  
      image.onload = () => { 
  
        texture = webgl_context.createTexture();
        webgl_context.bindTexture( webgl_context.TEXTURE_2D, texture );
        webgl_context.pixelStorei( webgl_context.UNPACK_FLIP_Y_WEBGL, true );
        webgl_context.texImage2D( webgl_context.TEXTURE_2D, 0, 
                                webgl_context.RGB, webgl_context.RGB, 
                                webgl_context.UNSIGNED_BYTE, image );
        webgl_context.generateMipmap( webgl_context.TEXTURE_2D );
        webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                   webgl_context.TEXTURE_MIN_FILTER,
                                   webgl_context.NEAREST_MIPMAP_LINEAR );
        webgl_context.texParameteri( webgl_context.TEXTURE_2D, 
                                   webgl_context.TEXTURE_MAG_FILTER, 
                                   webgl_context.NEAREST );
  
      }
  
      image.crossOrigin = "anonymous";
      image.src = url_map.get(keys[i]);
    }
}
  
  
function allocateMemory() {
    let vertex_id = webgl_context.createBuffer();
    webgl_context.bindBuffer(webgl_context.ARRAY_BUFFER, vertex_id);
    webgl_context.vertexAttribPointer(attr_vertex, size, webgl_context.FLOAT, false, 0, 0);
    webgl_context.enableVertexAttribArray(attr_vertex);
    webgl_context.bufferData(webgl_context.ARRAY_BUFFER, flatten(vertex_data), webgl_context.STATIC_DRAW);
  
    let normal_id = webgl_context.createBuffer();
    webgl_context.bindBuffer(webgl_context.ARRAY_BUFFER, normal_id);
    webgl_context.vertexAttribPointer(attr_normal, size, webgl_context.FLOAT, false, 0, 0);
    webgl_context.enableVertexAttribArray(attr_normal);
    webgl_context.bufferData(webgl_context.ARRAY_BUFFER, flatten(N), webgl_context.STATIC_DRAW);


    let texbuff_id = webgl_context.createBuffer();

    
    webgl_context.bindBuffer( webgl_context.ARRAY_BUFFER, texbuff_id );
    webgl_context.vertexAttribPointer( attr_vTexCoord, texture_size, webgl_context.FLOAT, false, 0, 0 );
    webgl_context.enableVertexAttribArray( attr_vTexCoord );
    webgl_context.bufferData( webgl_context.ARRAY_BUFFER, flatten(texture_data), webgl_context.STATIC_DRAW );
}
  
  
function drawSun() {
    webgl_context.uniform4f(uniform_props, 0, radians(sun_y_rot), 0, 1);
    webgl_context.uniform4f(uniform_color, 0.70, 0.13, 0.13, 1.0);
    webgl_context.uniform4f(uniform_trans, 0, 0, 0, 1.0);
    webgl_context.drawArrays(webgl_context.TRIANGLES, 0, earth_axis_index);
}
  
  
function drawEarth() {
    let r = orbit_radius_crd;
    let theta = radians(orbit_speed);
    let phi = radians(orbit_angle_crd);

    let x = r * Math.sin(theta) * Math.cos(phi);
    let y = r * Math.sin(theta) * Math.sin(phi);
    let z = r * Math.cos(theta);
  
    webgl_context.uniform4f(uniform_props, 0, radians(earth_y_rot), 0, 0.3);
    webgl_context.uniform4f(uniform_color, 1.0, 0.84, 0.0, 1.0);
    webgl_context.uniform4f(uniform_trans, x, y, z, 1.0);
    webgl_context.drawArrays(webgl_context.TRIANGLES, earth_axis_index, vertex_data.length - earth_axis_index);
}


function draw() {
    let light = vec4(lxt, lyt, lzt, 0.0);
    let eye = vec3(xt, yt, zt);
    webgl_context.uniform4fv( uniform_light, flatten(light) );
    webgl_context.uniform3fv( uniform_eye, flatten(eye) );

    let Vy = lookAt(eye, at, up);
    let P = perspective(fov, 1.0, 0.3, 3.0);
    webgl_context.uniformMatrix4fv( uniform_view, false, flatten( Vy ) );
    webgl_context.uniformMatrix4fv( uniform_perspective, false, flatten( P ) );
  
    drawSun();
    sun_y_rot = (sun_y_rot + 1) % 360;
    webgl_context.uniform1i( uniform_texture, 0);
    drawEarth();
    earth_y_rot = (earth_y_rot + 5) % 360;
    orbit_speed = (orbit_speed + orbit_speed_crd) % 360;
}
  
configure();
createVertexData();
createTextureData();
createTexture();
allocateMemory();
setInterval(draw, 100);
