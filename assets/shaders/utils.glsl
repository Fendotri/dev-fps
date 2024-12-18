// 1. Curves From Inigo Quilez http://www.iquilezles.org/www/articles/functions/functions.htm

// 2. getRandomValue
// Bu fonksiyon, verilen 2D vektör üzerinden rastgele bir değer üretir.
float rand(vec2 co)
{
    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}

// 3. Matrixler (Dönüşüm Matrisi) - 3D grafiklerde kullanılır
// Ölçekleme fonksiyonu
mat4 scale(float x,float y,float z)
{
    return mat4(
        x,0,0,0,
        0,y,0,0,
        0,0,z,0,
        0,0,0,1
    );
}

// Çevirme (Taşıma) fonksiyonu
mat4 translate(float x,float y,float z)
{
    return mat4(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        x,y,z,1
    );
}

// X ekseninde dönüşüm fonksiyonu
mat4 makeRotationX(float theta)
{
    return mat4(
        1,0,0,0,
        0,cos(theta),-sin(theta),0
        0,sin(theta),cos(theta),0
        0,0,0,1
    );
}

// Z ekseninde dönüşüm fonksiyonu
mat4 makeRotationZ(float theta)
{
    return mat4(
        cos(theta),-sin(theta),0,0,
        sin(theta),cos(theta),0,0,
        0,0,1,0,
        0,0,0,1
    );
}
