// Terrain is a singleton object that keeps track of terrain, initializes and updates the mesh,
// and enables elevation queries.

var Terrain = Terrain || {
    _initialized: false
};

Terrain.initialize = function(kwargs) {
    kwargs = kwargs || {};
    // Defaults
    kwargs = setDefault(kwargs, "unitSize", 20);
    kwargs = setDefault(kwargs, "width", 20);
    kwargs = setDefault(kwargs, "height", 20);
    kwargs = setDefault(kwargs, "elevationInitializer", function(i, j) { return 0; });

    var def_mat = new THREE.MeshLambertMaterial({color: 0x444444, emissive: 0x222222, side: THREE.DoubleSide});
    kwargs = setDefault(kwargs, "material", def_mat);

    // Member attributes
    this._unitSize = kwargs.unitSize;
    this._width = kwargs.width; // width and height are number of vertices
    this._height = kwargs.height;
    this._material = kwargs.material;
    this._elevationInitializer = kwargs["elevationInitializer"];

    this._offset = new THREE.Vector3(-(this._unitSize * (this._width - 1)) / 2, 0, -(this._unitSize * (this._height - 1)) / 2);
    this._min = {x: this._offset.x, z: this._offset.z};
    this._max = {x: -this._offset.x, z: -this._offset.z};

    // Initialize elevation map
    this._elevationMap = [];
    for (var i = 0; i < this._width; i++) {
        this._elevationMap[i] = [];
        for (var j = 0; j < this._height; j++) {
            this._elevationMap[i][j] = this._elevationInitializer(i, j);
        }
    }

    // Create mesh: vertex positions, based on ClothInitializer
    this._positions = new THREE.BufferAttribute(new Float32Array(this._width * this._height * 3), 3);
    var idx = 0;
    for (j = 0; j < this._height; j++) {
        for (i = 0; i < this._width; i++) {
            var pos = new THREE.Vector3(i * this._unitSize, this._elevationMap[i][j], j * this._unitSize);
            pos.add(this._offset);
            setElement(idx, this._positions, pos);
            idx += 1;
        }
    }

    // Create mesh: faces, based on Emitter for cloth
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
    this._initialized = true;
};

Terrain.getModel = function() {
    return this._model;
};

// Grid elevation get and set operations; (i, j) are integer grid coordinates
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

// Converts from (x, y) world terrain coordinates (world coordinates x and z) to (i, j) grid coordinates
Terrain.xyToGrid = function(x, y) {
    x = (x - this._offset.x) / this._unitSize;
    y = (y - this._offset.z) / this._unitSize;
    return [x, y];
};

// Converts from (i, j) grid coordinates to (x, y) world terrain coordinates.
Terrain.gridToXY = function (i, j) {
    i = i * this._unitSize + this._offset.x;
    j = j * this._unitSize + this._offset.z;
    return [i, j];
};

// Linearly interpolates elevation map at (fractional) grid coordinates (i, j)
Terrain.interpolateElevation = function(i, j) {
    // Return undefined if outside elevation map bounds
    if (0 > i || i > this._width - 1 || 0 > j || j > this._height - 1) return undefined;

    // Find neighbor vertices
    var i0 = Math.floor(i); var i1 = Math.ceil(i);
    var j0 = Math.floor(j); var j1 = Math.ceil(j);
    var frac_i = i - i0; var frac_j = j - j0;
    var elev0 = lerp(this.getElevationGrid(i0, j0), this.getElevationGrid(i1, j0), frac_i);
    var elev1 = lerp(this.getElevationGrid(i0, j1), this.getElevationGrid(i1, j1), frac_i);
    var elev = lerp(elev0, elev1, frac_j);
    return elev;
};

Terrain.getElevation = function(x, y) {
    var i, j;
    [i, j] = this.xyToGrid(x, y);
    return this.interpolateElevation(i, j);
};

// Return a graph of the terrain used for navigation.
Terrain.getGraph = function () {
    var myMap = this._elevationMap;
    var g = new graphlib.Graph();
    var idToXY = {};
    var nodeId = 0;
    var destNodeID = [];
    var height = myMap[0].length;
    var width = myMap.length;
    for (var i = 0; i < myMap.length; i++) {
        for (var j = 0; j < myMap[0].length; j++) {
            nodeId = Terrain._getNodeId(i, j);

            // add to dictionary for client
            idToXY[nodeId] = this.gridToXY(i, j);

            // elevation work function
            var work = function(dest_i, dest_j) {
                var w_elev = Math.max(0, myMap[dest_i][dest_j] - myMap[i][j]);
                var w_dist = hypot(dest_i - i, dest_j - j) * Terrain._unitSize;
                return w_elev + w_dist;
                // return Math.abs(myMap[dest_i][dest_j] - myMap[i][j]);
            };

            // connect graph
            // if ((i + 1) < height) {
            //     g.setEdge(nodeId, Terrain._getNodeId(i + 1, j), work(i + 1, j));
            // }
            //
            // if ((i - 1) >= 0) {
            //     g.setEdge(nodeId, Terrain._getNodeId(i - 1, j), work(i - 1, j));
            // }
            //
            // if ((j + 1 < width)) {
            //     g.setEdge(nodeId, Terrain._getNodeId(i, j + 1), work(i, j + 1));
            // }
            //
            // if ((j - 1) >= 0) {
            //     g.setEdge(nodeId, Terrain._getNodeId(i, j - 1), work(i, j - 1));
            // }

            // 8-connect graph
            for (var di = -1; di <= 1; di++) {
                for (var dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    if (1 <= i + di && i + di < height - 1 &&
                        0 <= j + dj && j + dj < width) {
                        g.setEdge(nodeId, Terrain._getNodeId(i + di, j + dj), work(i + di, j + dj));
                    }
                }
            }

            if (j === width - 1) {
                destNodeID.push(nodeId);
            }

        }
    }

    return {g: g, idToXY: idToXY, destNodeID: destNodeID};
};

// Helper function. Should not be called by client
Terrain._getNodeId = function (i, j) {
    return String(this._height * i + j);
};

// TODO: morph operations on terrain...
