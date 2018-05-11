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

    // Scene
    initialize : function () {
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

        InputManager.addClickTerrainEvent(function(event, intersects) {
            if (intersects.length === 0) return;

            var radius = 2.0;
            var phong = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), phong);
            sphere.position.copy(intersects[0].point);
            Scene.addObject(sphere);
        });
    }
};

SystemSettings.levels.debug = {
    // Particle Material
    particleMaterial: SystemSettings.standardMaterial,

    // Scene
    initialize : function () { }
};
