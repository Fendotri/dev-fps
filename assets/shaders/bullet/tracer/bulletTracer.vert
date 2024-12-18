attribute vec3 diappearPosition; // Kaybolan pozisyon (silinen yer)
attribute float generTime; // Oluşum zamanı (generasyon zamanı)
attribute float rand; // Rastgele değer

uniform float uTime; // Geçerli zaman
uniform float uBulletTracerFaded; // Mermi izinin kaybolma süresi

varying float vElapsed; // Geçen zaman (vElapsed)

void main(){
    
    // Geçen süreyi hesapla
    float elapsed=uTime-generTime;
    vElapsed=elapsed;
    
    // Rastgele kaybolma süresi ile kaybolan iz
    float uBulletTracerFaded1=rand*uBulletTracerFaded;
    
    // Mermi izinin kaybolma durumunu hesapla
    float lamp=smoothstep(uBulletTracerFaded1,0.,elapsed);

    // Şu anki mermi pozisyonunu hesapla
    vec3 positionTrans=lamp*position+(1.-lamp)*diappearPosition;
    
    // Pozisyonu dönüşüm matrisiyle hesapla ve ekrana yerleştir
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(positionTrans,1.);

    // Nokta boyutunu belirle
    gl_PointSize=40.;
    
    // Görüş alanındaki mesafeye göre boyutu etkileyerek ayarla
    vec4 viewPosition=viewMatrix*vec4(positionTrans,1.);
    gl_PointSize*=(1./-viewPosition.z); // Nokta boyutu uzaklığa göre ayarlanır
    
}