// Emitter controls one particle system. Inherits from GameObject
function Emitter(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._maxParticleCount     = undefined;
    this._particlesPerSecond   = undefined;
    this._initializer          = undefined;
    this._updater              = undefined;
    this._cloth                = false;
    this._width                = undefined;
    this._height               = undefined;
    this._lifespan             = undefined;
    this._attributeInformation = {
        position:      3,
        velocity:      3,
        color:         4,
        size:          1,
        lifetime:      1,
        dampening:     3
    };

    this._created = GameEngine.now(); // time of creation of emitter

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if ( option === "material" ) {
            this._material = value;
        } else if ( option === "maxParticles" ) {
            this._maxParticleCount = value;
        } else if ( option === "particlesFreq" ) {
            this._particlesPerSecond = value;
        } else if ( option === "initialize" ) {
            this._initializer = value;
        } else if ( option === "update" ) {
            this._updater = value;
        } else if ( option === "material" ) {
            this._material = value;
        } else if ( option === "cloth" ) {
            this._cloth = value;
        } else if ( option === "width" ) {
            this._width = value;
        } else if ( option === "height" ) {
            this._height = value;
        } else if ( option === "lifespan") {
            this._lifespan = value;
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
    }
    GameObject.call(this, kwargs);

    if (this._cloth === true) {
        this._maxParticleCount = this._width * this._height;
        this._particlesPerSecond = 1e8 * this._maxParticleCount;
    }

    // These are more internal variables that will be initialized based on parsed arguments.
    // For example, attributes given to THREE.BufferGeometry will depend on attributeInformation
    // variable.
    this._particles          = new THREE.BufferGeometry();
    this._initialized        = [];

    var i, j;

    // Store indices of available particles - these are not initialized yet
    for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
        this._initialized[i] = false;
    }

    // Allocate memory for the particles
    for ( var attributeKey in this._attributeInformation ) {
        // get info from attributeInformation, required to initialize correctly sized arrays
        var attributeLength = this._attributeInformation[ attributeKey ];
        var attributeArray = new Float32Array( this._maxParticleCount * attributeLength );

        // Since these are zero - initialized, they will appear in the scene.
        // By setting all to be negative infinity we will effectively remove these from rendering.
        // This is also how you "remove" dead particles
        for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = 1e-9;
            }
        }

        this._particles.addAttribute( attributeKey, new THREE.BufferAttribute( attributeArray, attributeLength ) );
    }

    // in case of cloth we need to describe to webGL how to render it.
    if (this._cloth === true) {

        var indices = new Uint16Array( (this._width - 1) * (this._height - 1) * 6 );
        var idx = 0;
        for ( i = 0 ; i < this._width - 1 ; i++ ) {
            for ( j = 0 ; j < this._height - 1 ; j++ ) {
                indices[ 6 * idx     ] = j * this._width + i;
                indices[ 6 * idx + 1 ] = (j + 1) * this._width + i;
                indices[ 6 * idx + 2 ] = j * this._width + i + 1;

                indices[ 6 * idx + 3 ] = (j + 1) * this._width + i;
                indices[ 6 * idx + 4 ] = (j + 1) * this._width + i + 1;
                indices[ 6 * idx + 5 ] = j * this._width + i + 1;

                idx += 1;
            }
        }
        this._particles.addAttribute( 'index', new THREE.BufferAttribute( indices, 3 ) );
        this._particles.computeVertexNormals();
    }

    this._particleAttributes = this._particles.attributes; // for convenience / less writing / not sure / #badprogramming

    this._sorting = false;
    this._distances = [];
    this._backupArray = new Float32Array( this._maxParticleCount * 4 );

    // Create the drawable particles - this is the object that three.js will use to draw stuff onto screen
    if ( this._cloth === true ) {
        this._drawableParticles = new THREE.Mesh( this._particles, this._material );
    } else {
        this._drawableParticles = new THREE.PointCloud( this._particles, this._material );
    }

    return this;
}
Emitter.prototype = new GameObject();

Emitter.prototype.update = function(delta_t) {
    // how many particles should we add?
    var toAdd = Math.floor( delta_t * this._particlesPerSecond );

    if ( toAdd > 0 ) {
        this._initializer.initialize ( this._particleAttributes, this.getSpawnable( toAdd ), this._width, this._height );
    }

    // add check for existence
    this._updater.update( this._particleAttributes, this._initialized, delta_t, this._width, this._height );

    // sorting -> Move it to camera update / loop update so that it is updated each time even if time is paused?
    if ( this._sorting === true ) {
        this.sortParticles();
    }

    // for visibility culling
    this._drawableParticles.geometry.computeBoundingSphere();

    // particle position change each frame so we need
    if ( this._cloth === true ) {
        this._particles.computeVertexNormals();
    }
};

Emitter.prototype.getModel = function () {
    return this._drawableParticles;
};



Emitter.prototype.restart = function() {
    var i, j;

    for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
        this._initialized[i] = 0;
    }

    for ( var attributeKey in this._particleAttributes ) {
        var attribute       = this._particleAttributes[attributeKey];
        var attributeArray  = attribute.array;
        var attributeLength = attribute.itemSize;

        for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = 1e-9;
            }
        }

        attribute.needsUpdate = true;
    }
};

Emitter.prototype.enableSorting = function( val ) {
    this._sorting = val;
};

Emitter.prototype.sortParticles = function () {
    var positions  = this._particleAttributes.position;
    var cameraPosition = Renderer._camera.position;

    var i, j;

    for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
        var currentPosition =  getElement( i, positions );
        this._distances[i] = [cameraPosition.distanceToSquared( currentPosition ),i];
    }

    this._distances.sort( function( a, b ) { return a[0] < b[0] } );

    for ( var attributeKey in this._particleAttributes ) {

        var attributeLength = this._particleAttributes[ attributeKey ].itemSize;
        var attributeArray  = this._particleAttributes[ attributeKey ].array;

        for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( j = 0 ; j < attributeLength ; ++j ) {
                this._backupArray[4 * i + j ] = attributeArray[ attributeLength * this._distances[i][1] + j ]
            }
        }

        for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
            for ( j = 0 ; j < attributeLength ; ++j ) {
                attributeArray[ attributeLength * i + j ] = this._backupArray[4 * i + j ];
            }
        }
    }

    var initialized_cpy = [];
    for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
        initialized_cpy[ i ] = this._initialized[ this._distances[i][1] ];
    }

    for ( i = 0 ; i < this._maxParticleCount ; ++i ) {
        this._initialized[ i ] = initialized_cpy[i];
    }
};

Emitter.prototype.getSpawnable = function ( toAdd ) {
    var toSpawn = [];
    for ( var i = 0 ; i < this._maxParticleCount ; ++i ) {

        if ( this._initialized[i] ) continue;
        if ( toSpawn.length >= toAdd ) break;
        this._initialized[i] = true;
        toSpawn.push(i);

    }

    return toSpawn;
};
