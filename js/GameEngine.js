// This file sets up the framework for game functionality, including a dictionary of lists of active instances,
// and utility methods for creating and destroying in-game objects

var GameEngine = GameEngine || new ( function() {
    var _self = this;

    // Instance variables - global delta time, active instances
    _self._prev_t      = undefined;
    _self._cur_t       = undefined;
    _self._isRunning   = false;
    _self._gameObjects = [];

    _self.start = function() {
        _self._prev_t = Date.now();
        _self._cur_t  = Date.now();
        _self._isRunning = true;
        _self.gameObjects = [];

        ParticleEngine.start();
    };

    // creates game object, adds it to the list of in-game instances, adds to scene, and returns reference
    _self.createGameObject = function(gameObject) {
        var obj = new gameObject();
        _self.gameObjects.push(obj);
        Scene.add(obj.getModel());
        return obj;
    };

    // removes game object from list of in-game instances, removes from scene, and does not return reference
    _self.destroyGameObject = function(gameObject) {
        var index = _self.gameObjects.indexOf(gameObject);
        if (index > -1) {
            _self.gameObjects.splice(index, 1);
        }
        Scene.removeObject(gameObject.getModel());
    };

    _self.mainLoop = function() {

        // determine deltaT
        _self._cur_t = Date.now();
        var deltaT = (_self._cur_t - _self._prev_t) / 1000.0;
        _self._prev_t = _self._cur_t;
        if (!_self._isRunning) deltaT = 0.0;

        ParticleEngine.step(deltaT);

        Renderer.update();

        requestAnimationFrame( _self.mainLoop );
    };

    return _self;
})();