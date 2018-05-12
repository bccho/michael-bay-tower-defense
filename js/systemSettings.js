var SystemSettings = SystemSettings || {};

SystemSettings.standardMaterial = new THREE.ShaderMaterial( {

    uniforms: {
        texture:  { type: 't',  value: new THREE.ImageUtils.loadTexture( 'images/blank.png' ) }
    },

    attributes: {
        velocity: { type: 'v3', value: new THREE.Vector3() },
        color:    { type: 'v4', value: new THREE.Vector3( 0.0, 0.0, 1.0, 1.0 ) },
        lifetime: { type: 'f', value: 1.0 },
        size:     { type: 'f', value: 1.0 }
    },

    vertexShader:   document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,

    blending:    Gui.values.blendTypes,
    transparent: Gui.values.transparent,
    depthTest:   Gui.values.depthTest

} );

///////////////////////////////
// LEVELS
///////////////////////////////
SystemSettings.levels = {};

SystemSettings.levels.level1 = {
    // Particle Material
    particleMaterial: SystemSettings.standardMaterial,

    // Game settings
    gameSettings: {
        initialHealth: 100,
        initialMoney: 1000,
        towerCost: 100
    },

    // Scene
    initialize: function() {
        var elevationFunction = function(i, j) {
            return Math.random() * 15.0;
        };
        Terrain.initialize({elevationInitializer: elevationFunction});
        Scene.addObject(Terrain.getModel());

        var tower = create(SimpleTower);
        tower.setArmAngle(0);

        var enemy = create(HorseEnemy, {
            position: new THREE.Vector3(-50, 0.0, -150),
            velocity: new THREE.Vector3(0, 0, 20),
            scale: new THREE.Vector3(0.05, 0.05, 0.05)
        });
    }
};

SystemSettings.levels.debug = {
    // Particle Material
    particleMaterial: SystemSettings.standardMaterial,

    // Scene
    initialize : function () { }
};
