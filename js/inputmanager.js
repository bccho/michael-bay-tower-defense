// InputManager is a singleton class that manages game-related keyboard and mouse events
var InputManager = InputManager || {
    _listeners: {}
};

/* Interface for general events */

// Wrapper for window.addEventListener
InputManager.addListener = function(element, type, listener, kwargs) {
    element = element || window;
    // Add to internal collection of listeners
    setDefault(this._listeners, element, {});
    setDefault(this._listeners[element], type, []);
    this._listeners[element][type].push(listener);
    // Register listener with element, default window
    element.addEventListener(type, listener, kwargs);
};

InputManager.getListeners = function(type) {
    return this._listeners[type];
};

InputManager.removeListeners = function(element, type) {
    element = element || window;
    if (!this._listeners.hasOwnProperty(element)) return;

    var i;
    // If type is specified, remove listeners only of that type
    if (type !== undefined) {
        if (!this._listeners[element].hasOwnProperty(type)) return;
        for (i = 0; i < this._listeners[element][type].length; i++) {
            window.removeEventListener(type, this._listeners[element][type][i]);
        }
        delete this._listeners[type];
    }
    // Otherwise, remove all listeners
    else {
        for (type in this._listeners[element]) {
            for (i = 0; i < this._listeners[element][type].length; i++) {
                window.removeEventListener(type, this._listeners[element][type][i]);
            }
        }
        this._listeners = {};
    }
};


/* Interface for clicking objects */
InputManager.addMouseClickEvent = function(callback, kwargs) {
    this.addListener(Renderer._canvas, "click", callback, kwargs);
};

InputManager.getRaycaster = function(event) {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var canvas = Renderer._canvas;
    mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, Renderer._camera);
    return raycaster;
};

InputManager.addClickTerrainEvent = function(callback, kwargs) {
    var listener = function(event) {
        // Check Terrain model exists
        if (Terrain.getModel() === undefined) return;
        // Set up raycaster for intersections
        var raycaster = InputManager.getRaycaster(event);
        // Find intersections with terrain mesh
        var intersects = raycaster.intersectObject(Terrain.getModel(), true);
        callback(event, intersects);
    };

    this.addMouseClickEvent(listener, kwargs);
};

InputManager.addClickGameObjectEvent = function(gameobject, callback, kwargs) {
    var listener = function(event) {
        // Check model exists
        if (gameobject.getModel() === undefined) return;
        // Set up raycaster for intersections
        var raycaster = InputManager.getRaycaster(event);
        // Find intersections with terrain mesh
        var intersects = raycaster.intersectObject(gameobject.getModel(), true);
        callback(event, intersects);
    };

    this.addMouseClickEvent(listener, kwargs);
};
