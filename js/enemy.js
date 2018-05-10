function Enemy(kwargs) {
    kwargs = kwargs || {};

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "BLAH") {
            obj._BLAH = value;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    kwargs = setDefault(kwargs, "heightAboveGround", 0);
    GameObject.call(this, kwargs);

    return this;
}

Enemy.prototype = new GameObject();

