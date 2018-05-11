// This file sets up the framework for game functionality, including a dictionary of lists of active instances,
// and utility methods for creating and destroying in-game objects

var GameEngine = GameEngine || {
    // Instance variables - global delta time, active instances
    _prev_t: undefined,
    _cur_t: undefined,
    _isRunning: false,
    _gameObjects: [],
};

GameEngine.start = function() {
    this._prev_t = Date.now();
    this._cur_t  = Date.now();
    this._isRunning = true;
    this._gameObjects = {};
    this._emitters = [];

    ParticleEngine.start();
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  GAME OBJECT FUNCTIONS                                                                             //
////////////////////////////////////////////////////////////////////////////////////////////////////////

// creates game object, adds it to the list of in-game instances, adds to scene, and returns reference
GameEngine.createGameObject = function(gameObjectType, kwargs) {
    var obj = new gameObjectType(kwargs);

    if (!(gameObjectType.name in this._gameObjects))   // add list of instances of type
        this._gameObjects[gameObjectType.name] = [];
    this._gameObjects[gameObjectType.name].push(obj);  // add instance to correct list

    Scene.addObject(obj.getModel());
    return obj;
};

// removes game object from list of in-game instances, removes from scene, and does not return reference
GameEngine.destroyGameObject = function(gameObjectRef) {
    if (!(gameObjectRef.constructor.name in this._gameObjects)) return;

    var index = this._gameObjects[gameObjectRef.constructor.name].indexOf(gameObjectRef);
    if (index > -1) {
        this._gameObjects[gameObjectRef.constructor.name].splice(index, 1);
    }
    Scene.removeObject(gameObjectRef.getModel());
};

// locates the ith instance of a particular type of GameObject - returns undefined if no such instance
GameEngine.findGameObject = function(gameObjectType, i) {
    if (!(gameObjectType.name in this._gameObjects)) return undefined;
    if (i < 0 || i >= this._gameObjects[gameObjectType.name].length) return undefined;
    return this._gameObjects[gameObjectType.name][i];
};

// determines the index in the game object list of the instance nearest some position
GameEngine.findNearestGameObject = function(gameObjectType, position) {
    if (!(gameObjectType.name in this._gameObjects)) return undefined;
    var minDist = Number.POSITIVE_INFINITY;
    var minIndex = 0;
    var list = this._gameObjects[gameObjectType.name];
    for (var i = 0; i < list.length; i++) {
        var dist = list[i]._position.distanceToSquared(position);
        if (dist < minDist) {
            minDist = dist;
            minIndex = i;
        }
    }
    return findGameObject(gameObjectType, i);
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  EMITTER FUNCTIONS                                                                                 //
////////////////////////////////////////////////////////////////////////////////////////////////////////

// creates a particle emitter and places it in the scene
GameEngine.createEmitter = function (emitter) {
    ParticleEngine.addEmitter(emitter);
    for (var i = 0 ; i < ParticleEngine._emitters.length ; ++i ) {
        if (ParticleEngine._emitters[i].alive === false)
        {
            continue;
        }
        Scene.addObject( ParticleEngine.getDrawableParticles( i ) );
    }
    this._emitters.push(emitter);
};

// removes all inactive emitters
GameEngine.removeDeadEmitters = function () {
    for (var i = 0; i < this._emitters.length; i++) {
        var currEmitter = this._emitters[i];
        if (currEmitter.alive) {
            continue;
        }

        var index = this._emitters.indexOf(currEmitter);
        if (index > -1) {
            this._emitters.splice(index, 1);
        }
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
//  MAIN LOOP                                                                                         //
////////////////////////////////////////////////////////////////////////////////////////////////////////

// main processing loop for the entire game - updates and renders
GameEngine.mainLoop = function() {

    // determine deltaT
    this._cur_t = Date.now();
    var deltaT = (this._cur_t - this._prev_t) / 1000.0;
    this._prev_t = this._cur_t;
    if (!this._isRunning) deltaT = 0.0;

    // update all particles
    ParticleEngine.step(deltaT);

    // update all game objects
    for (var key in this._gameObjects) {
        var list = this._gameObjects[key];
        for (var i = 0; i < list.length; i++) {
            list[i].update(deltaT);
        }
    }

    // update what's on the screen
    Renderer.update();

    requestAnimationFrame( this.mainLoop.bind(this) );
};
