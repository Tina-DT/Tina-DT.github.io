var kiss = ( function() {

	function createVertexData() {
		var n = 32;
		var m = 20;

		// Positions.
		this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
		var vertices = this.vertices;
		// Normals.
		this.normals = new Float32Array(3 * (n + 1) * (m + 1));
		var normals = this.normals;
		// Index data.
		this.indicesLines = new Uint16Array(2 * 2 * n * m);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m);
		var indicesTris = this.indicesTris;

		var du = 2 * Math.PI / n;
		var dv = 2 / m;
		// Counter for entries in index array.
		var iLines = 0;
		var iTris = 0;

		// Loop angle u.
		for(var i = 0, u = 0; i <= n; i++, u += du) {
			// Loop angle v.
			for(var j = 0, v = -1; j <= m; j++, v += dv) {

				var iVertex = i * (m + 1) + j;

				//calculates the kiss object dimentions
				var x = (v * v * Math.sqrt(1-v)*Math.sin(u))/Math.sqrt(2.0);
				var y = 0.2 - (v/1.2);
				var z = (v * v * Math.sqrt(1-v)*Math.cos(u))/Math.sqrt(2.0);

				// Set vertex positions.
				vertices[iVertex * 3] = x;
				vertices[iVertex * 3 + 1] = y;
				vertices[iVertex * 3 + 2] = z;

				// Calc and set normals.
				var nx = (2*Math.sqrt(2)*(-1+v)*Math.sin(u))/
						Math.sqrt(-(-1+v)*(8+v*(-8+(4-5*v)*(4-5*v)*v)));
				var ny = ((4-5*v)*v)/Math.sqrt(8+v*(-8+(4-5*v)*(4-5*v)*v));
				var nz = (2*Math.sqrt(2)*(-1+v)*Math.cos(u))/
						Math.sqrt(-(-1+v)*(8+v*(-8+(4-5*v)*(4-5*v)*v)));
				
				normals[iVertex * 3] = nx;
				normals[iVertex * 3 + 1] = ny;
				normals[iVertex * 3 + 2] = nz;

				// if(i>14){
				// continue;
				// }

				// Set index.
				// Line on beam.
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - 1;
					indicesLines[iLines++] = iVertex;
				}
				// Line on ring.
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - (m + 1);
					indicesLines[iLines++] = iVertex;
				}

				// Set index.
				// Two Triangles.
				if(j > 0 && i > 0) {
					indicesTris[iTris++] = iVertex;
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
					//
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1) - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
				}
			}
		}
	}

	return {
		createVertexData : createVertexData
	}

}());
