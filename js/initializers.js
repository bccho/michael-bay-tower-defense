/*
 * In this file you can specify all sort of initializers
 *  We provide an example of simple initializer that generates points withing a cube.
 */

function VoidInitializer ( opts ) {
    this._opts = opts;
    return this;
}

VoidInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

};
////////////////////////////////////////////////////////////////////////////////
// Basic Initializer
////////////////////////////////////////////////////////////////////////////////

function sampleUnitCube() {
    return new THREE.Vector3( 1.0 - 2.0 * Math.random(),
        1.0 - 2.0 * Math.random(),
        1.0 - 2.0 * Math.random() );
}

function sampleSphere(r) {
    var pos;
    do {
        pos = sampleUnitCube();
    } while (pos.length() > 1);
    pos = pos.multiplyScalar(r / pos.length());
    return pos;
}

function SphereInitializer ( opts ) {
    this._opts = opts;
    return this;
}

SphereInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // position = random sphere of positions + base position
        var pos = sampleSphere(r);
        pos.add(base_pos);

        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
};

SphereInitializer.prototype.initializeVelocities = function ( velocities, dampenings, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // velocity = position + base velocity
        var pos = getElement( idx, positions );
        var vel = pos.clone();
        vel.add(base_vel);

        setElement( idx, velocities, vel );
        var damp = new THREE.Vector3(this._opts.damping.x,this._opts.damping.y,0);
        setElement( idx, dampenings, damp); 
    }
    velocities.needUpdate = true;
};

SphereInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
    var base_col = this._opts.color;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var col = base_col;

        // ----------- STUDENT CODE END ------------
        setElement( idx, colors, col );
    }
    colors.needUpdate = true;
};

SphereInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var size = this._opts.size;

        // ----------- STUDENT CODE END ------------
        setElement( idx, sizes, size );
    }
    sizes.needUpdate = true;
};

SphereInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var lifetime = this._opts.lifetime;

        // ----------- STUDENT CODE END ------------
        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
};

// how to make this function nicer to work with. This one is kinda ok, as for initialization
// everything is independent
SphereInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity,  particleAttributes.dampening, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};

// Explosion system
function ExplosionInitializer ( opts ) {
    this._opts = opts;
    return this;
}

ExplosionInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // position = random sphere of positions + base position
        var pos = sampleSphere(r);
        pos.add(base_pos);

        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
};

ExplosionInitializer.prototype.initializeVelocities = function ( velocities, dampenings, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    var base_sphere = this._opts.sphere;
    var base_pos = new THREE.Vector3(base_sphere.x, base_sphere.y, base_sphere.z);

    var explosionSpeed = this._opts.explosionSpeed;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // velocity = position + base velocity
        var pos = getElement( idx, positions ).sub(base_pos);
        var vel = pos.clone().multiplyScalar(explosionSpeed);
        vel.add(base_vel);

        setElement( idx, velocities, vel );
        var damp = new THREE.Vector3(this._opts.damping.x,this._opts.damping.y,0);
        setElement( idx, dampenings, damp);
    }
    velocities.needUpdate = true;
};

ExplosionInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
    var base_col = this._opts.baseColor;
    var mag_col = this._opts.magColor;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var alphaR = base_col.x;
        var alphaG = base_col.y;
        var alphaB = base_col.z;

        var magR = mag_col.x;
        var magG = mag_col.y;
        var magB = mag_col.z;

        var r = magR * ((1 - alphaR) * Math.random() + alphaR);
        var g = magG * ((1 - alphaG) * Math.random() + alphaG);
        var b = magB * ((1 - alphaB) * Math.random() + alphaB);

        var col = new THREE.Vector4(r, g, b, 1.0);

        // ----------- STUDENT CODE END ------------
        setElement( idx, colors, col );
    }
    colors.needUpdate = true;
};

ExplosionInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {
    // debugger;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var size = this._opts.size;
        // ----------- STUDENT CODE END ------------
        setElement( idx, sizes, size );
    }
    sizes.needUpdate = true;
};

ExplosionInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var lifetime = this._opts.lifetime;

        // ----------- STUDENT CODE END ------------
        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
};

ExplosionInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity,  particleAttributes.dampening, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};


////////////////////////////////////////////////////////////////////////////////
// Basic Initializer
////////////////////////////////////////////////////////////////////////////////

function FountainInitializer ( opts ) {
    this._opts = opts;
    return this;
}

FountainInitializer.prototype.initializePositions = function ( positions, toSpawn) {
    var base = this._opts.sphere;
    var base_pos = new THREE.Vector3( base.x, base.y, base.z );
    var r   = base.w;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // position = random sphere of positions + base position
        var pos = sampleSphere(r);
        pos.add(base_pos);

        setElement( idx, positions, pos );

    }
    positions.needUpdate = true;
};

FountainInitializer.prototype.initializeVelocities = function ( velocities, dampenings, positions, toSpawn ) {
    var base_vel = this._opts.velocity;
    var r = this._opts.size;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // velocity = random sphere of velocities + base velocity
        var vel = base_vel.clone();
        var delta_v = sampleSphere(r);
        vel.add(delta_v);

        setElement( idx, velocities, vel );
        var damp = new THREE.Vector3(this._opts.damping.x,this._opts.damping.y,0);
        setElement( idx, dampenings, damp); 

    }
    velocities.needUpdate = true;
};

FountainInitializer.prototype.initializeColors = function ( colors, toSpawn ) {
    var base_col = this._opts.color;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var col = base_col;

        // ----------- STUDENT CODE END ------------
        setElement( idx, colors, col );
    }
    colors.needUpdate = true;
};

FountainInitializer.prototype.initializeSizes = function ( sizes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------
        var size = this._opts.size;

        // ----------- STUDENT CODE END ------------
        setElement( idx, sizes, size );
    }
    sizes.needUpdate = true;
};

FountainInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn ) {

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];

        var lifetime = this._opts.lifetime;

        setElement( idx, lifetimes, lifetime );
    }
    lifetimes.needUpdate = true;
};

// how to make this function nicer to work with. This one is kinda ok, as for initialization
// everything is independent
FountainInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn );

    this.initializeVelocities( particleAttributes.velocity,  particleAttributes.dampening, particleAttributes.position, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};

////////////////////////////////////////////////////////////////////////////////
// Animation Initializer
////////////////////////////////////////////////////////////////////////////////

function AnimationInitializer ( opts ) {
    this._opts = opts;
    return this;
}

// this function gets the morphed position of an animated mesh.
// we recommend that you do not look too closely in here ;-)
AnimationInitializer.prototype.getMorphedMesh = function () {

    // Can't globally access meshes anymore. RIP ParticleEngine 2018
    return undefined;

    //  if ( ParticleEngine._meshes[0] !== undefined  && ParticleEngine._animations[0] !== undefined){
    //
    //     var mesh       = ParticleEngine._meshes[0];
    //
    //     var vertices   = [];
    //     var n_vertices = mesh.geometry.vertices.length;
    //
    //     var faces      = ParticleEngine._meshes[0].geometry.faces;
    //
    //     var morphInfluences = ParticleEngine._meshes[0].morphTargetInfluences;
    //     var morphs          = ParticleEngine._meshes[0].geometry.morphTargets;
    //
    //     if ( morphs === undefined ) {
    //         return undefined;
    //     }
    //     for ( var i = 0 ; i < morphs.length ; ++i ) {
    //
    //         if ( morphInfluences[i] !== 0.0 ) {
    //             for ( var j = 0 ; j < n_vertices ; ++j ) {
    //                 vertices[j] = new THREE.Vector3( 0.0, 0.0, 0.0 );
    //                 vertices[j].add ( morphs[i].vertices[j] );
    //             }
    //         }
    //     }
    //     return { vertices : vertices, faces : faces, scale: mesh.scale, position: mesh.position };
    //
    // } else {
    //
    //     return undefined;
    //
    // }
};

AnimationInitializer.prototype.initializePositions = function ( positions, toSpawn, mesh ) {
    var base_pos = this._opts.position;
    var verts = mesh.vertices;
    var faces = mesh.faces;
    // Compute face areas
    var face_areas_cmf = [];
    var total_area = 0.0;
    for ( var i = 0; i < faces.length; i++) {
        var v1 = verts[faces[i].b].clone().sub(verts[faces[i].a]);
        var v2 = verts[faces[i].c].clone().sub(verts[faces[i].a]);
        total_area += v1.cross(v2).length() / 2.0;
        face_areas_cmf[i] = total_area;
    }

    for ( i = 0 ; i < toSpawn.length ; ++i ) {
        var p = new THREE.Vector3();

        // (1) choose face at random, proportional to face area.
        //   Note: to get this exact in constant time, we'd need to approximate,
        //   and I'm not about to implement binary search in Javascript, so...
        var face_id = Math.random() * total_area;
        for ( var j = 0; j < face_areas_cmf.length; j++ ) {
            if (face_id < face_areas_cmf[j] ) {
                face_id = j;
                break;
            }
        }
        var face = faces[face_id];

        // (2) choose position at random
        //   (Based on section 4.2 of http://www.cs.princeton.edu/~funk/tog02.pdf)
        var r1 = Math.random();
        var r2 = Math.random();
        p.add( verts[face.a].clone().multiplyScalar( 1.0 - Math.sqrt(r1) ) );
        p.add( verts[face.b].clone().multiplyScalar( Math.sqrt(r1) * (1.0 - r2) ) );
        p.add( verts[face.c].clone().multiplyScalar( Math.sqrt(r1) * r2 ) );
        p.multiply( mesh.scale );

        setElement( i, positions, p );
    }
    positions.needUpdate = true;
};

AnimationInitializer.prototype.initializeVelocities = function ( velocities, dampenings, toSpawn) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        var vel = base_vel.clone();
        vel.add(sampleSphere(5.0));

        setElement( idx, velocities, vel );
        var damp = new THREE.Vector3(this._opts.damping.x,this._opts.damping.y,0);
        setElement( idx, dampenings, damp); 
    }
    velocities.needUpdate = true;
};

AnimationInitializer.prototype.initializeColors = function ( colors, toSpawn) {
    var base_col = this._opts.color;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        setElement( idx, colors, base_col );
        // ----------- STUDENT CODE END ------------
    }
    colors.needUpdate = true;
};

AnimationInitializer.prototype.initializeSizes = function ( sizes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        // ----------- STUDENT CODE BEGIN ------------

        setElement( idx, sizes, this._opts.size );
        // ----------- STUDENT CODE END ------------
    }
    sizes.needUpdate = true;
};

AnimationInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, lifetimes, this._opts.lifetime );
    }
    lifetimes.needUpdate = true;
};

// how to make this function nicer to work with. This one is kinda ok, as for initialization
// everything is independent
AnimationInitializer.prototype.initialize = function ( particleAttributes, toSpawn ) {
    var mesh = this.getMorphedMesh();

    if ( mesh === undefined ){
        return;
    }

    // update required values
    this.initializePositions( particleAttributes.position, toSpawn, mesh );

    this.initializeVelocities( particleAttributes.velocity,  particleAttributes.dampening, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );
};

////////////////////////////////////////////////////////////////////////////////
// Cloth
////////////////////////////////////////////////////////////////////////////////

function ClothInitializer ( opts ) {
    this._opts = opts;
    return this;
}

ClothInitializer.prototype.initializePositions = function ( positions, toSpawn, width, height ) {
    var base_pos = this._opts.position;

    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        var w = idx % width;
        var h = idx / height;
        var grid_pos = new THREE.Vector3( 100.0 - w * 10, 0.0, 100.0 - h * 10 );
        var pos = grid_pos.add( base_pos );
        setElement( idx, positions, pos );
    }
    positions.needUpdate = true;
};

ClothInitializer.prototype.initializeVelocities = function ( velocities, toSpawn) {
    var base_vel = this._opts.velocity;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, velocities, base_vel  );
    }
    velocities.needUpdate = true;
};

ClothInitializer.prototype.initializeColors = function ( colors, toSpawn) {
    var base_col = this._opts.color;
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        var col = base_col;
        setElement( idx, colors, col );
    }
    colors.needUpdate = true;
};

ClothInitializer.prototype.initializeSizes = function ( sizes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, sizes, 1 );
    }
    sizes.needUpdate = true;
};

ClothInitializer.prototype.initializeLifetimes = function ( lifetimes, toSpawn) {
    for ( var i = 0 ; i < toSpawn.length ; ++i ) {
        var idx = toSpawn[i];
        setElement( idx, lifetimes, Math.INFINITY );
    }
    lifetimes.needUpdate = true;
};


ClothInitializer.prototype.initialize = function ( particleAttributes, toSpawn, width, height ) {
    // update required values
    this.initializePositions( particleAttributes.position, toSpawn, width, height );

    this.initializeVelocities( particleAttributes.velocity, toSpawn );

    this.initializeColors( particleAttributes.color, toSpawn );

    this.initializeLifetimes( particleAttributes.lifetime, toSpawn );

    this.initializeSizes( particleAttributes.size, toSpawn );

    // mark normals to be updated
    particleAttributes["normal"].needsUpdate = true;
};
