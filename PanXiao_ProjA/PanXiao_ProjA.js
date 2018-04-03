//Fragment shader program
var FSHADER_SOURCE =
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';


//Vertex shader program
var VSHADER_SOURCE =
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';


var ANGLE_STEP = 20.0;
var LENGTH_STEP = 0.2;
var userStretch = 2.0;

// Global vars for mouse click-and-drag for rotation.
var isDrag = false;		// mouse-drag: true when user holds down mouse button
var isClick = false;
var xMclik = 0.0;			// last mouse button-down position (in CVV coords)
var yMclik = 0.0;
var screwX = 0.0;           // position of screw
var screwY = 0.0;
var screwStep = 0.1;
var positionX = -0.5;       // position of the dumbbell
var positionY = 0.0;
var right = true;

function main(){
	//Retrieve canvas element
	var canvas = document.getElementById("webgl");


	//Get the rendering context
	var gl = getWebGLContext(canvas);

	if(!gl)
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	//Initialize shaders
	//Use initShaders
	//If failed, log
	if(!initShaders(gl,VSHADER_SOURCE, FSHADER_SOURCE))
	{
		console.log('Failed to initialize shaders.');
		return;
	}

	//Write the positions of vertices into an array, transfer
	//array contents to a Vertex Buffer Object created in the graphics hardware

	var n = initVertexBuffers(gl);

  	if (n < 0) {
    	console.log('Failed to set the positions of the vertices');
    return;
	}

  	canvas.onmousedown = function (ev) { myMouseDown(ev, gl, canvas) };
  	canvas.onmousemove = function (ev) { myMouseMove(ev, gl, canvas) };
  	canvas.onmouseup = function (ev) { myMouseUp(ev, gl, canvas) };

  	window.addEventListener("keydown", myKeyDown, false);
  	window.addEventListener("keyup", myKeyUp, false);
  	//window.addEventListener("keyup", myKeyUp, false);

	//Specify the color for clearing <canvas>?
	gl.clearColor(0,0,0,1);

	//Enable 3D depth test
	gl.enable(gl.DEPTH_TEST);

	//Get storage location of u_modelMatrix
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  	if (!u_ModelMatrix) {
    	console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  	}


  	var modelMatrix = new Matrix4();
  	var curAngle = 0.0;
  	var curLength = 1.0;

  	var tick = function () {
  	    var now = Date.now();

  	    curAngle = animateAngle(curAngle, now);
  	    curLength = animateLength(curLength, now);
  	    g_last = now;
  	    draw(gl, curLength, curAngle, modelMatrix, u_ModelMatrix);
        drawCube(gl, curAngle, modelMatrix, u_ModelMatrix);
		requestAnimationFrame(tick, canvas); //Request the browser calls tick
	};

	tick();

}

function initVertexBuffers(gl)
{
    var colorShapes = new Float32Array([

		1.0, 0.0, 0.5, 1.0, 	0.35, 0.5, 1.0,//NODE 0
		0.5, 0.0, 1.0, 1.0, 	0.6, 0.0, 0.5,// NODE 1
		0.5, 2.0, 1.0, 1.0, 	1.0, 0.0, 0.0,// NODE 9

        0.5, 0.0, 1.0, 1.0,		0.0, 1.0, 0.0,// NODE 1
		-0.5, 0.0, 1.0, 1.0,	0.4, 0.5, 0.5,// NODE 2
		-0.5, 2.0, 1.0, 1.0,	0.0, 1.0, 0.0,// NODE 10

        -0.5, 0.0, 1.0, 1.0,    0.4, 0.5, 0.5,// NODE 2
		-1.0, 0.0, 0.5, 1.0,    0.5, 0.5, 0.5,// NODE 3
		-1.0, 2.0, 0.5, 1.0,    0.1, 1.0, 0.5,// NODE 11

        -1.0, 0.0, 0.5, 1.0,	0.0, 0.6, 0.0,// NODE 3
		-1.0, 0.0, -0.5, 1.0,	1.0, 0.3, 0.0,// NODE 4
		-1.0, 2.0, -0.5, 1.0,	1.0, 0.0, 0.3,// NODE 12

        -1.0, 0.0, -0.5, 1.0,   0.0, 0.5, 1.0,// NODE 4
		-0.5, 0.0, -1.0, 1.0,   0.35, 0.5, 1.0,// NODE 5
		-0.5, 2.0, -1.0, 1.0,   0.0, 0.75, 1.0,// NODE 13

        -0.5, 0.0, -1.0, 1.0,	0.35, 0.5, 1.0,// NODE 5
		0.5, 0.0, -1.0, 1.0,	1.0, 0.0, 0.0,// NODE 6
		0.5, 2.0, -1.0, 1.0,	1.0, 0.0, 0.0,// NODE 14

        0.5, 0.0, -1.0, 1.0,	0.3, 1.0, 0.5,// NODE 6
		1.0, 0.0, -0.5, 1.0, 	0.0, 1.0, 1.0,// NODE 7
		1.0, 2.0, -0.5, 1.0, 	0.0, 1.0, 1.0,// NODE 15

        1.0, 0.0, -0.5, 1.0,    0.0, 0.0, 1.0,// NODE 7
		1.0, 0.0, 0.5, 1.0,     1.0, 0.0, 1.0,//NODE 0
        1.0, 2.0, 0.5, 1.0,    1.0, 0.1, 0.1, //NODE 8

		0.5, 2.0, 1.0, 1.0,		1.0, 0.1, 0.1,// NODE 9
		1.0, 2.0, 0.5,1.0,		1.0, 0.1, 0.1, //NODE 8
		1.0, 0.0, 0.5, 1.0, 	1.0, 0.0, 1.0,//NODE 0

		-0.5, 2.0, 1.0, 1.0,	0.0, 1.0, 0.0,// NODE 10
		0.5, 2.0, 1.0, 1.0,		1.0, 0.0, 1.0,// NODE 9
		0.5, 0.0, 1.0, 1.0,		0.0, 1.0, 0.0,// NODE 1

		-1.0, 2.0, 0.5, 1.0,    0.3, 1.0, 0.5,// NODE 11
		-0.5, 2.0, 1.0, 1.0,    0.1, 0.1, 0.5,// NODE 10
		-0.5, 0.0, 1.0, 1.0,    0.1, 1.0, 0.1,// NODE 2

		-1.0, 2.0, -0.5, 1.0,	1.0, 0.0, 0.6,// NODE 12
		-1.0, 2.0, 0.5, 1.0,	1.0, 0.5, 0.0,// NODE 11
		-1.0, 0.0, 0.5, 1.0,	0.1, 0.0, 0.0,// NODE 3

		-0.5, 2.0, -1.0, 1.0,   0.1, 0.1, 1.0,// NODE 13
		-1.0, 2.0, -0.5, 1.0,   0.1, 0.1, 1.0,// NODE 12
		-1.0, 0.0, -0.5, 1.0,   0.1, 0.1, 1.0,// NODE 4

		0.5, 2.0, -1.0, 1.0,	1.0, 0.0, 0.75,// NODE 14
		-0.5, 2.0, -1.0, 1.0,	1.0, 0.0, 0.4,// NODE 13
		-0.5, 0.0, -1.0, 1.0,	1.0, 0.0, 0.75,// NODE 5

		1.0, 2.0, -0.5, 1.0, 	0.1, 1.0, 1.0,// NODE 15
		0.5, 2.0, -1.0, 1.0,	0.1, 0.5, 1.0,// NODE 14
		0.5, 0.0, -1.0, 1.0,	0.3, 1.0, 0.5,// NODE 6

        1.0, 2.0, 0.5, 1.0,    1.0, 0.1, 0.1, //NODE 8
        1.0, 2.0, -0.5, 1.0,    0.1, 1.0, 1.0,// NODE 15
        1.0, 0.0, -0.5, 1.0,    0.0, 1.0, 1.0,// NODE 7


        // 14 Vertices
        0.0, -1.5, 0.0, 1.0, 1.0, 1.0, 1.0,         //abcd
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b

        0.0, -1.5, 0.0, 1.0, 1.0, 1.0, 1.0,         //abcd
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c

        0.0, -1.5, 0.0, 1.0, 1.0, 1.0, 1.0,         //abcd
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a

        0.0, -1.5, 0.0, 1.0, 1.0, 1.0, 1.0,         //abcd
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d

        0.0, 0.0, 1.5, 1.0, 0.5, 0.5, 0.5,      //adef
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d

        0.0, 0.0, 1.5, 1.0, 0.5, 0.5, 0.5,      //adef
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a

        0.0, 0.0, 1.5, 1.0, 0.5, 0.5, 0.5,      //adef
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h

        0.0, 0.0, 1.5, 1.0, 0.5, 0.5, 0.5,      //adef
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e

        1.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,      //hdcg
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d

        1.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,      //hdcg
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c

        1.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,      //hdcg
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g

        1.5, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,      //hdcg
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h

        -1.5, 0.0, 0.0, 1.0, 0.5, 0.5, 0.5,      //aedb
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e

        -1.5, 0.0, 0.0, 1.0, 0.5, 0.5, 0.5,      //aedb
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f

        -1.5, 0.0, 0.0, 1.0, 0.5, 0.5, 0.5,      //aedb
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b

        -1.5, 0.0, 0.0, 1.0, 0.5, 0.5, 0.5,      //aedb
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a

        0.0, 1.5, 0.0, 1.0, 1.0, 1.0, 1.0,      //fehg
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e

        0.0, 1.5, 0.0, 1.0, 1.0, 1.0, 1.0,      //fehg
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h

        0.0, 1.5, 0.0, 1.0, 1.0, 1.0, 1.0,      //fehg
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g

        0.0, 1.5, 0.0, 1.0, 1.0, 1.0, 1.0,      //fehg
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f

        0.0, 0.0, -1.5, 1.0, 1.0, 1.0, 1.0,      //bcgf
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f

        0.0, 0.0, -1.5, 1.0, 1.0, 1.0, 1.0,      //bcgf
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g

        0.0, 0.0, -1.5, 1.0, 1.0, 1.0, 1.0,      //bcgf
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c

        0.0, 0.0, -1.5, 1.0, 1.0, 1.0, 1.0,      //bcgf
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
        // abc

        // bl
        0.0, -1.5, 0.0, 1.0, 1.0, 0.0, 0.0,         //abcd
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b

        0.0, -1.5, 0.0, 1.0, 1.0, 0.0, 0.0,         //abcd
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c

        0.0, -1.5, 0.0, 1.0, 1.0, 0.0, 0.0,         //abcd
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a

        0.0, -1.5, 0.0, 1.0, 1.0, 0.0, 0.0,         //abcd
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d

        0.0, 0.0, 1.5, 1.0, 0.0, 0.0, 0.5,      //adef
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d

        0.0, 0.0, 1.5, 1.0, 0.0, 0.0, 0.5,      //adef
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a

        0.0, 0.0, 1.5, 1.0, 0.0, 0.0, 0.5,      //adef
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h

        0.0, 0.0, 1.5, 1.0, 0.0, 0.0, 0.5,      //adef
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e

        1.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,      //hdcg
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d

        1.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,      //hdcg
        1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //d
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c

        1.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,      //hdcg
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g

        1.5, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0,      //hdcg
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h

        -1.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.5,      //aedb
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e

        -1.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.5,      //aedb
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f

        -1.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.5,      //aedb
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b

        -1.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.5,      //aedb
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
        -1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,      //a

        0.0, 1.5, 0.0, 1.0, 0.0, 1.0, 0.0,      //fehg
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e

        0.0, 1.5, 0.0, 1.0, 0.0, 1.0, 0.0,      //fehg
        -1.0, 1.0, 1.0, 1.0, 0.2, 0.2, 0.2,      //e
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h

        0.0, 1.5, 0.0, 1.0, 0.0, 1.0, 0.0,      //fehg
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,      //h
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g

        0.0, 1.5, 0.0, 1.0, 0.0, 1.0, 0.0,      //fehg
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f

        0.0, 0.0, -1.5, 1.0, 1.0, 0.0, 0.0,      //bcgf
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f

        0.0, 0.0, -1.5, 1.0, 1.0, 0.0, 0.0,      //bcgf
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //f
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g

        0.0, 0.0, -1.5, 1.0, 1.0, 0.0, 0.0,      //bcgf
        1.0, 1.0, -1.0, 1.0, 0.5, 0.5, 0.5,      //g
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c

        0.0, 0.0, -1.5, 1.0, 1.0, 0.0, 0.0,      //bcgf
        1.0, -1.0, -1.0, 1.0, 0.2, 0.2, 0.2,      //c
        -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,      //b
		]);
	var n = 48+72+36;

	// Create a buffer object
  var shapeBufferHandle = gl.createBuffer();
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

  //Get graphics system's handle for our Vertex Shader's position-input variable:
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Use handle to specify how to retrieve position data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * 7, 		// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  		0);						// Offset -- now many bytes from START of buffer to the
  									// value we will actually use?
  gl.enableVertexAttribArray(a_Position);
  									// Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(
  	a_Color, 				// choose Vertex Shader attribute to fill with data
  	3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
  	gl.FLOAT, 			// data type for each value: usually gl.FLOAT
  	false, 					// did we supply fixed-point data AND it needs normalizing?
  	FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  	FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w

  gl.enableVertexAttribArray(a_Color);
  									// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return n;
}



function draw(gl, curLength, curAngle, modelMatrix, u_ModelMatrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    pushMatrix(modelMatrix);
    modelMatrix.setTranslate(0.4, 0.6, 0.0);
    modelMatrix.scale(0.1, 0.1, 0.1);

    modelMatrix.translate(screwX, screwY, 0.0);
    modelMatrix.rotate(curAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 48);

    modelMatrix.scale(.75, curLength/2, .75);
    modelMatrix.rotate(180, 0, 1, 0);
    secondAngle = Math.abs(curAngle%120 - 60) -30;
    modelMatrix.rotate(secondAngle, 1, 0, 0);
    modelMatrix.rotate(curAngle*0.5, 0, 1, 0);
    modelMatrix.translate(0.0, -2.0, 0.0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 48);

    modelMatrix.scale(.75, 1, .75);
    modelMatrix.translate(0.0, -2.0, 0.0);
    //modelMatrix.rotate(80, 0, 1, 0);
    modelMatrix.rotate(secondAngle*0.5, 1, 0, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, 48);

}

function drawCube(gl, curAngle, modelMatrix, u_ModelMatrix) {
    modelMatrix = popMatrix();
    modelMatrix.setTranslate(positionX, positionY, 0.0);
    modelMatrix.scale(0.1, 0.1, 0.1);
    modelMatrix.rotate(curAngle, 1, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    if(right)
        gl.drawArrays(gl.TRIANGLES, 48, 72);
    else
        gl.drawArrays(gl.TRIANGLES, 48+72, 72);
    modelMatrix.translate(4, 0, 0);
    modelMatrix.rotate(curAngle*0.5, 1, 0, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    if(right)
        gl.drawArrays(gl.TRIANGLES, 48, 72);
    else
        gl.drawArrays(gl.TRIANGLES, 48+72, 72);

    modelMatrix.translate(-2, 0, 0);
    modelMatrix.scale(1, 0.1, 0.1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    if(right)
        gl.drawArrays(gl.TRIANGLES, 48, 72);
    else
        gl.drawArrays(gl.TRIANGLES, 48+72, 72);

    modelMatrix.scale(1, 10, 10);
    modelMatrix.translate(2, 4, 0);
    modelMatrix.rotate(curAngle*0.5, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    if(right)
        gl.drawArrays(gl.TRIANGLES, 48, 72);
    else
        gl.drawArrays(gl.TRIANGLES, 48+72, 72);

    modelMatrix.translate(0, -2, 0);
    modelMatrix.scale(0.1, 1, 0.1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    if(right)
        gl.drawArrays(gl.TRIANGLES, 48, 72);
    else
        gl.drawArrays(gl.TRIANGLES, 48+72, 72);

    modelMatrix.scale(10, 1, 10);
    modelMatrix.translate(0, 2, 4);
    modelMatrix.rotate(curAngle*0.5, 0, 0, 1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    if(right)
        gl.drawArrays(gl.TRIANGLES, 48, 72);
    else
        gl.drawArrays(gl.TRIANGLES, 48+72, 72);

    modelMatrix.translate(0, 0, -2);
    modelMatrix.scale(0.1, 0.1, 1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    if(right)
        gl.drawArrays(gl.TRIANGLES, 48, 72);
    else
        gl.drawArrays(gl.TRIANGLES, 48+72, 72);
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animateLength(curLength, now) {
    var elapsed = now - g_last;
    var newLength;
    if (curLength < userStretch && LENGTH_STEP > 0)
        newLength = curLength + (LENGTH_STEP * elapsed) / 1000.0;
    else if ((curLength >= userStretch && LENGTH_STEP > 0) || (curLength <= userStretch && LENGTH_STEP < 0))
        newLength = curLength;
    else if(LENGTH_STEP < 0)
        newLength = curLength + (LENGTH_STEP * elapsed) / 1000.0;

    return newLength;
}

function animateAngle(angle, now) {
    //==============================================================================
    // Calculate the elapsed time
    var elapsed = now - g_last;
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 2160;
}


function increaseSpin()
{
    ANGLE_STEP += 10.0;
}

function decreaseSpin()
{
    if(ANGLE_STEP > 10.0)
        ANGLE_STEP -= 10.0;
}

function onSubmitStretch()
{
    var oldStretch = userStretch;

    userStretch = document.getElementById("usrStretch").value;
    console.log("newlength: " + userStretch);
    if(userStretch <= 0.1)
    {
        userStretch = 0.1;
    }
    if (userStretch >= 5.0) {
        userStretch = 5.0;
    }

    if (oldStretch > userStretch)
        LENGTH_STEP = -0.5;
    else
        LENGTH_STEP = 0.5;
}

function myMouseDown(ev, gl, canvas) {
    //==============================================================================
    // Called when user PRESSES down any mouse button;
    // 									(Which button?    console.log('ev.button='+ev.button);   )
    // 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
    //		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

    // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
    var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
    //  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);

    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width / 2) / 		// move origin to center of canvas and
                           (canvas.width / 2);			// normalize canvas to -1 <= x < +1,
    var y = (yp - canvas.height / 2) /		//										 -1 <= y < +1.
							 (canvas.height / 2);
    //	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);

    isClick = true;
    isDrag = true;											// set our mouse-dragging flag
    xMclik = x;													// record where mouse-dragging began
    yMclik = y;
}
function myMouseMove(ev, gl, canvas) {
    //==============================================================================
    // Called when user MOVES the mouse with a button already pressed down.
    // 									(Which button?   console.log('ev.button='+ev.button);    )
    // 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
    //		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

    if (isDrag == false) {
        return;
    }
    console.log("moving the mouse");
    isClick = false;
    // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
    var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge

    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width / 2) / 		// move origin to center of canvas and
                           (canvas.width / 2);			// normalize canvas to -1 <= x < +1,
    var y = (yp - canvas.height / 2) /		//										 -1 <= y < +1.
							 (canvas.height / 2);

    // find how far we dragged the mouse:
    positionX += (x - xMclik);					// Accumulate change-in-mouse-position,&
    positionY += (y - yMclik);
    xMclik = x;													// Make next drag-measurement from here.
    yMclik = y;
}

function myMouseUp(ev, gl, canvas) {
    var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
    var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge

    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width / 2) / 		// move origin to center of canvas and
                           (canvas.width / 2);			// normalize canvas to -1 <= x < +1,
    var y = (yp - canvas.height / 2) /		//										 -1 <= y < +1.
							 (canvas.height / 2);
    isDrag = false;
    positionX += (x - xMclik);
    positionY += (y - yMclik);

    console.log("is click: " + isClick);
    if(isClick){
        console.log("clicking the mouse");
        right = !right;
    }
    isClick = false;
}

function myKeyDown(ev) {
    switch (ev.keyCode) {
        case 65://a
            screwX -= screwStep;
            break;
        case 87: //w
            screwY += screwStep;
            break;
        case 83://s
            screwY -= screwStep;
            break;
        case 68://d
            screwX += screwStep;
            break;

        default:
            console.log("press awsd to move the screw");
            break;
    }
}

function myKeyUp(ev) {
    console.log('myKeyUp()--keyCode=' + ev.keyCode + ' released.');
}
