var LevelManager = LevelManager || {
    // Member attributes
    _money: undefined,
    _health: undefined,
    _mouseMode: undefined,
    _initialized: false,
    _cooldown: undefined, // in seconds
    _maxEnemies: undefined,
    _currentCooldown: 0
};

LevelManager.initialize = function(gameSettings) {
    if (!LevelManager._initialized) LevelManager.finalize();

    gameSettings = gameSettings || {};
    setDefault(gameSettings, "initialHealth", 100);
    setDefault(gameSettings, "initialMoney", 1000);
    setDefault(gameSettings, "towerCost", 100);
    setDefault(gameSettings, "cooldown", 1.5);
    setDefault(gameSettings, "maxEnemies", 0);

    // Initialize member attributes
    LevelManager._settings = gameSettings;

    LevelManager._money = gameSettings.initialMoney;
    LevelManager._health = gameSettings.initialHealth;
    LevelManager._currentCooldown = 0;

    // Create GUI elements
    var textMoney = LevelManager._createDiv("Money: ", {top: "20px", left: "300px"});
    var textHealth = LevelManager._createDiv("Health: ", {top: "60px", left: "300px"});
    LevelManager._buttonBuyTowerHTML = "<button onclick='LevelManager._onButtonBuyTower()'>Buy tower</button>";
    var buttonBuyTower = LevelManager._createDiv(LevelManager._buttonBuyTowerHTML, {top: "20px", left: "600px"});
    LevelManager._hud = {
        textMoney: textMoney,
        textHealth: textHealth,
        buttonBuyTower: buttonBuyTower
    };

    // Mouse event listeners
    InputManager.addClickTerrainEvent(LevelManager._onClickTerrain);
    InputManager.addMouseMoveTerrainevent(LevelManager._onMouseMoveTerrain);

    var phong = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
    LevelManager._mouseSphere = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 32), phong);
    Scene.addObject(LevelManager._mouseSphere);

    // Start in idle mode
    LevelManager._idleMode();

    LevelManager._initialized = true;
};

LevelManager.finalize = function() {
    if (!LevelManager._initialized) return;
    LevelManager._initialized = false;

    // Destroy GUI elements
    for (var elem in LevelManager._hud) {
        LevelManager._hud[elem].remove();
    }
    LevelManager._hud = {};

    delete LevelManager._mouseSphere;
};

LevelManager.update = function(deltaT) {
    if (!LevelManager._initialized) return;

    // Spawn enemies
    LevelManager._currentCooldown += deltaT;
    if (LevelManager._currentCooldown >= LevelManager._settings.cooldown) {
        if (GameEngine.numGameObject(Enemy) < LevelManager._settings.maxEnemies) {
            var z = Terrain._min.z;
            var x = Math.random() * (Terrain._max.x - Terrain._min.x) + Terrain._min.x;
            create(HorseEnemy, {
                position: new THREE.Vector3(x, 0, z), // place randomly on left of terrain
                velocity: new THREE.Vector3(0, 0, 20),
                scale:    new THREE.Vector3(0.05, 0.05, 0.05)
            });
            LevelManager._currentCooldown = 0;
        }
    }

    // GUI updates
    LevelManager._hud.textMoney.innerHTML = "Money: $" + LevelManager._money;
    LevelManager._hud.textHealth.innerHTML = "Health: " + LevelManager._health + " / " + LevelManager._settings.initialHealth;
};

LevelManager.takeDamage = function(amount) {
    LevelManager._health = Math.max(0, LevelManager._health - amount);
    // TODO: lose game
    // if (LevelManager._health === 0) {
    //     alert("You died!")
    // }
};


/* Private methods */

LevelManager._createDiv = function(html, style_kwargs) {
    style_kwargs = style_kwargs || {};
    setDefault(style_kwargs, "position", "absolute");
    setDefault(style_kwargs, "width", "300px");
    setDefault(style_kwargs, "height", "40px");
    setDefault(style_kwargs, "lineHeight", "40px");
    setDefault(style_kwargs, "color", "black");

    var div = document.createElement("div");
    for (var attr in style_kwargs) {
        div.style[attr] = style_kwargs[attr];
    }

    div.innerHTML = html;
    document.body.appendChild(div);
    return div;
};

LevelManager._newTower = function(position) {
    var newTower = create(SimpleTower);
    newTower._position.copy(position);
    LevelManager._money -= LevelManager._settings.towerCost;
    return newTower;
};

// State machine functions
LevelManager._idleMode = function() {
    LevelManager._mouseSphere.visible = false;
    LevelManager._hud.buttonBuyTower.innerHTML = LevelManager._buttonBuyTowerHTML;
    LevelManager._mouseMode = "idle";
};

LevelManager._buyTowerMode = function() {
    LevelManager._hud.buttonBuyTower.innerHTML = "Place tower...";
    LevelManager._mouseMode = "buyTower";
};

// Callbacks
LevelManager._onButtonBuyTower = function() {
    if (LevelManager._mouseMode !== "idle") return;

    // Check if can buy tower
    if (LevelManager._money < LevelManager._settings.towerCost) {
        alert("Insufficient funds!");
        return;
    }

    // Go into buy tower mode
    LevelManager._buyTowerMode();
};

LevelManager._onClickTerrain = function(event, intersects) {
    if (intersects.length === 0) return;
    if (LevelManager._mouseMode !== "buyTower") return;

    // Place new tower
    LevelManager._newTower((intersects[0].point));

    // Return to idle mode
    LevelManager._idleMode();
};

LevelManager._onMouseMoveTerrain = function(event, intersects) {
    if (intersects.length === 0) return;
    if (LevelManager._mouseMode === "buyTower") {
        // Update mouse position sphere
        LevelManager._mouseSphere.visible = true;
        LevelManager._mouseSphere.position.copy(intersects[0].point);
    }
};
