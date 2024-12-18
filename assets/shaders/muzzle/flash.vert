attribute float rand;      // Partiküller için rastgele bir değer (örneğin, yön veya hareket)
uniform float uScale;     // Partikül boyutunu ölçeklendirmek için kullanılan uniform değeri
varying float vRand;      // Vertex'ten fragmente geçecek rastgele değer

void main(){
    
    vRand=rand; // Rastgele değeri, fragmant shader'a geçireceğiz
    
    gl_PointSize=200.; // Varsayılan partikül boyutu (200)
    gl_PointSize*=uScale; // uScale ile özelleştirilmiş boyut
    
    // Vertex pozisyonunu hesaplayarak ekran koordinatlarına dönüştürür
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);
}