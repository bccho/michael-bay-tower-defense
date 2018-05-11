var Main = Main || {};

// called when the gui params change and we need to update mesh
Main.systemChangeCallback = function(InputSettings) {
    // Start game engine from scratch
    GameEngine.start();

    // Initialize level manager
    // TODO: Kraig, instantiate your level manager here using InputSettings.gameSettings

    // Create the scene
    InputSettings.initialize();
};

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    // Setup renderer, scene and gui
    Gui.init(Main.controlsChangeCallback, Main.displayChangeCallback);
    Scene.create();
    Renderer.create(Scene, document.getElementById("canvas"));
    InputManager.initialize();

    // Set up scene
    Main.systemChangeCallback(SystemSettings.levels[Gui.values.systems]);

    GameEngine.mainLoop();
};
