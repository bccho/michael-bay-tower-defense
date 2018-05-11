// InputManager is a singleton class that manages game-related keyboard and mouse events
var InputManager = InputManager || {
    _listeners: {}
};

/* Interface for general events */

// Wrapper for window.addEventListener
InputManager.addListener = function(element, type, listener, kwargs) {
    element = element || window;
    // Add to internal collection of listeners
    this._listeners = setDefault(this._listeners, element, {});
    this._listeners = setDefault(this._listeners[element], type, []);
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
