var Main = Main || {};

// called when the gui params change and we need to update mesh
Main.systemChangeCallback = function(InputSettings) {
    // Start game engine from scratch
    LevelManager.finalize();
    GameEngine.start();

    // Initialize level manager
    LevelManager.initialize(InputSettings.gameSettings);

    // Create the scene
    InputSettings.initialize();
};

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    // Setup renderer, scene and gui
    Gui.init();
    Scene.create();
    Renderer.create(Scene, document.getElementById("canvas"));
    InputManager.initialize();

    // Set up scene
    Main.systemChangeCallback(SystemSettings.levels[Gui.values.systems]);

    GameEngine.mainLoop();
};
