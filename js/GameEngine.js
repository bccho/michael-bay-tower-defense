// This file sets up the framework for game functionality, including a dictionary of lists of active instances,
// and utility methods for creating and destroying in-game objects

var GameEngine = GameEngine || new ( function() {
    var _self = this;

    // Instance variables - global delta time, active instances
    _self._prev_t     = undefined;
    _self._cur_t      = undefined;
    _self._isRunning  = false;

    _self.start = function() {
        _self._prev_t = Date.now();
        _self._cur_t  = Date.now();
        _self._isRunning = true;
        ParticleEngine.start();
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