var Batch = Batch || { };

// called when the gui params change and we need to update mesh
Batch.systemChangeCallback = function(InputSettings) {
    // Start game engine from scratch
    GameEngine.start();

    // Initialize level manager
    // TODO: Kraig, instantiate your level manager here using InputSettings.gameSettings

    // Create the scene
    InputSettings.initialize();
};

Batch.parseUrl = function() {
    var url  = document.URL;
    var cmds = Parser.getCommands(url);

    Batch.selectedSystem = cmds[0].system;
    Batch.cmds = cmds[0];
};


// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    // Setup renderer, scene and gui
    Scene.create();
    Batch.parseUrl();
    Gui.values.windowSize = Batch.cmds.size;
    Renderer.create(Scene, document.getElementById("canvas"));
    Renderer.onWindowResize();
    InputManager.initialize();

    // Set up scene
    Batch.systemChangeCallback(SystemSettings[Batch.selectedSystem]);

    if (Batch.selectedSystem !== 'cloth') {
        var emitters = GameEngine.getEmitters();
        for (var i = 0; i < emitters.length; i++) {
            emitters[i]._material.uniforms.texture.value = new THREE.ImageUtils.loadTexture( 'images/' + Batch.cmds.texture + '.png' );
            emitters[i]._material.depthTest = (Batch.cmds.depthTest === 'true');
            emitters[i]._material.transparent = (Batch.cmds.transparent === 'true');
            emitters[i]._sorting = (Batch.cmds.sorting === 'true');

            var blendType;
            if (Batch.cmds.blending === "Normal") {
                blendType = THREE.NormalBlending;
            } else if (Batch.cmds.blending === "Additive") {
                blendType = THREE.AdditiveBlending;
            } else {
                console.log("Blend type unknown!");
                return;
            }
            emitters[i]._material.blending = blendType;
            emitters[i]._material.needsUpdate  = true;
        }
    }

    GameEngine.mainLoop();
};


