function Explosion(kwargs) {
    kwargs = kwargs || {};

    // Optional arguments
    kwargs = setDefault(kwargs, "position", new THREE.Vector3());
    kwargs = setDefault(kwargs, "baseColor", new THREE.Vector4(0.9, 0.5, 0.0, 1.0));
    kwargs = setDefault(kwargs, "magColor", new THREE.Vector3(1.0, 1.0, 0.0));
    kwargs = setDefault(kwargs, "explosionSpeed", 200);
    kwargs = setDefault(kwargs, "particleLifetime", 1);
    kwargs = setDefault(kwargs, "size", 6);
    kwargs = setDefault(kwargs, "maxParticles", 10000);
    kwargs = setDefault(kwargs, "particlesFreq", 5000);
    kwargs = setDefault(kwargs, "lifespan", 0.5);

    // Set up emitter
    var initializeSettings = {
        sphere: new THREE.Vector4(0.0, 0.0, 0.0, 1.0),
        baseColor: kwargs.baseColor,
        magColor: kwargs.magColor,
        velocity: new THREE.Vector3(0.0, 0.0, 0.0),
        explosionSpeed: kwargs.explosionSpeed,
        damping: new THREE.Vector3(0.0, 0, 0), // (linear coeff, quadratic coeff, not in use )
        lifetime: kwargs.particleLifetime,
        size: kwargs.size
    };

    var updateSettings = {
        externalForces: {
            gravity: new THREE.Vector3(0, 0, 0),
            attractors: []
        },
        collidables: {}
    };

    var initializer = new ExplosionInitializer(initializeSettings);
    var updater = new EulerUpdater(updateSettings);

    var emitter_kwargs = {};
    emitter_kwargs.position = kwargs.position;
    emitter_kwargs.lifespan = kwargs.lifespan;
    emitter_kwargs.initialize = initializer;
    emitter_kwargs.update = updater;
    emitter_kwargs.maxParticles = kwargs.maxParticles;
    emitter_kwargs.particlesFreq = kwargs.particlesFreq;
    emitter_kwargs.material = SystemSettings.standardMaterial;

    var emitter = new Emitter(emitter_kwargs);

    return emitter;
}