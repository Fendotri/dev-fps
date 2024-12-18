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

void main(){
    
    // Görünüm oranını (aspect ratio) düzeltmek için, Y ekseninde ölçekleme
    mat4 withoutAspect=scale(1.,uAspect,1.);

    // Boyut ve kalınlık uygulaması
    mat4 thinknessAndSize=scale(uThinkness,uSize,1.);

    // Nesneyi Y ekseninde yukarı kaydırma (yani çapraz işaretin uzunluğunun yarısı kadar)
    mat4 crossIndex=translate(0.,uSize/2.,0.);

    // Parçalar arasındaki boşluğu uygulama
    mat4 crossGap=translate(0.,uGap,0.);
    
    // Son olarak tüm dönüşümleri uygula
    // projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.); // 由于使用了正交相机因此不用mvp
    gl_Position=crossGap*crossIndex*thinknessAndSize*vec4(position,1.);
    
}