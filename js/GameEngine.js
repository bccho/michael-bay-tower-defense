// This file sets up the framework for game functionality, including a dictionary of lists of active instances,
// and utility methods for creating and destroying in-game objects

var GameEngine = GameEngine || {
    // Instance variables - global delta time, active instances
    _prev_t: undefined,
    _time: undefined,
    _isRunning: false,
    _gameObjects: []
};

// Total fresh start
GameEngine.start = function() {
    this._prev_t = Date.now();
    this._time  = 0;
    this._isRunning = true;
    this._gameObjects = [];

    Scene.removeObjects();
};

GameEngine.pause = function () {
    this._isRunning = !this._isRunning;
    this._prev_t = Date.now();
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  GAME OBJECT FUNCTIONS                                                                             //
////////////////////////////////////////////////////////////////////////////////////////////////////////

// creates a game object, adds to the list of in-game instances, adds to scene, and returns reference
GameEngine.createGameObject = function(gameObjectType, kwargs) {
    var obj = new gameObjectType(kwargs);
    this._gameObjects.push(obj);  // add instance to list
    Scene.addObject(obj.getModel());
    return obj;
};

// removes game object from list of in-game instances, removes from scene, and does not return reference
GameEngine.destroyGameObject = function(gameObjectRef) {
    var index = this._gameObjects.indexOf(gameObjectRef);
    if (index > -1) {
        this._gameObjects.splice(index, 1);
    }
    Scene.removeObject(gameObjectRef.getModel());
};

// returns number of game objects of a given type currently in game
GameEngine.numGameObject = function(gameObjectType) {
    var count = 0;
    for (var i = 0; i < this._gameObjects.length; i++) {
        if (this._gameObjects[i] instanceof gameObjectType)
            count++;
    }
    return count;
};

// returns list of all game objects of a given type
GameEngine.findAllGameObjects = function(gameObjectType) {
    var list = [];
    for (var i = 0; i < this._gameObjects.length; i++) {
        var obj = this._gameObjects[i];
        if (obj instanceof gameObjectType) {
            list.push(obj);
        }
    }
    return list;
};

// locates the ith instance of a particular type of GameObject - returns undefined if no such instance
GameEngine.findGameObject = function(gameObjectType, i) {
    if (i < 0 || i >= this._gameObjects.length) return undefined;
    return this._gameObjects[i];
};

// determines the index in the game object list of the instance nearest some position
GameEngine.findNearestGameObject = function(gameObjectType, position) {
    var minDist = Number.POSITIVE_INFINITY;
    var minIndex = -1;
    for (var i = 0; i < this._gameObjects.length; i++) {
        if (! (this._gameObjects[i] instanceof gameObjectType)) continue;

        var dist = this._gameObjects[i]._position.distanceToSquared(position);
        if (dist < minDist) {
            minDist = dist;
            minIndex = i;
        }
    }
    return this.findGameObject(gameObjectType, minIndex);
};

// Global time ignoring pauses
GameEngine.now = function() {
    return this._time;
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  EMITTER FUNCTIONS                                                                                 //
////////////////////////////////////////////////////////////////////////////////////////////////////////

GameEngine.getEmitters = function() {
    return this.findAllGameObjects(Emitter);
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  MAIN LOOP                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////

// main processing loop for the entire game - updates and renders
GameEngine.mainLoop = function() {
    var i;

    // determine deltaT
    var cur_t = Date.now();
    var deltaT = (cur_t - this._prev_t) / 1000.0;
    this._time += deltaT;
    this._prev_t = cur_t;

    if (this._isRunning) {
        // Update emitters
        var emitters = this.getEmitters();
        for (i = 0; i < emitters.length; i++) {
            var currEmitter = emitters[i];
            currEmitter.update(deltaT);
        }

        // Update all game objects
        for (i = 0; i < this._gameObjects.length; i++) {
            this._gameObjects[i].update(deltaT);
        }
        LevelManager.update(deltaT);

        // Update what's on the screen
        Renderer.update();
    }

    requestAnimationFrame(this.mainLoop.bind(this));
};
