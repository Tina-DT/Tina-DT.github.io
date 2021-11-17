var rec_sphare = ( function() {

	function createVertexData() {
		var rekursionsStuffe = document.getElementById('rek').value;

		//drei Komponenten vektor
		var newVec3 = function(x,y,z) {
			return {
				x: x,
				y: y,
				z: z,
				a: x,
				b: y,
				c: z,
			}
		}

		//Normalisierung eines Vektors (eine Länge von 1)
		var normalize = function(vec) {
			var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
			return newVec3(vec.x / len, vec.y / len, vec.z / len);
		}

		var ecken = [];
		var flaechen = [];

		//Erstellen eines Grundkörpers
		ecken.push(normalize(newVec3( 0, -1,  0)));
		ecken.push(normalize(newVec3(-1,  0,  1)));
		ecken.push(normalize(newVec3( 1,  0,  1)));
		ecken.push(normalize(newVec3( 1,  0, -1)));
		ecken.push(normalize(newVec3(-1,  0, -1)));
		ecken.push(normalize(newVec3( 0,  1,  0)));

		flaechen.push(newVec3(0, 2, 1));
        flaechen.push(newVec3(0, 3, 2));
        flaechen.push(newVec3(0, 4, 3));
        flaechen.push(newVec3(0, 1, 4));
        flaechen.push(newVec3(1, 2, 5));
        flaechen.push(newVec3(2, 3, 5));
        flaechen.push(newVec3(3, 4, 5));
        flaechen.push(newVec3(4, 1, 5));

		//Algorithmus der Mittelpunkt zwischen 2 Punkten berechnet; 
		var rechneMittelpunkt = function(p1, p2) {
			var pkt1 = ecken[p1];
			var pkt2 = ecken[p2];
			var mittelpunkt = newVec3((pkt1.x + pkt2.x) / 2,
										(pkt1.y + pkt2.y) / 2,
										(pkt1.z + pkt2.z) / 2);
			ecken.push(normalize(mittelpunkt));
			return ecken.length - 1;//neuen Punkt Nummer zurückgeben
		}

		//Rekursive Berechnung der neuen Punkte und Flächen
		var rechneNeueFlaechen = function(flaecheAktu, schritt) {
			if (schritt == 0)
				return flaecheAktu; //Abbruchbedingung
			var flaechenNeu = [];
			for (var i = 0; i < flaecheAktu.length; i++) { 
				var drei = flaecheAktu[i];
				var neu1 = rechneMittelpunkt(drei.a, drei.b);
				var neu2 = rechneMittelpunkt(drei.b, drei.c);
				var neu3 = rechneMittelpunkt(drei.c, drei.a);

				flaechenNeu.push(newVec3(drei.a,   neu1, neu3));
				flaechenNeu.push(newVec3(  neu1, drei.b, neu2));
				flaechenNeu.push(newVec3(  neu3,   neu2, drei.c));
				flaechenNeu.push(newVec3(  neu1,   neu2, neu3));
			}
			return rechneNeueFlaechen(flaechenNeu, schritt - 1);
		}

		//Aufruf der rekursive Berechnung
		flaechen = rechneNeueFlaechen(flaechen, rekursionsStuffe);

		// Positions.
		this.vertices = new Float32Array(3 * ecken.length);
		var vertices = this.vertices;
		// Normals.
		this.normals = new Float32Array(3 * ecken.length);
		var normals = this.normals;
		// Index data.
		this.indicesLines = new Uint16Array(6 * flaechen.length);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * flaechen.length);
		var indicesTris = this.indicesTris;

		//Überstragung der Ecken ins vertices Array und normalen Array
		for (var i = 0; i < ecken.length; i++)
		{
			vertices[i * 3]     = ecken[i].x;
			vertices[i * 3 + 1] = ecken[i].y;
			vertices[i * 3 + 2] = ecken[i].z - 1.5;

			normals[i * 3]     = ecken[i].x;
			normals[i * 3 + 1] = ecken[i].y;
			normals[i * 3 + 2] = ecken[i].z;
		}

		//Übertragung der Fläschen zu der indicies Arrays für Linien und Dreiecke
		for (var i = 0; i < flaechen.length; i++)
		{
			indicesLines[i * 6]     = flaechen[i].a;
			indicesLines[i * 6 + 1] = flaechen[i].b;
			indicesLines[i * 6 + 2] = flaechen[i].b;
			indicesLines[i * 6 + 3] = flaechen[i].c;
			indicesLines[i * 6 + 4] = flaechen[i].c;
			indicesLines[i * 6 + 5] = flaechen[i].a;

			indicesTris[i * 3]     = flaechen[i].a;
			indicesTris[i * 3 + 1] = flaechen[i].b;
			indicesTris[i * 3 + 2] = flaechen[i].c;
		}
	}

	return {
		createVertexData : createVertexData
	}

}());
