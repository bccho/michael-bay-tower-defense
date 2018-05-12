var SystemSettings = SystemSettings || {};

SystemSettings.standardMaterial = new THREE.ShaderMaterial( {

    uniforms: {
        texture:  { type: 't',  value: new THREE.ImageUtils.loadTexture( 'images/blank.png' ) },
    },

    attributes: {
        velocity: { type: 'v3', value: new THREE.Vector3() },
        color:    { type: 'v4', value: new THREE.Vector3( 0.0, 0.0, 1.0, 1.0 ) },
        lifetime: { type: 'f', value: 1.0 },
        size:     { type: 'f', value: 1.0 },
    },

    vertexShader:   document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,

    blending:    Gui.values.blendTypes,
    transparent: Gui.values.transparent,
    depthTest:   Gui.values.depthTest,

} );

////////////////////////////////////////////////////////////////////////////////
// Basic system
////////////////////////////////////////////////////////////////////////////////

SystemSettings.basic = {

    // Particle material
    particleMaterial : SystemSettings.standardMaterial,

    // Initialization
    initializerFunction : SphereInitializer,
    initializerSettings : {
        sphere: new THREE.Vector4 ( 0.0, 0.0, 0.0, 10.0),
        color:    new THREE.Vector4 ( 1.0, 1.0, 1.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 0.0, 0.0),
        damping: new THREE.Vector3 ( 0.0, 0, 0 ), // (linear coeff, quadratic coeff, not in use )
        lifetime: 7,
        size:     6.0,
    },

    // Update
    updaterFunction : EulerUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, 0, 0),
            attractors : [],
        },
        collidables: {},
    },

    // Scene
    maxParticles :  10000,
    particlesFreq : 1000,
    createScene : function () {},
};

////////////////////////////////////////////////////////////////////////////////
// Oscilator system
////////////////////////////////////////////////////////////////////////////////

SystemSettings.oscilator = {

    // Particle material
    particleMaterial : SystemSettings.standardMaterial,

    // Initialization
    initializerFunction : SphereInitializer,
    initializerSettings : {
        sphere: new THREE.Vector4 ( 0.0, 0.0, 0.0, 0.0),
        color:    new THREE.Vector4 ( 1.0, 1.0, 1.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 10.0, 0.0),
        damping: new THREE.Vector3 ( 0.1, 0, 0 ),
        lifetime: 30,
        size:     6.0,
    },

    // Update
    updaterFunction : EulerUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, 0, 0),
            attractors : [ new THREE.Sphere( new THREE.Vector3(0.0, 20.0, 0.0), -10.0 ), new THREE.Sphere( new THREE.Vector3(0.0, -20.0, 0.0), -10.0 )],
        },
        collidables: {},
    },

    // Scene
    maxParticles :  1,
    particlesFreq : 300,
    createScene : function () {
        var sphere_geo = new THREE.SphereGeometry( 1.0, 32, 32 );
        var phong      = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x224422, side: THREE.DoubleSide } );
        var sphere     = new THREE.Mesh( sphere_geo, phong );
        var sphere2    = new THREE.Mesh( sphere_geo, phong );

        sphere.position.set (0,50,0);
        Scene.addObject( sphere );
        sphere2.position.set (0,-50,0);
        Scene.addObject( sphere2 );
    },
};


////////////////////////////////////////////////////////////////////////////////
// Fountain system
////////////////////////////////////////////////////////////////////////////////

SystemSettings.fountainBounce = {

    // Particle material
    particleMaterial :  SystemSettings.standardMaterial,

    // Initialization
    initializerFunction : FountainInitializer,
    initializerSettings : {
        sphere:   new THREE.Vector4 ( 0.0, 30.0, 0.0, 1.0 ),
        color:    new THREE.Vector4 ( 0.0, 0.0, 1.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 50.0, 0.0),
        damping: new THREE.Vector3 ( 0, 0, 0 ),
        lifetime: 7,
        size:     10.0,
    },

    // Update
    updaterFunction : EulerUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, -20, 0),
            attractors : [],
        },
        collidables: {
            bouncePlanes: [ {plane : new THREE.Vector4( 0, 1, 0, 0 ), damping : 0.8 } ],
        },
    },

    // Scene
    maxParticles :  5000,
    particlesFreq : 500,
    createScene : function () {
        var plane_geo = new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 );
        var phong     = new THREE.MeshPhongMaterial( {color: 0x444444, emissive: 0x222222, side: THREE.DoubleSide } );

        var box_geo   = new THREE.BoxGeometry(10, 30, 10);

        var plane     = new THREE.Mesh( plane_geo, phong );
        var box       = new THREE.Mesh( box_geo, phong );
        box.position.set( 0.0, 15.0, 0.0 );

        plane.rotation.x = -1.57;
        plane.position.y = 0;

        Scene.addObject( plane );
        Scene.addObject( box );
    },
};

SystemSettings.fountainSink = {

    // Particle material
    particleMaterial :  SystemSettings.standardMaterial,

    // Initialization
    initializerFunction : FountainInitializer,
    initializerSettings : {
        sphere:   new THREE.Vector4 ( 0.0, 30.0, 0.0, 1.0 ),
        color:    new THREE.Vector4 ( 0.0, 0.0, 1.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 50.0, 0.0),
        damping: new THREE.Vector3 ( 0, 0, 0 ),
        lifetime: 7,
        size:     10.0,
    },

    // Update
    updaterFunction : EulerUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, -20, 0),
            attractors : [],
        },
        collidables: {
            sinkPlanes : [ { plane : new THREE.Vector4( 0, 1, 0, 0 ) } ],
        },
    },

    // Scene
    maxParticles :  5000,
    particlesFreq : 500,
    createScene : function () {
        var plane_geo = new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 );
        var phong     = new THREE.MeshPhongMaterial( {color: 0x444444, emissive: 0x222222, side: THREE.DoubleSide } );

        var box_geo   = new THREE.BoxGeometry(10, 30, 10);

        var plane     = new THREE.Mesh( plane_geo, phong );
        var box       = new THREE.Mesh( box_geo, phong );
        box.position.set( 0.0, 15.0, 0.0 );

        plane.rotation.x = -1.57;
        plane.position.y = 0;

        Scene.addObject( plane );
        Scene.addObject( box );
    },
};

////////////////////////////////////////////////////////////////////////////////
// Attractor system
////////////////////////////////////////////////////////////////////////////////

SystemSettings.attractor = {

    // Particle material
    particleMaterial : SystemSettings.standardMaterial,

    // Initialization
    initializerFunction : SphereInitializer,
    initializerSettings : {
        sphere:   new THREE.Vector4 ( 0.0, 0.0, 0.0, 5.0),
        color:    new THREE.Vector4 ( 1.0, 1.0, 1.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 0.0, 0.0),
        damping: new THREE.Vector3 ( 0, 0, 0 ),
        lifetime: 7,
        size:     6.0,
    },

    // Update
    updaterFunction : EulerUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, 0, 0),
            attractors : [ new THREE.Sphere( new THREE.Vector3(30.0, 30.0, 30.0), 250.0 ) ],
        },
        collidables: {},
    },

    // Scene
    maxParticles :  10000,
    particlesFreq : 1000,
    createScene : function () {
        var sphere_geo = new THREE.SphereGeometry( 1.0, 32, 32 );
        var phong      = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x442222, side: THREE.DoubleSide } );
        var sphere = new THREE.Mesh( sphere_geo, phong );

        sphere.position.set (30.0, 30.0, 30.0);
        Scene.addObject( sphere );
    },
};

////////////////////////////////////////////////////////////////////////////////
// Horse animation
////////////////////////////////////////////////////////////////////////////////

SystemSettings.animated = {

    // Particle Material
    particleMaterial :  SystemSettings.standardMaterial,

    // Initializer
    initializerFunction : AnimationInitializer,
    initializerSettings : {
        position: new THREE.Vector3 ( 0.0, 60.0, 0.0),
        color:    new THREE.Vector4 ( 1.0, 1.0, 1.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 0.0, -40.0),
        damping: new THREE.Vector3 ( 0, 0, 0 ),
        lifetime: 1.25,
        size:     2.0,
    },

    // Updater
    updaterFunction : EulerUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, 0, 0),
            attractors : [],
        },
        collidables: {
            bouncePlanes: [ {plane : new THREE.Vector4( 0, 1, 0, 0 ), damping : 0.8 } ],
        },
    },

    // Scene
    maxParticles:  20000,
    particlesFreq: 10000,
    createScene : function () {
        var plane_geo = new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1 );
        var phong     = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x444444, side: THREE.DoubleSide } );
        var plane = new THREE.Mesh( plane_geo, phong );
        plane.rotation.x = -1.57;
        plane.position.y = 0;

        Scene.addObject( plane );
    },

    // Animation
    animatedModelName: "animated_models/horse.js",
    animationLoadFunction : function( geometry ) {
        mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x606060, morphTargets: true, transparent:true, opacity:0.5 } ) );
        mesh.scale.set( 0.25, 0.25, 0.25 );
        // mesh.position.set( 0.0, 30.0, 0.0 );
        Scene.addObject( mesh );
        ParticleEngine.addMesh( mesh );

        ParticleEngine.addAnimation( new THREE.MorphAnimation( mesh ) );
    },

};


////////////////////////////////////////////////////////////////////////////////
// Cloth
////////////////////////////////////////////////////////////////////////////////

SystemSettings.cloth = {

    // Particle Material
    particleMaterial :  new THREE.MeshLambertMaterial( { color:0xff0000, side: THREE.DoubleSide  } ),

    // Initializer
    initializerFunction : ClothInitializer,
    initializerSettings : {
        position: new THREE.Vector3 ( 0.0, 60.0, 0.0),
        color:    new THREE.Vector4 ( 1.0, 0.0, 0.0, 1.0 ),
        velocity: new THREE.Vector3 ( 0.0, 0.0, 0.0),
    },

    // Updater
    updaterFunction : ClothUpdater,
    updaterSettings : {
        externalForces : {
            gravity :     new THREE.Vector3( 0, -10.0, 0),
            attractors : [],
        },
        collidables: {
            bounceSpheres: [ {sphere : new THREE.Vector4( 0, 0, 0, 52.0 ), damping : 0.0 } ],
        },
    },

    // Scene
    maxParticles:  400,
    particlesFreq: 1000,
    createScene : function () {
        var sphere_geo = new THREE.SphereGeometry( 50.0, 32, 32 );
        var phong      = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x442222, side: THREE.DoubleSide } );

        Scene.addObject( new THREE.Mesh( sphere_geo, phong ) );
    },

    // Cloth specific settings
    cloth : true,
    width : 20,
    height : 20,
};

////////////////////////////////////////////////////////////////////////////////
// My System
////////////////////////////////////////////////////////////////////////////////

SystemSettings.mySystem = {
    // Particle Material
    particleMaterial: SystemSettings.standardMaterial,

    // Initializer
    initializerFunction: VoidInitializer,
    initializerSettings: {
        sphere: new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
        baseColor: new THREE.Vector4(0.9, 0.5, 0.0, 1.0),
        magColor: new THREE.Vector3(1.0, 1.0, 0.0),
        velocity: new THREE.Vector3(0.0, 0.0, 0.0),
        explosionSpeed: 200,
        damping: new THREE.Vector3(0.0, 0, 0), // (linear coeff, quadratic coeff, not in use )
        lifetime: 1,
        size: 6.0,
    },

    // Updater
    updaterFunction: VoidUpdater,
    updaterSettings: {
        externalForces: {
            gravity: new THREE.Vector3(0, 0, 0),
            attractors: [],
        },
        collidables: {},
    },

    // Scene
    maxParticles: 10000,
    particlesFreq: 5000,
    createScene: function () {
        // manually add the emitter to the particle engine and draw
        // var initalizeSettings = {
        //     sphere: new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
        //     baseColor: new THREE.Vector4(0.9, 0.5, 0.0, 1.0),
        //     magColor: new THREE.Vector3(1.0, 1.0, 0.0),
        //     velocity: new THREE.Vector3(0.0, 0.0, 0.0),
        //     explosionSpeed: 200,
        //     damping: new THREE.Vector3(0.0, 0, 0), // (linear coeff, quadratic coeff, not in use )
        //     lifetime: 1,
        //     size: 6.0,
        // };
        //
        // var updateSettings = {
        //     externalForces: {
        //         gravity: new THREE.Vector3(0, 0, 0),
        //         attractors: [],
        //     },
        //     collidables: {},
        // }
        //
        // var initializer = new ExplosionInitializer(initalizeSettings);
        // var updater = new EulerUpdater(updateSettings);
        //
        // var emitter = new Emitter({
        //     maxParticles: 10000,   // how many particles can be generated by this emitter?
        //     particlesFreq: 5000,  // how many particle per second will we emit?
        //     initialize: initializer,                  // initializer object
        //     update: updater,                      // updater object
        //     material: SystemSettings.standardMaterial,
        //     cloth: SystemSettings.standardMaterial,
        //     width: 20,
        //     height: 20,
        // });

        // var exp1 = new Explosion(new THREE.Vector3(0, 0, 0));
        // var expOpts = {baseColor: new THREE.Vector3(0.0, 0.9, 0.5),
        //     magColor: new THREE.Vector3(0.0, 1.0, 1.0),
        //     explosionSpeed: 50,
        //     explosionLifespan: undefined};
        // var exp2 = new Explosion(new THREE.Vector3(300, 0, 0), expOpts);
        //
        // GameEngine.start();
        // GameEngine.createEmitter(exp1);
        // GameEngine.createEmitter(exp2);
        // GameEngine.removeDeadEmitters();



        // ParticleEngine.addEmitter(exp1);
        // ParticleEngine.addEmitter(exp2);
        // for ( i = 0 ; i < ParticleEngine._emitters.length ; ++i ) {
        //     Scene.addObject( ParticleEngine.getDrawableParticles( i ) );
        // }

        var G = new graphlib.Graph();
        // // G.setNode("A");
        // // G.setNode("B");
        // // G.setNode("C");
        // // G.setNode("D");
        // // G.setNode("E");
        // // G.setNode("F");
        // // G.setNode("G");
        // // G.setNode("H");
        // // G.setNode("I");
        //
        // G.setEdge('1', '2');
        // G.setEdge('2', '1');
        // G.setEdge('2', '3');
        // G.setEdge('3', '2');
        //
        // G.setEdge('1', '4');
        // G.setEdge('4', '1');
        // G.setEdge('2', '5');
        // G.setEdge('5', '2');
        // G.setEdge('3', '6');
        // G.setEdge('6', '3');
        //
        // G.setEdge('4', '7');
        // G.setEdge('7', '4');
        // G.setEdge('5', '8');
        // G.setEdge('8', '5');
        // G.setEdge('6', '9');
        // G.setEdge('9', '6');

        // function weight(e) {
        //     // var temp = parseFloat(G.edge(e));
        //     // debugger;
        //     return parseFloat(G.edge(e));
        // }
        //
        // G.setEdge("4", "5", "0.35");
        // G.setEdge("5", "4", "0.35");
        // G.setEdge("4", "7", "0.37");
        // G.setEdge("5", "7", "0.28");
        // G.setEdge("7", "5", "0.28");
        // G.setEdge("5", "1", "0.32");
        // G.setEdge("0", "4", "0.38");
        // G.setEdge("0", "2", "0.26");
        // G.setEdge("7", "3", "0.39");
        // G.setEdge("1", "3", "0.29");
        // G.setEdge("2", "7", "0.34");
        // G.setEdge("6", "2", "0.40");
        // G.setEdge("3", "6", "0.52");
        // G.setEdge("6", "0", "0.58");
        // G.setEdge("6", "4", "0.93");

        function weight(e) {
            // var temp = parseFloat(G.edge(e));
            // debugger;
            return G.edge(e);
        }

        G.setEdge(4, 5, 0.35);
        G.setEdge(5, 4, 0.35);
        G.setEdge(4, 7, 0.37);
        G.setEdge(5, 7, 0.28);
        G.setEdge(7, 5, 0.28);
        G.setEdge(5, 1, 0.32);
        G.setEdge(0, 4, 0.38);
        G.setEdge(0, 2, 0.26);
        G.setEdge(7, 3, 0.39);
        G.setEdge(1, 3, 0.29);
        G.setEdge(2, 7, 0.34);
        G.setEdge(6, 2, 0.40);
        G.setEdge(3, 6, 0.52);
        G.setEdge(6, 0, 0.58);
        G.setEdge(6, 4, 0.93);

        var dij = graphlib.alg.dijkstra(G, 0, weight);
        console.log(dij["6"]);
        console.log(parseInt(dij["6"].predecessor))
        // debugger;




    }
};


