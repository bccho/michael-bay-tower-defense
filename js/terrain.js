var Terrain = Terrain || {};

Terrain.initialize = function(kwargs) {
    kwargs = kwargs || {};
    // Defaults
    kwargs = setDefault(kwargs, "unitSize", 20);
    kwargs = setDefault(kwargs, "width", 20);
    kwargs = setDefault(kwargs, "height", 20);

    var def_mat = new THREE.MeshLambertMaterial({color: 0x444444, emissive: 0x222222, side: THREE.DoubleSide});
    kwargs = setDefault(kwargs, "material", def_mat);

    this._unitSize = kwargs.unitSize;
    this._width = kwargs.width; // width and height are number of vertices
    this._height = kwargs.height;
    this._material = kwargs.material;

    this._offset = new THREE.Vector3(-(this._unitSize * (this._width - 1)) / 2, 0, -(this._unitSize * (this._height - 1)) / 2);

    // Initialize elevation map
    this._elevationMap = [];
    for (var i = 0; i < this._width; i++) {
        this._elevationMap[i] = [];
        for (var j = 0; j < this._height; j++) {
            this._elevationMap[i][j] = 0; // TODO: elevation initialization function
        }
    }

    // Create mesh: vertex positions
    this._positions = new THREE.BufferAttribute(new Float32Array(this._width * this._height * 3), 3);
    var idx = 0;
    for (i = 0; i < this._width; i++) {
        for (j = 0; j < this._height; j++) {
            var pos = new THREE.Vector3(i * this._unitSize, this._elevationMap[i][j], j * this._unitSize);
            pos.add(this._offset);
            setElement(idx, this._positions, pos);
            idx += 1;
        }
    }

    // Create mesh: faces
    var indices = new Uint16Array( (this._width - 1) * (this._height - 1) * 6 );
    idx = 0;
    for (i = 0; i < this._width - 1; i++) {
        for (j = 0; j < this._height - 1; j++) {
            indices[6 * idx     ] = j * this._width + i + 1;
            indices[6 * idx + 1 ] = (j + 1) * this._width + i;
            indices[6 * idx + 2 ] = j * this._width + i;

            indices[6 * idx + 3 ] = j * this._width + i + 1;
            indices[6 * idx + 4 ] = (j + 1) * this._width + i + 1;
            indices[6 * idx + 5 ] = (j + 1) * this._width + i;

            idx += 1;
        }
    }

    // Create mesh: geometry and model
    this._geometry = new THREE.BufferGeometry();
    this._geometry.addAttribute("position", this._positions);
    this._geometry.addAttribute("index", new THREE.BufferAttribute(indices, 3));
    this._geometry.computeVertexNormals();

    this._model = new THREE.Mesh(this._geometry, this._material);
};

Terrain.getModel = function() {
    return this._model;
};

Terrain.getElevationGrid = function(i, j) {
    return this._elevationMap[i][j];
};

Terrain.setElevationGrid = function(i, j, elevation) {
    this._elevationMap[i][j] = elevation;
    var idx = this._height * i + j;
    var pos = getElement(idx, this._positions);
    pos.y = elevation;
    setElement(idx, this._positions, pos);

    this._geometry.computeVertexNormals();
};

// TODO: convert from (x, y) to (i, j)
// TODO: interpolate elevation
// TODO: morph operations on terrain...
