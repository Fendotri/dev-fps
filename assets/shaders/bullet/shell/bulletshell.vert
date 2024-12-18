
attribute float generTime;
attribute float rand;

uniform float uTime;
uniform float uScale;

varying float vElapsed;
varying float vRand;

void main(){
    
    float elapsed=uTime-generTime;
    vElapsed=elapsed;
    vRand=rand;
    
    float randFactor=.5+.5*rand;
    float speedFactor=2.;
    float powerFactorVert=2.*randFactor;
    float powerFactorHorize=1.2*randFactor;
    
    vec3 rightVelocity=powerFactorHorize*vec3(0.,0.,1.); // Sağ yön (right direction)
    vec3 upVelocity=powerFactorVert*vec3(0.,1.,0); // Yukarı yön (upward direction)
    vec3 downVelcity=vec3(0,-9.8,-0); // Aşağı yön (downward direction)
    
    vec3 position1=position;
    position1+=speedFactor*rightVelocity*elapsed; // Yatay hareket bileşeni (horizontal component)
    position1+=speedFactor*(upVelocity*elapsed+.5*downVelcity*elapsed*elapsed); // Dikey hareket bileşeni (vertical component)
    
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position1,1.);
    
    gl_PointSize=32.*uScale;
    gl_PointSize*=(.8+.2*rand);
    vec4 viewPosition=viewMatrix*vec4(position,1.);
    gl_PointSize*=(1./-viewPosition.z); // Nokta boyutu, uzaklığa göre etkilenir (Point size is affected by distance)
    
}