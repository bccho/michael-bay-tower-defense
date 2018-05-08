uniform sampler2D texture;

void main() {
   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    // "vec4 rotatedTexture = texture2D( texture,  rotatedUV );",
   // "gl_FragColor = gl_FragColor * rotatedTexture;",    // sets an otherwise white particle texture to desired color
}
