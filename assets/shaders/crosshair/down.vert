uniform float uSize;        // Nesnenin boyutu
uniform float uThinkness;   // Nesnenin kalınlığı
uniform float uGap;         // Nesne parçaları arasındaki boşluk
uniform float uAspect;      // Yatay/vertikal oranı (görünümün bozulmaması için)

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
    
    // Y ekseninde görünümü ayarlamak için aspect oranı (yükseltme işlemi)
    mat4 withoutAspect=scale(1.,uAspect,1.);

    // Boyut ve kalınlık uygulama
    mat4 thinknessAndSize=scale(uThinkness,uSize,1.);

    // Y ekseninde nesnenin yerini ayarlama (crosshair gibi bir öğe için)
    mat4 crossIndex=translate(0.,-uSize/2.,0.);

    // Parçalar arasındaki boşluk uygulaması
    mat4 crossGap=translate(0.,-uGap,0.);
    
    // Final model dönüşümü
    // projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);
    gl_Position=crossGap*crossIndex*thinknessAndSize*vec4(position,1.);
    
}
