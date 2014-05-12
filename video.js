var vertPosBuf;
var vertTextBuf;
var gl;
var shader;
var brightness = 0.0;
var contrast = 0.0;
var saturation = 0.0;
var hue = 0.0;
var sharpness = 0.0;
var kernelLocation = null;
var posterize = 0;
var wave = 0;
var waveWidth = 25.0;
var kernel = [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ];
var kernels = {
    normal: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ],
    unsharpen: [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1
    ],
    sharpness: [
       0,-1, 0,
      -1, 6,-1,
       0,-1, 0
    ],
    sharpen: [
       -1, -1, -1,
       -1, 16, -1,
       -1, -1, -1
    ],
    edgeDetect2: [
       -1, -1, -1,
       -1,  8, -1,
       -1, -1, -1
    ],
    edgeDetect6: [
       -5, -5, -5,
       -5, 39, -5,
       -5, -5, -5
    ],
    sobelHorizontal: [
        1,  2,  1,
        0,  0,  0,
       -1, -2, -1
    ],
    sobelVertical: [
        1,  0, -1,
        2,  0, -2,
        1,  0, -1
    ],
    gaussianBlur: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045
    ],
};
var video, videoImage, videoImageContext, videoTexture;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

// ********************************************************
// ********************************************************
function gotStream(stream)  {
	if (window.URL) {   
		video.src = window.URL.createObjectURL(stream);   } 
	else {   
		video.src = stream;   
		}

	video.onerror = function(e) {   
							stream.stop();   
							};
	stream.onended = noStream;
}

// ********************************************************
// ********************************************************
function noStream(e) {
	var msg = "No camera available.";
	
	if (e.code == 1) {   
		msg = "User denied access to use camera.";   
		}
	document.getElementById("output").textContent = msg;
}

// ********************************************************
// ********************************************************
function initGL(canvas) {
	
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return (null);
		}
	
	gl.viewportWidth 	= canvas.width;
	gl.viewportHeight 	= canvas.height;
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	return gl;
}

// ********************************************************
// ********************************************************
function initBuffers(gl) {
var vPos = new Array;
var vTex = new Array;

	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V1
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0);	// V3
	vPos.push( 1.0);
	vPos.push( 0.0);
	vertPosBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
	vertPosBuf.itemSize = 3;
	vertPosBuf.numItems = vPos.length/vertPosBuf.itemSize;
		
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V1
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0);	// V3
	vTex.push( 1.0);
	vertTextBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertTextBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTex), gl.STATIC_DRAW);
	vertTextBuf.itemSize = 2;
	vertTextBuf.numItems = vTex.length/vertTextBuf.itemSize;
}

// ********************************************************
// ********************************************************
function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	if (!videoTexture.needsUpdate) 
		return;
	
   	gl.useProgram(shader);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoImage);
	videoTexture.needsUpdate = false;	

	//console.log(video.currentTime);
		
	gl.uniform1i(shader.SamplerUniform,0);
	gl.uniform1f(shader.fragBrightness,1);
	gl.uniform1f(shader.fragContrast,0);
	gl.uniform1f(shader.fragSaturation,1);
	gl.uniform1f(shader.fragPosterize,1);

	gl.enableVertexAttribArray(shader.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
	gl.vertexAttribPointer(shader.vertexPositionAttribute, vertPosBuf.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(shader.vertexTextAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertTextBuf);
	gl.vertexAttribPointer(shader.vertexTextAttribute, vertTextBuf.itemSize, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, vertPosBuf.numItems);
}

// ********************************************************
// ********************************************************
function initTexture(gl, shader) {

	videoTexture = gl.createTexture();		
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	videoTexture.needsUpdate = false;
}

// ********************************************************
// ********************************************************
function webGLStart() {

	if (!navigator.getUserMedia) {
		document.getElementById("output").innerHTML = 
			"Sorry. <code>navigator.getUserMedia()</code> is not available.";
		}
	navigator.getUserMedia({video: true}, gotStream, noStream);

	// assign variables to HTML elements
	video = document.getElementById("monitor");
	videoImage = document.getElementById("videoImage");
	videoImageContext = videoImage.getContext("2d");
	
	// background color if no video present
	videoImageContext.fillStyle = "#005337";
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	
	
	canvas = document.getElementById("videoGL");
	/*
	warhol1 = document.getElementById("video1");
	warhol2 = document.getElementById("video2");
	warhol3 = document.getElementById("video3");
	warhol4 = document.getElementById("video4");
	*/

	gl = initGL(canvas);
	/*
	glw1 = initGL(warhol1);
	glw2 = initGL(warhol2);
	glw3 = initGL(warhol3);
	glw4 = initGL(warhol4);
	*/
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
	}
		
	shader = initShaders("shader", gl);
	/*
	shaderw1 = initShaders("shader", glw1);
	shaderw2 = initShaders("shader", glw2);
	shaderw3 = initShaders("shader", glw3);
	shaderw4 = initShaders("shader", glw4);
*/

	if (shader == null) {
		alert("Erro na inicilizacao do shader!!");
		return;
		}

	shader.vertexPositionAttribute 	= gl.getAttribLocation(shader, "aVertexPosition");
	shader.vertexTextAttribute 		= gl.getAttribLocation(shader, "aVertexTexture");
	shader.SamplerUniform	 		= gl.getUniformLocation(shader, "uSampler");

/*
	shaderw1.vertexPositionAttribute 	= gl.getAttribLocation(shaderw1, "aVertexPosition");
	shaderw1.vertexTextAttribute 		= gl.getAttribLocation(shaderw1, "aVertexTexture");
	shaderw1.SamplerUniform	 		= gl.getUniformLocation(shaderw1, "uSampler");

	shaderw2.vertexPositionAttribute 	= gl.getAttribLocation(shaderw2, "aVertexPosition");
	shaderw2.vertexTextAttribute 		= gl.getAttribLocation(shaderw2, "aVertexTexture");
	shaderw2.SamplerUniform	 		= gl.getUniformLocation(shaderw2, "uSampler");

	shaderw3.vertexPositionAttribute 	= gl.getAttribLocation(shaderw3, "aVertexPosition");
	shaderw3.vertexTextAttribute 		= gl.getAttribLocation(shaderw3, "aVertexTexture");
	shaderw3.SamplerUniform	 		= gl.getUniformLocation(shaderw3, "uSampler");

	shaderw4.vertexPositionAttribute 	= gl.getAttribLocation(shaderw4, "aVertexPosition");
	shaderw4.vertexTextAttribute 		= gl.getAttribLocation(shaderw4, "aVertexTexture");
	shaderw4.SamplerUniform	 		= gl.getUniformLocation(shaderw4, "uSampler");
	*/

	if (shader.vertexPositionAttribute < 0 || shader.vertexTextAttribute < 0 ||
		shader.SamplerUniform < 0 || shader.fragContrast < 0 || shader.fragBrightness < 0 || shader.fragSaturation < 0) 
	{
		alert("Shader attribute ou uniform nao localizado!");
		return;
	}
		
	initBuffers(gl);
	initTexture(gl, shader);
	animate(gl, shader);

	/*initBuffers(glw1);
	initTexture(glw1, shaderw1);
	animate(glw1, shaderw1);

	initBuffers(glw2);
	initTexture(glw2, shaderw2);
	animate(glw2, shaderw2);

	initBuffers(glw3);
	initTexture(glw3, shaderw3);
	animate(glw3, shaderw3);

	initBuffers(glw4);
	initTexture(glw4, shaderw4);
	animate(glw4, shaderw4);*/
}

function animate(gl, shader) {
    requestAnimationFrame( animate );
	render();		
}

function render() {	
	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
		videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
		videoTexture.needsUpdate = true;
	}

	var fragBrightness	= gl.getUniformLocation(shader,"brightness");
	var fragContrast	= gl.getUniformLocation(shader,"contrast");
	var fragSaturation	= gl.getUniformLocation(shader,"saturation");
	var fragHue			= gl.getUniformLocation(shader,"hue");
	var fragPosterize	= gl.getUniformLocation(shader,"posterize");
	var fragWave		= gl.getUniformLocation(shader,"wave");
	var fragTime		= gl.getUniformLocation(shader,"time");
	var textureSize		= gl.getUniformLocation(shader,"u_textureSize");
	var fragWaveWidth 	= gl.getUniformLocation(shader,"waveWidth");

	gl.uniform2f(textureSize,gl.viewportWidth,gl.viewportHeight);
	gl.uniform1f(fragBrightness, brightness);
	gl.uniform1f(fragWaveWidth,waveWidth);
	gl.uniform1f(fragContrast, contrast);
	gl.uniform1f(fragSaturation, saturation);
	gl.uniform1f(fragHue, hue);
	gl.uniform1i(fragPosterize,posterize);
	gl.uniform1f(fragWave,wave);
	gl.uniform1f(fragTime,video.currentTime);
	//console.log(fragBrightness);

	kernelLocation = gl.getUniformLocation(shader, "u_kernel[0]");

  	
  	gl.uniform1fv(kernelLocation, kernel);

	drawScene();
}

function resetFilters()
{
	document.getElementById("filters").reset();
	brightness = 0.0;
	contrast = 0.0;
	saturation = 0.0;
	hue = 0.0;
	sharpness = 0.0;
	kernelLocation = null;
	posterize = 0;
	wave = 0;
	waveWidth = 25.0;	
}

function setPosterize(t)
{
	if(t.checked) posterize = 1;
	else posterize = 0;
}

function changeContrast (t) {
	contrast = t.value;
}
function changeBrightness (t) {
	brightness = t.value;
}
function changeWave (t) {
	wave = t.value;
}

function changeWaveWidth (t) {
	waveWidth = t.value;
}

function changeSaturation (t) {
	saturation = t.value;
}
function changeHue (t) {
	hue = t.value;
}
function changeSharpness (t) {
	sharpness = t.value;
	if (sharpness > 0.0) {
		kernel = kernels.unsharpen;
	}
	else if (sharpness < 0.0) {
		kernel = kernels.gaussianBlur;
	}
	else{
		kernel = kernels.normal;
	}
	kernelLocation = gl.getUniformLocation(shader, "u_kernel[0]");
	gl.uniform1fv(kernelLocation, kernel);
	drawScene();
}
