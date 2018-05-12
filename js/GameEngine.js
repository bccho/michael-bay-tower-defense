// This file sets up the framework for game functionality, including a dictionary of lists of active instances,
// and utility methods for creating and destroying in-game objects

var GameEngine = GameEngine || {
    // Instance variables - global delta time, active instances
    _prev_t: undefined,
    _cur_t: undefined,
    _isRunning: false,
    _gameObjects: []
};

// Total fresh start
GameEngine.start = function() {
    this._prev_t = Date.now();
    this._cur_t  = Date.now();
    this._isRunning = true;
    this._gameObjects = [];

    Scene.removeObjects();
};

GameEngine.pause = function () {
    this._isRunning = !this._isRunning;
    this._prev_t = Date.now();
    this._cur_t  = Date.now();
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
    for (var obj in this._gameObjects) {
        if (obj instanceof gameObjectType)
            count++;
    }
    return count;
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


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  EMITTER FUNCTIONS                                                                                 //
////////////////////////////////////////////////////////////////////////////////////////////////////////

// Global time ignoring pauses
GameEngine.now = function() {
    return this._cur_t;
};

GameEngine.getEmitters = function() {
    return this._gameObjects["Emitter"] || [];
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  MAIN LOOP                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////

// main processing loop for the entire game - updates and renders
GameEngine.mainLoop = function() {
    var i;

    // determine deltaT
    this._cur_t = Date.now();
    var deltaT = (this._cur_t - this._prev_t) / 1000.0;
    this._prev_t = this._cur_t;

    if (this._isRunning) {
        // Update emitters
        var emitters = this.getEmitters();
        for (i = 0; i < emitters.length; i++) {
            var currEmitter = emitters[i];
            currEmitter.update(deltaT);

            // Kill emitters past lifespan
            if (currEmitter._lifespan !== undefined) {
                if (this.now() - currEmitter._created > currEmitter._lifespan) {
                    destroy(currEmitter);
                }
            }
        }

        // Update all game objects
        for (var i = 0; i < this._gameObjects.length; i++) {
            this._gameObjects[i].update(deltaT);
        }
        LevelManager.update(deltaT);

        // Update what's on the screen
        Renderer.update();
    }

    requestAnimationFrame(this.mainLoop.bind(this));
};
