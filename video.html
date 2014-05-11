
<html>

<head>
<title>MATA65 - Computação Gráfica</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8">

<script id="shader-vs" type="x-shader/x-vertex">
	attribute vec3 aVertexPosition;
	attribute vec2 aVertexTexture;
		
	varying vec2 vTextureCoord;
	
	void main(void) {
		gl_Position = vec4(aVertexPosition, 1.0);
		vTextureCoord = aVertexTexture;
	}
</script>

<script id="shader-fs" type="x-shader/x-fragment">
	precision mediump float;
		
	uniform sampler2D uSampler;
	
	varying vec2 vTextureCoord;
	uniform vec2 u_textureSize;
	uniform float u_kernel[9];
		
	void main(void) {	
		vec4 c = texture2D(uSampler, vTextureCoord);

		vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
	   vec4 colorSum =
	     texture2D(uSampler, vTextureCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
	     texture2D(uSampler, vTextureCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;
	   float kernelWeight =
	     u_kernel[0] +
	     u_kernel[1] +
	     u_kernel[2] +
	     u_kernel[3] +
	     u_kernel[4] +
	     u_kernel[5] +
	     u_kernel[6] +
	     u_kernel[7] +
	     u_kernel[8] ;
	 
	   if (kernelWeight <= 0.0) {
	     kernelWeight = 1.0;
	   }
	 
	   // Divide the sum by the weight but just use rgb
	   // we'll set alpha to 1.0
	   vec4 c2 = vec4((colorSum / kernelWeight).rgb, 1.0);

	   c = c2;

	   //Brilho
	   float brilho = 0.0;
	    c.rgb += brilho;

	    //Contraste
	    float contrast = 0.0;
	    if(contrast > 0.0)
	      c.rgb = (c.rgb-0.5)/(1.0-contrast) + 0.5;
	    else
	      c.rgb = (c.rgb-0.5)*(1.0+contrast) + 0.5;

	    //Saturação
	    float saturation = 0.0;
	    float avg = (c.r+c.g+c.b)/3.0;
	    if(saturation > 0.0)
	      c.rgb += (avg - c.rgb) * (1.0 - 1.0/(1.001 - saturation));
	    else
	      c.rgb += (avg - c.rgb) * (-saturation);

	    gl_FragColor = c;

	}
</script>

<script type="text/javascript" src="webgl-utils.js"></script>
<script type="text/javascript" src="scripts/webgl-utils.js"></script>
<script type="text/javascript" src="scripts/shaders.js"></script>
<script type="text/javascript" src="video.js"></script>

</head>

<body onload="webGLStart();">
    <h1>Trabalho</h1><br />
    <p>Captura e manipulação de video em WebGL.</p>
    <br/>
    <div id="output"> </div>
    <br/>
	<canvas id="videoGL" width="320" height="240" style="visibility: visible;"></canvas>
	<video id="monitor" autoplay width="320" height="240" style="visibility: hidden;"></video>
	<canvas id="videoImage" width="256" height="256" style="visibility: hidden;"></canvas>
</body>

</html>
