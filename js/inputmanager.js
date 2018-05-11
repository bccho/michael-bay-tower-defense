// InputManager is a singleton class that manages game-related keyboard and mouse events
var InputManager = InputManager || {
    _listeners: {},
    _lastMouseDown: {},
    _clickMouseDeltaThreshold: 10
};

InputManager.initialize = function() {
    // Listener to keep track of mouse (x, y) at last mouse down
    InputManager.addListener(Renderer._canvas, "mousedown", function(event) {
        InputManager._lastMouseDown[event.button] = [event.clientX, event.clientY]
    });
};

/* Interface for general events */

// Wrapper for window.addEventListener
InputManager.addListener = function(element, type, listener, kwargs) {
    element = element || window;
    // Add to internal collection of listeners
    setDefault(InputManager._listeners, element, {});
    setDefault(InputManager._listeners[element], type, []);
    InputManager._listeners[element][type].push(listener);
    // Register listener with element, default window
    element.addEventListener(type, listener, kwargs);
};

InputManager.getListeners = function(type) {
    return InputManager._listeners[type];
};

InputManager.removeListeners = function(element, type) {
    element = element || window;
    if (!InputManager._listeners.hasOwnProperty(element)) return;

    var i;
    // If type is specified, remove listeners only of that type
    if (type !== undefined) {
        if (!InputManager._listeners[element].hasOwnProperty(type)) return;
        for (i = 0; i < InputManager._listeners[element][type].length; i++) {
            window.removeEventListener(type, InputManager._listeners[element][type][i]);
        }
        delete InputManager._listeners[type];
    }
    // Otherwise, remove all listeners
    else {
        for (type in InputManager._listeners[element]) {
            for (i = 0; i < InputManager._listeners[element][type].length; i++) {
                window.removeEventListener(type, InputManager._listeners[element][type][i]);
            }
        }
        InputManager._listeners = {};
    }
};

/* Interface for clicking objects */

InputManager.addMouseClickEvent = function(callback, kwargs) {
    var listener = function(event) {
        // If previous mouse down recorded, put a threshold on mouse position change between mouse down and up
        var lastMouseDown = InputManager._lastMouseDown[event.button];
        if (lastMouseDown !== undefined) {
            var deltaX = event.clientX - lastMouseDown[0];
            var deltaY = event.clientY - lastMouseDown[1];
            if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > InputManager._clickMouseDeltaThreshold) return;
        }
        callback(event);
    };
    InputManager.addListener(Renderer._canvas, "mouseup", listener, kwargs);
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

    InputManager.addMouseClickEvent(listener, kwargs);
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

    InputManager.addMouseClickEvent(listener, kwargs);
};
