attribute float rand; // Verilen rastgele büyüklükle (0.5 ~ 1) atış noktası
attribute float generTime;

uniform float uExitTime;
uniform float uFadeTime; // Geçiş kaybolma süresi
uniform float uTime; // Şu anki zaman
uniform float uScale; // Atış noktası boyutu

varying float vElapsed; // Atış noktası oluşturulma zamanı
varying float vRand;

vec3 upperDirection=vec3(0.,1.,0.);

void main()
{
    
    vRand=rand;
    
    // Atış noktasının pozisyonunu hesapla (temel pozisyon)
    
    vec3 pointPosition=position;
    pointPosition+=normalize(cameraPosition-position)*.01; // Kamera yönüne doğru hareket et (temel)
    pointPosition+=normal*.2; // Toz, vurulan yüzeyin normale doğru hareket eder
    pointPosition+=upperDirection*.1;
    
    // Atış noktasının boyutunu hesapla
    
    float pointSize=32.; // Atış noktası varsayılan boyutu
    pointSize+=64.*rand; // Atış noktası, rastgele değeri etkileyen varsayılan boyutu
    pointSize*=uScale; // Boyut, uniform özelleştirilmiş değere göre etkilenir
    
    float elapsed=uTime-generTime; // Geçen zaman
    vElapsed=elapsed;
    float disapperTime=uExitTime+uFadeTime; // Kaybolma toplam süresi
    
    pointPosition+=(1.*normal+.5*upperDirection)*elapsed;// S=v*t
    pointSize*=.25+elapsed/disapperTime*.2;
    
    // Nokta pozisyonu
    
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(pointPosition,1.);
    
    // Nokta boyutu
    
    gl_PointSize=pointSize;
    vec4 viewPosition=viewMatrix*vec4(pointPosition,1.);
    gl_PointSize*=(1./-viewPosition.z); // Nokta boyutu, uzaklığa göre etkilenir
    
}