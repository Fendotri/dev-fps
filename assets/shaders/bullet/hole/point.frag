uniform float uOpacity;
uniform float uExitTime;
uniform float uFadeTime; // Geçişle kaybolma süresi
uniform sampler2D uBulletHoleT;

varying float vElapsed; // Atış noktasının oluşturulma süresi
varying float vRand;// [.5,1.]

void main()
{
    // Geçiş kaybolma maskesi
    float fadeMask=step(uExitTime,vElapsed); // Kaybolmaya başlama için 1'e eşitle
    fadeMask*=(vElapsed-uExitTime)/uFadeTime;
    
    // Performans optimizasyonu    
    if(uOpacity-fadeMask<0.){
        discard;
    }
    
    // Rastgele sayıya göre 4 çeşit atış deliğinden birini göster    
    vec2 pointCoord=gl_PointCoord/2.;
    pointCoord.x+=.5;
    pointCoord.y+=.5;
    float index=floor(vRand/.125);// [4, 8]
    if(index==4.){
        pointCoord.x-=.5;
        pointCoord.y-=.5;
    }else if(index==5.){
        pointCoord.y-=.5;
    }else if(index==6.){
        pointCoord.x-=.5;
    }
    vec4 temp=texture2D(uBulletHoleT,pointCoord);
    
    // gl_FragColor=vec4(vec3(0.),uOpacity-fadeMask);
    gl_FragColor=vec4(temp.rgb,(uOpacity-fadeMask)*temp.a);
    
}