attribute float rand; // Atış deliği için rastgele boyut
attribute float generTime;

uniform float uTime; // Mevcut zaman
uniform float uScale; // Atış deliği boyutu

varying float vElapsed; // Atış noktasının oluşturulma süresi
varying float vRand;

void main()
{
    vRand=rand;
    vElapsed=uTime-generTime; // Zaman farkı (var olma süresi)
    
    // Atış deliği noktasının konumunu hesapla
    vec3 position1=position;
    position1+=normalize(cameraPosition-position)*.01; // Kamera yönüne doğru hareket (temel)
    position1+=normal*.01; // Çarpma yüzeyinin normaline doğru hareket
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position1,1.); // Nokta konumu
    
    // Atış deliği noktasının boyutunu hesapla
    
    gl_PointSize=32.; // Atış deliği varsayılan boyutu
    gl_PointSize+=(48.*rand); // Atış deliği boyutu, rastgele değere göre etkilenir
    gl_PointSize*=uScale; // Boyut, uniform özelleştirilmiş değere göre etkilenir
    vec4 viewPosition=viewMatrix*vec4(position1,1.);
    gl_PointSize*=(1./-viewPosition.z); // Nokta boyutu, uzaklığa göre etkilenir
    
}