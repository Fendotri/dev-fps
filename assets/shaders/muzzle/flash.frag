uniform sampler2D uOpenFireT;  // Ateş efekti için kullanılan tekstür
uniform float uTime;           // Zaman (bu, animasyonun ilerlemesini simüle eder)
uniform float uFireTime;       // Ateşin başladığı zaman
uniform float uFlashTime;      // Parlamanın devam ettiği süre

varying float vRand;           // Rastgele bir değer, genellikle partiküllerin rastgele yönlerde hareket etmesini sağlar

// Exponential impulso fonksiyonu, bir değeri k ile çarpar ve ardından bir üssel fonksiyon uygular
float expImpulse(float x,float k)
{
    float h=k*x;
    return h*exp(1.-h);
}

// Z ekseninde dönüşüm matrisi (rotaion) oluşturur
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
    
    // Rastgele dönüşüm: texture koordinatları üzerinde dönüşüm uygulama
    vec4 randRotate=makeRotationZ(vRand*3.14)*vec4(gl_PointCoord-vec2(.5),0.,1.);

    // Texture'den renk verisi alıyoruz
    vec4 colorFromT=texture2D(uOpenFireT,randRotate.xy+vec2(.5));
    
    // Geçen süreyi hesaplıyoruz
    float elapsedTime=uTime-uFireTime;

    // Parlamanın zamanlamasını belirleyen maske
    float flashMask=step(elapsedTime,uFlashTime);
    
    // Son renk: flashMask zamanla değişir ve parlamayı kontrol eder
    gl_FragColor=vec4(colorFromT.rgb,colorFromT.a*flashMask);
    
}