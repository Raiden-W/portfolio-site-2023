uniform float uTime;
uniform float uSeed;
uniform sampler2D uTextureDepth;

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
    vec4 depthMap = texture2D(uTextureDepth, uv);
    vec3 newPosition = position;
    float depth = pow(depthMap.x, 5.0);
    newPosition.z += depth * 0.2;

    vec2 coord = uv;
    coord.y -= uTime * 0.5;
    coord *= 1.2;
    float zPerOffset = pnoise(vec3(coord, 0)) * 0.1;
    newPosition.z += zPerOffset;

    float zCutOff = float(depth > 0.05); 
    
    vec3 baseNoisePos = position * 15.0;
    baseNoisePos.x *= 0.1;
    baseNoisePos.x += uTime * 0.7;
    float baseNoise = clamp(pnoise((baseNoisePos)) * 0.01, -1.0, 0.0) * (1.0 - zCutOff);
    newPosition.z += baseNoise;

    vec3 noisePosZ = position * 25.0;
    noisePosZ.x += uTime * 3.0;
    float noiseZ = clamp(pnoise(noisePosZ) * 0.01, 0.0, 1.0) * zCutOff;
    newPosition.z += noiseZ;

    vec3 noisePosX = position * 80.0;
    noisePosX.x += uTime * 0.3;
    float noiseX = clamp(pnoise(noisePosX) * 0.02, 0.0, 1.0) * 350.0;
    float xCutOff = pow(0.73 - uv.x, 2.0) * float(uv.x < 0.7) * pow(uv.y, 0.6);
    noiseX *= zCutOff * xCutOff;
    noiseX = clamp(noiseX, 0.0, 0.5);
    newPosition.x -= noiseX;

    csm_Position = newPosition.xyz;
}