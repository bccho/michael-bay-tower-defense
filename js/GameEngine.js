// This file sets up the framework for game functionality, including a dictionary of lists of active instances,
// and utility methods for creating and destroying in-game objects

var GameEngine = GameEngine || {
    // Instance variables - global delta time, active instances
    _prev_t: undefined,
    _cur_t: undefined,
    _isRunning: false,
    _gameObjects: []
};

GameEngine.start = function() {
    this._prev_t = Date.now();
    this._cur_t  = Date.now();
    this._isRunning = true;
    this._gameObjects = {};

    ParticleEngine.start();
};

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

GameEngine.findGameObject = function(gameObjectType) {
    if (!(gameObjectType.name in this._gameObjects)) return;
    var list = this._gameObjects[gameObjectType.name];
};

GameEngine.mainLoop = function() {
    // determine deltaT
    this._cur_t = Date.now();
    var deltaT = (this._cur_t - this._prev_t) / 1000.0;
    this._prev_t = this._cur_t;
    if (!this._isRunning) deltaT = 0.0;

    ParticleEngine.step(deltaT);

    for (var i = 0; i < this.gameObjects.length; i++) {
        this.gameObjects[i].update(deltaT);
    }

    Renderer.update();

    requestAnimationFrame( this.mainLoop.bind(this) );
};
