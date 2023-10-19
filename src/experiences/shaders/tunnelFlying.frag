varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;
uniform float uSeed;
uniform float uDynamic;

#define PI 3.14159265358979
#define MOD3 vec3(.1031,.11369,.13787)

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}
float pnoise(vec3 p) {
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    vec3 w = pf * pf * (3. - 2.0 * pf);
    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))),
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))),
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))),
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))),
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}

void main() {
    float r = pnoise(vec3(vNormal.x * 0.5  - (uTime + uSeed) * 0.5)) * 9.0;
    float g = pnoise(vec3(vNormal.y  - (uTime + uSeed) * 0.3)) * 3.0 ;
    vec3 baseColor = vec3(r * 0.9, g * 0.9, 5.0);
    baseColor = clamp(baseColor, 0.0, 1.0);
    baseColor = baseColor * 0.45 + 0.65;
    
    float noiseLine = pnoise(vec3(-vUv.y * 0.8  - (uTime + uSeed) * 1.0 , 0.0, vUv.x * 250.0 )) - 0.1;
    noiseLine = clamp(noiseLine, 0.0, 1.0) * (uDynamic * 0.7 + 0.3);

    float noiseSpot = pnoise(vec3(-vUv.y * 30.0 - (uTime  + uSeed) * 30.0 , 0.0, vUv.x * 300.0)) - 0.3;
    noiseSpot = clamp(noiseSpot, 0.0 , 1.0) * uDynamic;
    
    float noiseComplex = noiseLine + noiseSpot;
    noiseComplex = clamp(noiseComplex, 0.0, 1.0) * 1.8;
    

    vec3 color = baseColor * noiseComplex + 0.12 ;
    // float cutOff = clamp((1.0 - vUv.y) * 8.0, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0) ;
    // gl_FragColor = vec4(vec3(vUv.y), 1.0);
}