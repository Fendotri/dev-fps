uniform vec3 uColor; // Renk bilgisi (RGB formatında)
uniform float uAlpha; // Alfa (şeffaflık) bilgisi

void main(){
    
    gl_FragColor=vec4(uColor,uAlpha); // Renk ve alfa birleşimiyle fragman rengi ayarlanır
    
}