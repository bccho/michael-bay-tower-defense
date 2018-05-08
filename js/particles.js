// TODO
// Explore pools and what they bring into the picture
// Add better interface for customization
// Explore pools
// optimize?

import * as THREE from "three";

var ParticleEngine = ParticleEngine || {
    _particles     : undefined,
    _particleCloud : undefined,
    _material      : undefined,
};

ParticleEngine.create = function () {
    this._particles      = new THREE.BufferGeometry();// initFunction( count, this._pool );
    var sprite = THREE.ImageUtils.loadTexture( "images/spark.png" );
    this._material       = new THREE.PointCloudMaterial( { size: 15.0,
        map: sprite,
        // alphaTest : 0.5,
        blending: THREE.NormalBlending, //THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: THREE.VertexColors } );
    this._particleCloud  = new THREE.PointCloud( this._particles, this._material );
};

ParticleEngine.initParticle = function ( i, positions, velocities, colors, sizes, lifetimes ) {
    // positions
    positions[ 3 * i     ] = 0;
    positions[ 3 * i + 1 ] = 50;
    positions[ 3 * i + 2 ] = 0;

    // velocities
    velocities[ 3 * i     ] = -10 + Math.random() * 20;
    velocities[ 3 * i + 1 ] = 10 + Math.random() * 40;
    velocities[ 3 * i + 2 ] =  -10 + Math.random() * 20;

    // colors
    var color = new THREE.Color( 0xabcdef );

    colors[ 3 * i     ] = color.r;
    colors[ 3 * i + 1 ] = color.g;
    colors[ 3 * i + 2 ] = color.b;

    //lifetime
    lifetimes[ i ] = 10.0 + Math.random() * 10;

    //size
    sizes[ i ] = 1.0 + Math.random() * 5.0;
};


ParticleEngine.cubeEmitter = function ( count ) {

    var particles = this._particles;

    var positions  = new Float32Array( count * 3 );
    var velocities = new Float32Array( count * 3 );
    var sizes      = new Float32Array( count ); // needs custom shader
    var lifetimes  = new Float32Array( count );
    var colors     = new Float32Array( count * 3 );

    for( var i = 0; i < count; i++ ) {
        this.initParticle( i, positions, velocities, colors, sizes, lifetimes );
    }

    particles.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    particles.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    particles.addAttribute( 'velocity', new THREE.BufferAttribute( velocities, 3 ) );
    particles.addAttribute( 'lifetime', new THREE.BufferAttribute( lifetimes, 1 ) );
    particles.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
};

ParticleEngine.update = function () {

    var positions  = this._particles.getAttribute('position').array;
    var velocities = this._particles.getAttribute('velocity').array;
    var colors     = this._particles.getAttribute('color').array;
    var lifetimes  = this._particles.getAttribute('lifetime').array;
    var sizes      = this._particles.getAttribute('size').array;

    var count = positions.length / 3;
    var timestep = 0.1;
    var gravity = new THREE.Vector3( 0, 0, 0 );

    var start_color = new THREE.Color ( 1.0, 0.0, 0.0 );
    var end_color   = new THREE.Color ( 0.0, 0.0, 1.0 );

    for ( var i = 0 ; i < count ; i++ ) {
        var base_idx = 3 * i;

        var pos = new THREE.Vector3( positions[ base_idx ], positions[ base_idx + 1 ], positions[base_idx + 2]);
        var vel = new THREE.Vector3( velocities[ base_idx ], velocities[ base_idx + 1 ], velocities[base_idx + 2]);
        var col = new THREE.Vector3( colors[ base_idx ], colors[ base_idx + 1], colors[base_idx + 2]);
        var size  = sizes [ i ];
        var lifetime = lifetimes[ i ];

        lifetimes[ i ] = lifetime - timestep;

        if ( lifetimes[ i ] < 0 ) {
            this.initParticle ( i, positions, velocities, colors, sizes, lifetimes );
            continue;
        }

        var vel_change = vel.clone().multiplyScalar( timestep );
        pos.add( vel_change );

        vel.add( gravity.clone().multiplyScalar( timestep ) );
        var factor = lifetime / 30;
        col = start_color.clone().multiplyScalar( factor ).add ( end_color.clone().multiplyScalar(1-factor) );


        colors[ base_idx    ] = col.r;
        colors[ base_idx + 1] = col.g;
        colors[ base_idx + 2] = col.b;

        if ( pos.y <= - 10.0 ) {
            positions[base_idx + 1]  = -10.0;
            continue;
        }

        positions[ base_idx    ] = pos.x;
        positions[ base_idx + 1] = pos.y ;
        positions[ base_idx + 2] = pos.z;

        velocities[ base_idx    ] = vel.x;
        velocities[ base_idx + 1] = vel.y;
        velocities[ base_idx + 2] = vel.z;

    }

    this._particles.attributes.position.needsUpdate = true;
    this._particles.attributes.velocity.needsUpdate = true;
    this._particles.attributes.size.needsUpdate = true;
    this._particles.attributes.color.needsUpdate = true;
    this._particles.attributes.lifetime.needsUpdate = true;
};


ParticleEngine.getParticles = function () {
    return this._particleCloud;
};
