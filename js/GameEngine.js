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
    this.gameObjects = [];
    this.emitters = [];

    ParticleEngine.start();
};

// creates game object, adds it to the list of in-game instances, adds to scene, and returns reference
GameEngine.createGameObject = function(gameObject, kwargs) {
    var obj = new gameObject(kwargs);
    this.gameObjects.push(obj);
    Scene.addObject(obj.getModel());
    return obj;
};

GameEngine.createEmitter = function (emitter) {
    ParticleEngine.addEmitter(emitter);
    for ( i = 0 ; i < ParticleEngine._emitters.length ; ++i ) {
        if (ParticleEngine._emitters[i].alive === false)
        {
            continue;
        }
        Scene.addObject( ParticleEngine.getDrawableParticles( i ) );
    }
    this.emitters.push(emitter);
};

GameEngine.removeDeadEmitters = function () {
    for (var i = 0; i < this.emitters.length; i++)
    {
        var currEmitter = this.emitters[i];
        if (currEmitter.alive)
        {
            continue;
        }

        var index = this.emitters.indexOf(currEmitter);
        if (index > -1)
        {
            this.emitters.splice(index, 1);
        }
    }
};

// removes game object from list of in-game instances, removes from scene, and does not return reference
GameEngine.destroyGameObject = function(gameObject) {
    var index = this.gameObjects.indexOf(gameObject);
    if (index > -1) {
        this.gameObjects.splice(index, 1);
    }
    Scene.removeObject(gameObject.getModel());
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
