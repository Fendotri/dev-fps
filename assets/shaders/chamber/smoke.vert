uniform float uTime; // Geçen zaman
uniform float uSpeed; // Dumanın hareket hızı

attribute float generTime; // Dumanın oluşturulma zamanı
attribute float rand; // Rastgele faktör (büyüklük ve hareket için)
attribute vec3 direction; // Dumanın hareket yönü

varying float vElapsed; // Geçen süre
varying float vRand; // Rastgele faktör

vec3 upperDirection=vec3(0,1,0); // Yukarıya doğru yön

// "almost identity" fonksiyonu, bir değer ve sabit arasındaki farkı hesaplar
float almostIdentity(float x,float n)
{
    return sqrt(x*x+n); // Çok küçük bir değişim ekler
}

void main(){
    
    // Geçen zamanı hesapla
    
    float elapsed=uTime-generTime;
    vElapsed=elapsed;
    vRand=rand;
    
    // Dumanın hareketi
    
    vec3 position1=position;
    position1+=direction*uSpeed*elapsed; // Dumanın ana hareketi (hız ve yön)
    position1+=upperDirection*elapsed*(rand*.3+.1); // Yukarıya doğru yayılma (rastgele etki)
    
    // Kamera dönüşüm matrisleri ile pozisyonu hesapla
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position1,1.);
    
    // Dumanın boyutunu hesapla
    gl_PointSize=512.; // Başlangıç boyutu 
    gl_PointSize*=.3*rand+.7; // Rastgele büyüklük ekle
    gl_PointSize*=almostIdentity(elapsed,1.); // Zamanla büyüme
    vec4 positionViewCoord=viewMatrix*modelMatrix*vec4(position1,1.);
    gl_PointSize*=(1./-positionViewCoord.z); // Kamera uzaklığına göre boyut
    
}