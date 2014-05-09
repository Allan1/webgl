var vPosBuff;
var vTexBuff;
var texture=null;
var textures=null;

// ********************************************************
// ********************************************************
function initGL(canvas) {
	
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return (null);
		}
	
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
	vPosBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vPosBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
	vPosBuff.itemSize = 3;
	vPosBuff.numItems = vPos.length/vPosBuff.itemSize;
		
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
	vTexBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vTexBuff);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTex), gl.STATIC_DRAW);
	vTexBuff.itemSize = 2;
	vTexBuff.numItems = vTex.length/vTexBuff.itemSize;
}

// ********************************************************
// ********************************************************
function drawScene(gl, shader) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
   	gl.useProgram(shader);
   	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textures[0]);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textures[1]);	

	gl.uniform1i(shader.SamplerUniform, 0);
	gl.uniform1i(shader.SamplerUniform2, 1);

	gl.enableVertexAttribArray(shader.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vPosBuff);
	gl.vertexAttribPointer(shader.vertexPositionAttribute, vPosBuff.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(shader.vertexTextAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vTexBuff);
	gl.vertexAttribPointer(shader.vertexTextAttribute, vTexBuff.itemSize, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, vPosBuff.numItems);
}

// ********************************************************
// ********************************************************
function initTexture(gl, shader) {
	var textures = [];
	

	texture = gl.createTexture();
	
	var image = new Image();
	image.onload = function(){
		var canvas 			= document.getElementById("filtro");
		
		canvas.width 		= image.width;
		canvas.height 		= image.height;
		gl.viewportWidth 	= canvas.width;
		gl.viewportHeight 	= canvas.height;
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		//drawScene(gl, shader);
	}
	image.src = "lena.png";


	// create 2 textures
	  
	var image2 = new Image();
  	image2.src = "bg.png";
	var images = [];
	images.push(image);
	images.push(image2);
	//console.log(images);
	textures.push(texture);
	

    var texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[1]);
 
    // add the texture to the array of textures.
    textures.push(texture);
  	
	drawScene(gl, shader);
}

// ********************************************************
// ********************************************************
function webGLStart() {

	var canvas = document.getElementById("filtro");
	var gl = initGL(canvas);
	
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
		}
		
	var shader = initShaders("filtro", gl);
	if (shader == null) {
		alert("Erro na inicilizacao do shader!!");
		return;
		}

	shader.vertexPositionAttribute 	= gl.getAttribLocation(shaderProgram, "aVertexPosition");
	shader.vertexTextAttribute 		= gl.getAttribLocation(shaderProgram, "aVertexTexture");
	shader.SamplerUniform	 		= gl.getUniformLocation(shader, "uSampler");
	shader.SamplerUniform2	 		= gl.getUniformLocation(shader, "uSampler2");

	if ( 	(shader.vertexPositionAttribute < 0) ||
			(shader.vertexTextAttribute < 0) ||
			(shader.SamplerUniform < 0) ) {
		alert("Shader attribute ou uniform nao localizado!");
		return;
		}
	initBuffers(gl);
	initTexture(gl, shader);
}
