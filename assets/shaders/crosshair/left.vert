uniform float uSize;        // Nesnenin boyutu
uniform float uThinkness;   // Nesnenin kalınlığı
uniform float uGap;         // Nesne parçaları arasındaki boşluk
uniform float uAspect;      // Yatay/vertikal oranı (görünüm bozulmalarını engellemek için)

mat4 scale(float x,float y,float z)
{
    return mat4(
        x,0,0,0,
        0,y,0,0,
        0,0,z,0,
        0,0,0,1
    );
}

mat4 translate(float x,float y,float z)
{
    return mat4(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        x,y,z,1
    );
}

mat4 makeRotationZ(float angle)
{
    return mat4(
        cos(angle),-sin(angle),0,0,
        sin(angle),cos(angle),0,0,
        0,0,1,0,
        0,0,0,1
    );
}

void main(){
    
    float PI=3.141592653589793; // PI sayısını tanımla
    
    // Görünüm oranını (aspect ratio) düzeltmek için Y ekseninde ölçekleme
    mat4 withoutAspect=scale(1./uAspect,uAspect,1.);

    // Boyut ve kalınlık uygulaması
    mat4 thinknessAndSize=scale(uThinkness,uSize,1.);

    // Z'ye 90 derece döndürme matrisini oluştur
    mat4 crossLeft=makeRotationZ(-PI/2.);

    // Nesneyi X ekseninde sola kaydırma (yani çapraz işaretin uzunluğunun yarısı kadar)
    mat4 crossIndex=translate(-uSize/2.,0.,0.);

    // Parçalar arasındaki boşluğu uygulama
    mat4 crossGap=translate(-uGap,0.,0.);
    
    // Son olarak tüm dönüşümleri uygula
    // projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);
    gl_Position=withoutAspect*crossGap*crossIndex*crossLeft*thinknessAndSize*vec4(position,1.);
    
}