function Enemy(opts) {
    opts = opts || {};

    // Parse options
    for (var option in opts) {
        var value = opts[option];
        if (option === "BLAH") {
            obj._BLAH = value;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    opts = setDefault(opts, "heightAboveGround", 0);
    GameObject.call(this, opts);

    return this;
}

Enemy.prototype = new GameObject();

