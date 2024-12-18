uniform float uOpacity;
uniform float uExitTime;
uniform float uFadeTime; // Geçiş kaybolma süresi
uniform sampler2D uAshT;

varying float vElapsed; // Atış noktası oluşturulma zamanı
varying float vRand;

mat4 makeRotationZ(float theta)
{
    return mat4(
        cos(theta),-sin(theta),0,0,
        sin(theta),cos(theta),0,0,
        0,0,1,0,
        0,0,0,1
    );
}

void main()
{
    float fadeMask=step(uExitTime,vElapsed); // Geçiş kaybolma başladığında 1 olur
    fadeMask*=(vElapsed-uExitTime)/uFadeTime;
    
    if(uOpacity-fadeMask<0.){ // Performansı biraz artır
        discard;
    }
    
    vec4 randRotate=makeRotationZ(vRand*3.14)*vec4(gl_PointCoord-vec2(.5),0.,1.);// gl.POINTS, (left,top):(0,0) (right, bottom): (1, 1)
    vec4 colorFromT=texture2D(uAshT,randRotate.xy+vec2(.5)); // Matris, (0, 0) noktasını merkez alarak dönüşüm yapar
    
    gl_FragColor=vec4(colorFromT.rgb,colorFromT.a*(uOpacity-fadeMask)*vRand);
}