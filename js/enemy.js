// Enemy inherits from AnimatedGameObject
function Enemy(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._velocity = new THREE.Vector3();

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "velocity") {
            this._velocity = value;
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
    }

    kwargs = setDefault(kwargs, "heightAboveGround", 0);
    AnimatedGameObject.call(this, kwargs);

    return this;
}
Enemy.prototype = new AnimatedGameObject();

Enemy.prototype.update = function(deltaT) {
    this._position.add(this._velocity.clone().multiplyScalar(deltaT));

    // Call base method
    AnimatedGameObject.prototype.update.call(this, deltaT);
};


// Simple enemy for quick and dirty testing. Inherits from Enemy
function SimpleEnemy(kwargs) {
    kwargs = kwargs || {};
    var radius = 10.0;
    var phong = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
    var body = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), phong);
    body.position.set(0.0, radius, 0.0);

    kwargs = setDefault(kwargs, "meshes", [body]);
    Enemy.call(this, kwargs);

    return this;
}
SimpleEnemy.prototype = new Enemy();


// Horse animated enemy
function HorseEnemy(kwargs) {
    kwargs = kwargs || {};
    kwargs = setDefault(kwargs, "model_names", ["animated_models/horse.js"]);
    Enemy.call(this, kwargs);
}
HorseEnemy.prototype = new Enemy();

// Routing Enemy
function RouteEnemy(kwargs) {
    kwargs = kwargs || {};

    var radius = 10.0;
    var phong = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
    var body = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), phong);
    body.position.set(0.0, radius, 0.0);

    kwargs = setDefault(kwargs, "meshes", [body]);
    // kwargs = setDefault(kwargs, "model_names", ["animated_models/stork.js"]);
    kwargs = setDefault(kwargs, "speed", 25);
    Enemy.call(this, kwargs);

    this._wayPts = getWayPts(this._position.x, this._position.z);
    this._currDest = this._wayPts.pop();
    this._speed = kwargs.speed;

    return this;

}

// RouteEnemy.prototype = Object.create(Enemy.prototype);
// RouteEnemy.prototype.constructor = RouteEnemy;
RouteEnemy.prototype = new Enemy();

RouteEnemy.prototype.update = function (deltaT) {

    // find current x, z and see if in current range
    var currX = this._position.x;
    var currZ = this._position.z;
    var destX = this._currDest[0];
    var destY = this._currDest[1];
    if ((currX - destX) * (currX - destX) + (currZ - destY) * (currZ - destY) < 0.5 * 0.5)
    {
        // debugger;
        if (this._wayPts.length > 0)
        {
            this._currDest = this._wayPts.pop();
        }
        this._velocity = new THREE.Vector3();
    }

    else
    {
        this._velocity = new THREE.Vector3(destX - this._position.x, this._position.y, destY - this._position.z)
        this._velocity.normalize().multiplyScalar(this._speed); //TODO: add this as parameter
    }

    this._position.add(this._velocity.clone().multiplyScalar(deltaT));
    AnimatedGameObject.prototype.update.call(this, deltaT);
    // debugger;


};

// Helper function. Should not be called by client. Return an array of [x, y] positions
// for the RouteEnemy to hit (operate as stack). Args: x, y is the initial x, y
function getWayPts(x, y) {
    var gMaterials = Terrain.getGraph();
    var g = gMaterials["g"];
    var idToXY = gMaterials["idToXY"];
    var destNodeID = gMaterials["destNodeID"];

    // Find the starting node ID
    var startNode = "0";
    for (var key in idToXY)
    {
        if (!idToXY.hasOwnProperty(key))
        {
            continue;
        }

        var currPt = idToXY[key];
        var currX = currPt[0];
        var currY = currPt[1];
        // ASSUMPTION HERE that you start on a node location
        if (currX === x && currY === y)
        {
            startNode = key;
        }

    }

    function weight (e)
    {
        return g.edge(e);
    }

    var dijMaterials = graphlib.alg.dijkstra(g, startNode, weight);

    // find the nearest destination node
    var minDis = Infinity;
    var minNodeID = "";
    for (var i = 0; i < destNodeID.length; i++)
    {
        var currNodeID = destNodeID[i];
        var currDis = dijMaterials[currNodeID].distance;
        if (currDis < minDis)
        {
            minDis = currDis;
            minNodeID = currNodeID;
        }
    }

    // Find the route to that destination node
    var nodeIdStack = [];
    currNodeID = minNodeID;
    while (dijMaterials[currNodeID].predecessor !== undefined)
    {
        nodeIdStack.push(currNodeID);
        currNodeID = dijMaterials[currNodeID].predecessor;
    }

    // Helper method... wrapper object for mapping nodes back to xy coordinates
    function nodeIDToXY(nodeId) {
        return idToXY[nodeId];
    }

    // map node id's to xy
    var wayPtStack = nodeIdStack.map(nodeIDToXY);

    return wayPtStack;
}
