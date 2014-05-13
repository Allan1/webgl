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
var kernel_config = 'normal';
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
    blur: [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0
    ]
};
var video, videoContext, videoTexture;
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
function initBuffers() {
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
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
	videoTexture.needsUpdate = false;
	videoEffects();	

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
function initTexture() {

	videoTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);		
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
	canvas = document.getElementById("videoGL");
	gl = initGL(canvas);
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
	}
	shader = initShaders("shader", gl);
	if (shader == null) {
		alert("Erro na inicilizacao do shader!!");
		return;
		}

	shader.vertexPositionAttribute 	= gl.getAttribLocation(shader, "aVertexPosition");
	shader.vertexTextAttribute 		= gl.getAttribLocation(shader, "aVertexTexture");
	if(shader.vertexPositionAttribute >= 0 && shader.vertexTextAttribute >= 0 && setShaderUniform()) 
	{
		initBuffers(shader);
		initTexture();
		animate(shader);
	}

	else
	{
		alert("Shader attribute ou uniform nao localizado! Ver console");
		console.log(shader);
		return;
	}
}

function animate(shader) {
    requestAnimationFrame( animate );
	render();		
}

function setShaderUniform() 
{
	shader.texture 		  = gl.getUniformLocation(shader,"texture");
	shader.brightness	  = gl.getUniformLocation(shader,"brightness");
	shader.contrast		  = gl.getUniformLocation(shader,"contrast");
	shader.saturation	  = gl.getUniformLocation(shader,"saturation");
	shader.hue			  = gl.getUniformLocation(shader,"hue");
	shader.posterize	  = gl.getUniformLocation(shader,"posterize");
	shader.wave			  = gl.getUniformLocation(shader,"wave");
	shader.videoTime	  = gl.getUniformLocation(shader,"time");
	shader.textureSize	  = gl.getUniformLocation(shader,"u_textureSize");
	shader.waveWidth 	  = gl.getUniformLocation(shader,"waveWidth");
	shader.kernelLocation = gl.getUniformLocation(shader,"u_kernel[0]");
	if(shader.texture && shader.brightness && shader.contrast && shader.saturation &&
		shader.hue && shader.posterize && shader.wave && shader.videoTime &&
		shader.textureSize && shader.waveWidth && shader.kernelLocation)
		return true;
	return false;
}

function videoEffects()
{
	gl.uniform2f(shader.textureSize,gl.viewportWidth,gl.viewportHeight);
	gl.uniform1f(shader.brightness, brightness);
	gl.uniform1f(shader.waveWidth,waveWidth);
	gl.uniform1f(shader.contrast, contrast);
	gl.uniform1f(shader.saturation, saturation);
	gl.uniform1f(shader.hue, hue);
	gl.uniform1i(shader.posterize,posterize);
	gl.uniform1f(shader.wave,wave);
	gl.uniform1f(shader.videoTime,video.currentTime);
  	gl.uniform1fv(shader.kernelLocation, kernels[kernel_config]);
}

function render() 
{	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
		video.play();
		videoTexture.needsUpdate = true;
	}
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
	kernel_config = 'normal';
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
		kernel_config = 'unsharpen';
	}
	else if (sharpness < 0.0) {
		kernel_config = 'blur';
	}
	else{
		kernel_config = 'normal';
	}
}
