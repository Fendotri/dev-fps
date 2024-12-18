
uniform sampler2D uSmokeT; // Duman dokusu
uniform float uOpacityFactor; // Dumanın opaklık faktörü

uniform float uDisappearTime; // Dumanın kaybolmaya başlama zamanı
uniform float uFadeTime; // Dumanın kaybolma süresi

varying float vElapsed; // Geçen süre (dumanın var olma süresi)
varying float vRand; // Rastgele değer (dönme için)

// p-curve fonksiyonu, kaybolma sürecini düzgünleştirir
float pcurve(float x,float a,float b)
{
    float k=pow(a+b,a+b)/(pow(a,a)*pow(b,b));
    return k*pow(x,a)*pow(1.-x,b);
}

// Z ekseninde dönüş matrisi
mat4 makeRotationZ(float theta)
{
    return mat4(
        cos(theta),-sin(theta),0,0,
        sin(theta),cos(theta),0,0,
        0,0,1,0,
        0,0,0,1
    );
}

void main(){
    
    // Shader optimizasyonu: Eğer dumanın kaybolma süresi geçtiyse, shader'ı durdur
    
    if(vElapsed>uDisappearTime+uFadeTime){discard;}
    
    vec4 temp=vec4(1.);
    
    // Dumanı döndürme işlemi
    
    vec2 pointCoord=gl_PointCoord;
    pointCoord=pointCoord-vec2(.5);
    vec4 randRotate=makeRotationZ(vRand*3.14)*vec4(pointCoord,0.,1.);
    vec4 colorFromT=texture2D(uSmokeT,randRotate.xy+vec2(.5));
    temp=colorFromT;
    
    // Kaybolma (fade) işlemi
    
    float fadeFactor=pcurve(vElapsed,uDisappearTime,uFadeTime);
    
    // Sonuç rengini hesapla
    gl_FragColor=vec4(temp.rgb,temp.a*uOpacityFactor*fadeFactor);
    // gl_FragColor=vec4(vec3(1.),fadeFactor);
    
}