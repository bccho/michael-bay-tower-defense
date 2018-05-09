function Enemy (opts) {
    opts = setDefault(opts, "heightAboveGround", 0);
    var obj = Object.create(new GameObject(opts));

    // Parse options
    for (var option in opts) {
        var value = opts[option];
        if (option === "BLAH") {
            obj._BLAH = value;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    return obj;
}

