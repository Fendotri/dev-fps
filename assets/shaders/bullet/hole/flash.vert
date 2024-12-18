attribute float rand; // Atış noktası rastgele boyut ver
attribute float generTime;

uniform float uTime; // Geçerli zaman
uniform float uScale; // Atış noktası boyutu

varying float vRand;
varying float elapsed; // Atış noktasının varlık süresi

void main()
{
    
    vRand=rand;
    elapsed=uTime-generTime; // Zaten var olan zaman
    
    // Atış noktası yerini hesapla
    vec3 position1=position;
    position1+=normalize(cameraPosition-position)*.05; // Kameraya doğru hareket et (temel)
    position1+=normal*.05; // Vurulan yüzeyin normal yönünde hareket et
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position1,1.); // Nokta pozisyonu
    
    // Atış noktası boyutunu hesapla
    
    gl_PointSize=32.; // Atış noktasının varsayılan boyutu
    gl_PointSize+=(48.*rand); // Atış noktası boyutunun rastgele değerden etkilenmiş hali
    gl_PointSize*=uScale; // Boyut, uniform ile özelleştirilmiş bir değerden etkilenir
    vec4 viewPosition=viewMatrix*vec4(position1,1.);
    gl_PointSize*=(1./-viewPosition.z); // Boyut, uzaklıkla orantılı olarak değişir
    
}