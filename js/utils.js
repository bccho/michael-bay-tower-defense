////////////////////////////////////////////////////////////////////////////////
// Utility functions for working in the Game Engine                           //
////////////////////////////////////////////////////////////////////////////////

// takes a prototype and instantiates it in-game
function create(gameObjectType, kwargs) {
    return GameEngine.createGameObject(gameObjectType, kwargs);
}

// removes a specific instance from the game by reference
function destroy(gameObjectReference) {
    GameEngine.destroyGameObject(gameObjectReference);
}

////////////////////////////////////////////////////////////////////////////////
// Utility function to accessing correct element in arrays                    //
////////////////////////////////////////////////////////////////////////////////
function getElement ( i, attrib ) {
    if ( attrib.itemSize === 1 ) {

        return attrib.array[i];

    } else if ( attrib.itemSize === 3 ) {

        return new THREE.Vector3( attrib.array[ 3 * i     ],
                                  attrib.array[ 3 * i + 1 ],
                                  attrib.array[ 3 * i + 2 ] );

    } else if ( attrib.itemSize === 4 ) {

        return new THREE.Vector4( attrib.array[ 4 * i     ],
                                  attrib.array[ 4 * i + 1 ],
                                  attrib.array[ 4 * i + 2 ],
                                  attrib.array[ 4 * i + 3 ] );

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
}

function getGridElement ( i, j, width, attrib ) {
    var idx = j * width + i;
    if ( attrib.itemSize === 1 ) {

        return attrib.array[idx];

    } else if ( attrib.itemSize === 3 ) {

        return new THREE.Vector3( attrib.array[ 3 * idx     ],
                                  attrib.array[ 3 * idx + 1 ],
                                  attrib.array[ 3 * idx + 2 ] );

    } else if ( attrib.itemSize === 4 ) {

        return new THREE.Vector4( attrib.array[ 4 * idx     ],
                                  attrib.array[ 4 * idx + 1 ],
                                  attrib.array[ 4 * idx + 2 ],
                                  attrib.array[ 4 * idx + 3 ] );

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
}

function setElement ( i, attrib, val ) {
    if ( attrib.itemSize === 1 ) {

        attrib.array[i] = val;

    } else if ( attrib.itemSize === 3 ) {

        attrib.array[ 3 * i     ] = val.x;
        attrib.array[ 3 * i + 1 ] = val.y;
        attrib.array[ 3 * i + 2 ] = val.z;

    } else if ( attrib.itemSize === 4 ) {

        attrib.array[ 4 * i     ] = val.x;
        attrib.array[ 4 * i + 1 ] = val.y;
        attrib.array[ 4 * i + 2 ] = val.z;
        attrib.array[ 4 * i + 3 ] = val.w;

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
}

function setGridElement ( i, j, width, attrib, val ) {
    var idx = j * width + i;
    if ( attrib.itemSize === 1 ) {

        attrib.array[idx] = val;

    } else if ( attrib.itemSize === 3 ) {

        attrib.array[ 3 * idx     ] = val.x;
        attrib.array[ 3 * idx + 1 ] = val.y;
        attrib.array[ 3 * idx + 2 ] = val.z;

    } else if ( attrib.itemSize === 4 ) {

        attrib.array[ 4 * idx     ] = val.x;
        attrib.array[ 4 * idx + 1 ] = val.y;
        attrib.array[ 4 * idx + 2 ] = val.z;
        attrib.array[ 4 * idx + 3 ] = val.w;

    } else {

        console.log( "Not handled attribute size for attribute: ", attrib );
        return undefined;

    }
}

function killParticle ( i, particleAttributes, alive ) {
    alive[i] = false;
    setElement( i, particleAttributes.position, new THREE.Vector3(-1e9) );
}

function setDefault(dict, key, defaultValue) {
    if (!dict.hasOwnProperty(key)) dict[key] = defaultValue;
    return dict;
}

function hypot(x, y) {
    return Math.sqrt(x * x + y * y);
}

function lerp(x0, x1, alpha) {
    return x0 * (1 - alpha) + x1 * alpha;
}

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
