/*
 * In this file you can specify all sort of updaters
 *  We provide an example of simple updater that updates pixel positions based on initial velocity and gravity
 */

import * as THREE from "three";

////////////////////////////////////////////////////////////////////////////////
// Collisions
////////////////////////////////////////////////////////////////////////////////

var Collisions = Collisions || {};

var COLLISION_EPS = 0.001;


Collisions.BouncePlane = function ( particleAttributes, alive, delta_t, plane, damping ) {
    var positions    = particleAttributes.position;
    var velocities   = particleAttributes.velocity;

    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        // Bounce particle if below the plane
        var normal = new THREE.Vector3(plane.x, plane.y, plane.z);
        if (normal.dot(pos) >= plane.w) continue;

        // (1) reverse velocity normal direction
        var vel_normal = normal.clone().multiplyScalar(vel.dot(normal));
        vel.sub(vel_normal.multiplyScalar(1.0 + damping));

        // (2) ensure position above plane
        var pos_normal = normal.clone().multiplyScalar(pos.dot(normal));
        pos.sub(pos_normal);
        pos.add(normal.clone().multiplyScalar(pos_normal.length() + COLLISION_EPS));

        setElement( i, positions, pos );
        setElement( i, velocities, vel );
    }
};

Collisions.SinkPlane = function ( particleAttributes, alive, delta_t, plane  ) {
    var positions   = particleAttributes.position;

    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var pos = getElement( i, positions );

        // Kill particle if below the plane
        var normal = new THREE.Vector3(plane.x, plane.y, plane.z);
        if (normal.dot(pos) >= plane.w) continue;
        killParticle( i, particleAttributes, alive );
    }
};

Collisions.BounceSphere = function ( particleAttributes, alive, delta_t, sphere, damping ) {
    var positions    = particleAttributes.position;
    var velocities   = particleAttributes.velocity;

    var center = new THREE.Vector3(sphere.x, sphere.y, sphere.z);
    var radius = sphere.w;

    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var pos = getElement( i, positions );
        var vel = getElement( i, velocities );

        // Bounce particle if inside sphere
        var center_to_pos = pos.clone().sub(center);
        var dist = center_to_pos.length();
        if (dist >= radius) continue;

        // (1) reverse velocity normal direction
        var normal = center_to_pos.normalize();
        var vel_normal = normal.clone().multiplyScalar(vel.dot(normal));
        // vel.sub(vel_normal.multiplyScalar(1.0 + damping));
        var vel_tangent = vel.clone().sub(vel_normal);
        vel = vel_tangent.multiplyScalar(0.9).sub(vel_normal.multiplyScalar(damping));

        // (2) ensure position outside of sphere
        pos.addVectors(center, normal.clone().multiplyScalar(radius + COLLISION_EPS));

        setElement( i, positions, pos );
        setElement( i, velocities, vel );
    }
};

////////////////////////////////////////////////////////////////////////////////
// Null updater - does nothing
////////////////////////////////////////////////////////////////////////////////

function VoidUpdater ( opts ) {
    this._opts = opts;
    return this;
}

VoidUpdater.prototype.update = function ( particleAttributes, initialized, delta_t ) {
    //do nothing
};

////////////////////////////////////////////////////////////////////////////////
// Euler updater
////////////////////////////////////////////////////////////////////////////////

function EulerUpdater ( opts ) {
    this._opts = opts;
    return this;
}


EulerUpdater.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;

    for ( var i  = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        p.add( v.clone().multiplyScalar( delta_t ) );
        setElement( i, positions, p );
    }
};

EulerUpdater.prototype.updateVelocities = function ( particleAttributes, alive, delta_t ) {
    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;
    var dampenings = particleAttributes.dampening;

    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        var dvdt = new THREE.Vector3();
        // gravity
        dvdt.add( gravity );
        // attractors
        for ( var j = 0; j < attractors.length; j++ ) {
            var delta_p = p.clone().sub(attractors[j].center);
            var d = delta_p.length();
            dvdt.add( delta_p.normalize().multiplyScalar( -attractors[j].radius / (d) ) );
        }
        // damping
        var damp = getElement( i, dampenings );
        dvdt.add( v.clone().multiplyScalar( -damp.x ) );
        dvdt.add( v.clone().multiplyScalar( -damp.y * v.length() ) );

        // set velocity
        v.add( dvdt.multiplyScalar( delta_t ) );
        setElement( i, velocities, v );
    }
};

EulerUpdater.prototype.updateColors = function ( particleAttributes, alive, delta_t ) {
    var colors    = particleAttributes.color;

    var factor = 1.0 - delta_t / 4.0;
    if (factor < 0.1) factor = 0.1; // protection against large timestep instability

    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var c = getElement( i, colors );
        c.w *= factor; // exponential decay in alpha

        setElement( i, colors, c );
    }
};

EulerUpdater.prototype.updateSizes = function ( particleAttributes, alive, delta_t ) {
    var sizes    = particleAttributes.size;

    var factor = 1.0 - delta_t / 8.0; // timescale
    if (factor < 0.1) factor = 0.1; // protection against large timestep instability

    for ( var i = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var s = getElement( i, sizes );
        s *= factor; // exponential decay in size

        setElement( i, sizes, s );
    }
};

EulerUpdater.prototype.updateLifetimes = function ( particleAttributes, alive, delta_t) {
    var positions     = particleAttributes.position;
    var lifetimes     = particleAttributes.lifetime;

    for ( var i = 0 ; i < alive.length ; ++i ) {

        if ( !alive[i] ) continue;

        var lifetime = getElement( i, lifetimes );

        if ( lifetime < 0 ) {
            killParticle( i, particleAttributes, alive );
        } else {
            setElement( i, lifetimes, lifetime - delta_t );
        }
    }
};

EulerUpdater.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    var i, plane;
    if ( this._opts.collidables.bouncePlanes ) {
        for (i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            plane = this._opts.collidables.bouncePlanes[i].plane;
            var damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }

    if ( this._opts.collidables.sinkPlanes ) {
        for (i = 0 ; i < this._opts.collidables.sinkPlanes.length ; ++i ) {
            plane = this._opts.collidables.sinkPlanes[i].plane;
            Collisions.SinkPlane( particleAttributes, alive, delta_t, plane );
        }
    }

    if ( this._opts.collidables.bounceSpheres ) {
        for (i = 0 ; i < this._opts.collidables.bounceSpheres.length ; ++i ) {
            var sphere = this._opts.collidables.bounceSpheres[i].sphere;
            damping = this._opts.collidables.bounceSpheres[i].damping;
            Collisions.BounceSphere( particleAttributes, alive, delta_t, sphere, damping );
        }
    }
};

EulerUpdater.prototype.update = function ( particleAttributes, alive, delta_t ) {
    this.updateLifetimes( particleAttributes, alive, delta_t );
    this.updateVelocities( particleAttributes, alive, delta_t );
    this.updatePositions( particleAttributes, alive, delta_t );

    this.collisions( particleAttributes, alive, delta_t );

    this.updateColors( particleAttributes, alive, delta_t );
    this.updateSizes( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;
};

////////////////////////////////////////////////////////////////////////////////
// Cloth updater
////////////////////////////////////////////////////////////////////////////////

function ClothUpdater ( opts ) {
    this._opts = opts;
    this._s = 10.0;
    this._k_s = 100.0;
    return this;
}

ClothUpdater.prototype.calcHooke = function ( p, q, vp, vq ) {
    var k_s = this._k_s;
    var rest_len = this._s;
    var m = 0.1;
    var k_d = 2.0 * Math.sqrt( m * k_s );

    var pq = q.clone().sub(p);
    var len = pq.length();
    pq.normalize();

    var spring_term = k_s * (len - rest_len);
    var damping_term = k_d * vq.clone().sub(vp).dot(pq);

    return pq.multiplyScalar( spring_term + damping_term );
};

ClothUpdater.prototype.updatePositions = function ( particleAttributes, alive, delta_t ) {
    var positions  = particleAttributes.position;
    var velocities = particleAttributes.velocity;

    for ( var i  = 0 ; i < alive.length ; ++i ) {
        if ( !alive[i] ) continue;
        var p = getElement( i, positions );
        var v = getElement( i, velocities );
        p.add( v.clone().multiplyScalar( delta_t ) );
        setElement( i, positions, p );
    }
};

ClothUpdater.prototype.updateVelocities = function ( particleAttributes, alive, delta_t, width, height ) {
    var positions = particleAttributes.position;
    var velocities = particleAttributes.velocity;
    var gravity = this._opts.externalForces.gravity;
    var attractors = this._opts.externalForces.attractors;

    for ( var j = 0; j < height; ++j ) {
        for ( var i = 0; i < width; ++i ) {
            var idx = j * width + i;

            var p = getElement( idx, positions );
            var v = getElement( idx, velocities );
            var dvdt = new THREE.Vector3();

            // gravity
            dvdt.add( gravity );
            // attractors
            for ( var k = 0; k < attractors.length; k++ ) {
                var delta_p = p.clone().sub(attractors[k].center);
                var d = delta_p.length();
                dvdt.add( delta_p.normalize().multiplyScalar( -attractors[k].radius / (d) ) );
            }
            // Hooke forces
            if ( j > 0 )            dvdt.add( this.calcHooke( p, getElement( idx - width, positions ),
                                                              v, getElement( idx - width, velocities ) ) );
            if ( j < height - 1 )   dvdt.add( this.calcHooke( p, getElement( idx + width, positions ),
                                                              v, getElement( idx + width, velocities ) ) );
            if ( i > 0 )            dvdt.add( this.calcHooke( p, getElement( idx - 1,     positions ),
                                                              v, getElement( idx - 1,     velocities ) ) );
            if ( i < width - 1 )    dvdt.add( this.calcHooke( p, getElement( idx + 1,     positions ),
                                                              v, getElement( idx + 1,     velocities ) ) );

            // set velocity
            v.add( dvdt.multiplyScalar( delta_t ) );

            setElement( idx, velocities, v );
        }
    }
};


ClothUpdater.prototype.collisions = function ( particleAttributes, alive, delta_t ) {
    if ( !this._opts.collidables ) {
        return;
    }
    var i, plane, damping;
    if ( this._opts.collidables.bouncePlanes ) {
        for (i = 0 ; i < this._opts.collidables.bouncePlanes.length ; ++i ) {
            plane = this._opts.collidables.bouncePlanes[i].plane;
            damping = this._opts.collidables.bouncePlanes[i].damping;
            Collisions.BouncePlane( particleAttributes, alive, delta_t, plane, damping );
        }
    }

    if ( this._opts.collidables.sinkPlanes ) {
        for (i = 0 ; i < this._opts.collidables.sinkPlanes.length ; ++i ) {
            plane = this._opts.collidables.sinkPlanes[i].plane;
            Collisions.SinkPlane( particleAttributes, alive, delta_t, plane );
        }
    }

    if ( this._opts.collidables.bounceSpheres ) {
        for (i = 0 ; i < this._opts.collidables.bounceSpheres.length ; ++i ) {
            var sphere = this._opts.collidables.bounceSpheres[i].sphere;
            damping = this._opts.collidables.bounceSpheres[i].damping;
            Collisions.BounceSphere( particleAttributes, alive, delta_t, sphere, damping );
        }
    }
};


ClothUpdater.prototype.update = function ( particleAttributes, alive, delta_t, width, height ) {
    this.updateVelocities( particleAttributes, alive, delta_t, width, height );
    this.updatePositions( particleAttributes, alive, delta_t, width, height );

    this.collisions( particleAttributes, alive, delta_t );

    // tell webGL these were updated
    particleAttributes.position.needsUpdate = true;
    particleAttributes.color.needsUpdate = true;
    particleAttributes.velocity.needsUpdate = true;
    particleAttributes.lifetime.needsUpdate = true;
    particleAttributes.size.needsUpdate = true;
};
