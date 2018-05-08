attribute vec3 position;
attribute vec3 velocity;
attribute float lifetime;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    // "gl_PointSize = customSize * ( 300.0 / length( mvPosition.xyz ) );",     // scale particles as objects in 3D space
    gl_Position = projectionMatrix * mvPosition;
}

