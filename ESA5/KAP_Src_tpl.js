var app = ( function() {

	var gl;

	// The shader program object is also used to
	// store attribute and uniform locations.
	var prog;

	// Array of model objects.
	var models = [];

	var camera = {
		// Initial position of the camera.
		eye : [0, 1, 4],
		// Point to look at.
		center : [0, 0, 0],
		// Roll and pitch of the camera.
		up : [0, 1, 0],
		// Opening angle given in radian.
		// radian = degree*2*PI/360.
		fovy : 60.0 * Math.PI / 180,
		// Camera near plane dimensions:
		// value for left right top bottom in projection.
		lrtb : 2.0,
		// View matrix.
		vMatrix : mat4.create(),
		// Projection matrix.
		pMatrix : mat4.create(),
		// Projection types: ortho, perspective, frustum.
		projectionType : "ortho",
		// Angle to Z-Axis for camera when orbiting the center
		// given in radian.
		zAngle : 0,
		// Distance in XZ-Plane from center when orbiting.
		distance : 4,

		aspect: 1,
	};

	function start() {
		init();
		render();
	}

	function init() {
		initWebGL();
		initShaderProgram();
		initUniforms()
		initModels();
		initEventHandler();
		initPipline();
	}

	function initWebGL() {
		// Get canvas and WebGL context.
		canvas = document.getElementById('canvas');
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}

	/**
	 * Init pipeline parameters that will not change again.
	 * If projection or viewport change, their setup must
	 * be in render function.
	 */
	function initPipline() {
		gl.clearColor(.95, .95, .95, 1);

		// Backface culling.
		gl.frontFace(gl.CCW);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		// Depth(Z)-Buffer.
		gl.enable(gl.DEPTH_TEST);

		// Polygon offset of rastered Fragments.
		gl.enable(gl.POLYGON_OFFSET_FILL);
		gl.polygonOffset(0.5, 0);

		// Set viewport.
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

		// Init camera.
		// Set projection aspect ratio.
		camera.aspect = gl.viewportWidth / gl.viewportHeight;
	}

	function initShaderProgram() {
		// Init vertex shader.
		var vs = initShader(gl.VERTEX_SHADER, "vertexshader");
		// Init fragment shader.
		var fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
		// Link shader into a shader program.
		prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.bindAttribLocation(prog, 0, "aPosition");
		gl.linkProgram(prog);
		gl.useProgram(prog);
	}

	/**
	 * Create and init shader from source.
	 * 
	 * @parameter shaderType: openGL shader type.
	 * @parameter SourceTagId: Id of HTML Tag with shader source.
	 * @returns shader object.
	 */
	function initShader(shaderType, SourceTagId) {
		var shader = gl.createShader(shaderType);
		var shaderSource = document.getElementById(SourceTagId).text;
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(SourceTagId+": "+gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	}

	function initUniforms() {
		// Projection Matrix.
		prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

		// Model-View-Matrix.
		prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");
	}

	function initModels() {
		// fill-style
		var fs = "fillwireframe";
		createModel("water", fs);
		createModel("kiss", fs);
		createModel("rec_sphare", fs);
		createModel("plane", "wireframe");
	}

	/**
	 * Create model object, fill it and push it in models array.
	 * 
	 * @parameter geometryname: string with name of geometry.
	 * @parameter fillstyle: wireframe, fill, fillwireframe.
	 */
 function createModel(geometryname, fillstyle) {
		var model = {};
		model.fillstyle = fillstyle;
		initDataAndBuffers(model, geometryname);
		// Create and initialize Model-View-Matrix.
		model.mvMatrix = mat4.create();

		models.push(model);
	}

	/**
	 * Init data and buffers for model object.
	 * 
	 * @parameter model: a model object to augment with data.
	 * @parameter geometryname: string with name of geometry.
	 */
	function initDataAndBuffers(model, geometryname) {
		// Provide model object with vertex data arrays.
		// Fill data arrays for Vertex-Positions, Normals, Index data:
		// vertices, normals, indicesLines, indicesTris;
		// Pointer this refers to the window.
		this[geometryname]['createVertexData'].apply(model);

		// Setup position vertex buffer object.
		model.vboPos = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
		// Bind vertex buffer to attribute variable.
		prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
		gl.enableVertexAttribArray(prog.positionAttrib);

		// Setup normal vertex buffer object.
		model.vboNormal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
		// Bind buffer to attribute variable.
		prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
		gl.enableVertexAttribArray(prog.normalAttrib);

		// Setup lines index buffer object.
		model.iboLines = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
			gl.STATIC_DRAW);
		model.iboLines.numberOfElements = model.indicesLines.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		// Setup triangle index buffer object.
		model.iboTris = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris,
			gl.STATIC_DRAW);
		model.iboTris.numberOfElements = model.indicesTris.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	function initEventHandler() {
		document.getElementById("rekBtn").addEventListener("click", function() {
			models = [];
			initModels();
			render();
		});
		var inputRek = document.getElementById("rek");
		inputRek.addEventListener("keyup", function() {
			if(inputRek.value>7)
				inputRek.value='7';
			else if(inputRek.value<0)
				inputRek.value='0';
		});

		// Rotation step.
        var deltaRotate = Math.PI / 36;
		var deltaTranslate = 0.05;

		window.onkeydown = function(evt) {
			// Use shift key to change sign.
            var sign = evt.shiftKey ? -1 : 1;
			var key = evt.which ? evt.which : evt.keyCode;
			var c = String.fromCharCode(key);
			// console.log(evt);

			// Change projection of scene.
			switch(c) {
				case('O'):
					camera.projectionType = "ortho"; // Turn on the othoganl view mode on, with keytrokes W, S, A, B and D
					camera.lrtb = 2;
					break;
				case('F'):
					camera.projectionType = "frustum"; // Turn on the frustum view mode on, where keytroke B and Shift+B can be used
					break;
				case('P'):
					camera.projectionType = "perspective"; //Turn the perspektiv view mode on, with additional keytroke V and Shift+V, but keystroke B is not working
					break;
				case('W'):
					camera.eye[1] += deltaTranslate; //Move the camera to the top
					break;
				case('S'):
					camera.eye[1] -= deltaTranslate; //Move the camera to the bottom
					break;
				case('A'):
					camera.zAngle -= deltaRotate; //Move the camera to the left
					break;
				case('D'):
					camera.zAngle += deltaRotate; //Move the camera to the right
					break;
				case('C'):
                    // Orbit camera.
                    camera.zAngle += sign * deltaRotate; //Keystroke C has the same movement of the camera as keystroke A and Shift+C has the same movement of the camera as keystroke D
                    break;
				case('Q'):
					camera.distance -= sign * deltaTranslate; //Keystroke Q changes the distance of the camera to the point it looks at
					break;
				case('E'):
					camera.distance += sign * deltaTranslate; //Keystroke E changes the distance of the camera to the point it looks at in the opposite direction to Q
					break;
				case('V'):
					camera.fovy += sign * 5 * Math.PI / 180; //Keystroke V and Shift+V changes the perspective view only in perspective mode (turn on perspective mode with keystroke P)
					break;
				case('B'):
					camera.lrtb += sign * 0.1; //Keystroke B and Shift+B changes the left right top bottom
					break;
			}

			// Render the scene again on any key pressed.
			render();
		};
	}

	/**
	 * Run the rendering pipeline.
	 */
	function render() {
		// Clear framebuffer and depth-/z-buffer.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		setProjection();

		camera.eye[0] = camera.center[0];
        camera.eye[2] = camera.center[2];
        camera.eye[0] += camera.distance * Math.sin(camera.zAngle);
        camera.eye[2] += camera.distance * Math.cos(camera.zAngle);
		
		// lookAt calculates the view Matrix with initial camera position with look at point, where also the roll and pitch of the camera is defined
		mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

		// Loop over models.
		for(var i = 0; i < models.length; i++) {
			// Update modelview for model.
			mat4.copy(models[i].mvMatrix, camera.vMatrix);

			// Set uniforms for model.
			gl.uniformMatrix4fv(prog.mvMatrixUniform, false,
				models[i].mvMatrix);
			
			draw(models[i]);
		}
	}

	function setProjection() {
		// Set projection Matrix.
		switch(camera.projectionType) {
			case("ortho"): //here the orthogonal view mode ist set up, where the projection matrix is calculated
				var v = camera.lrtb;
				mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
				break;
			case("frustum"): //here the furstum view mode ist set up, where the projection matrix is calculated
                var v = camera.lrtb;
                mat4.frustum(camera.pMatrix, -v/2, v/2, -v/2, v/2, 1, 10);
                break;
            case("perspective"): //here the perspective view mode ist set up, where the projection matrix is calculated
                mat4.perspective(camera.pMatrix, camera.fovy, 
                    camera.aspect, 1, 10);
                break;
		}
		// Set projection uniform.
		gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
	}

	function draw(model) {
		// Setup position VBO.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.vertexAttribPointer(prog.positionAttrib,3,gl.FLOAT,false,0,0);

		// Setup normal VBO.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.vertexAttribPointer(prog.normalAttrib,3,gl.FLOAT,false,0,0);

		// Setup rendering tris.
		var fill = (model.fillstyle.search(/fill/) != -1);
		if(fill) {
			gl.enableVertexAttribArray(prog.normalAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
			gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements,
				gl.UNSIGNED_SHORT, 0);
		}

		// Setup rendering lines.
		var wireframe = (model.fillstyle.search(/wireframe/) != -1);
		if(wireframe) {
			gl.disableVertexAttribArray(prog.normalAttrib);
			gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
			gl.drawElements(gl.LINES, model.iboLines.numberOfElements,
				gl.UNSIGNED_SHORT, 0);
		}
	}

	// App interface.
	return {
		start : start
	}

}());
