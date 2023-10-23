varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;
uniform float uTransition;
uniform float uEmissive;
uniform float uSeed;
uniform sampler2D uTextureCurr;
uniform float uTextureCurrRatioHW;
uniform sampler2D uTextureNext;
uniform float uTextureNextRatioHW;

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

vec4 getCropedImage (sampler2D tex, vec2 Uv, float ratioHW) {
    if (ratioHW <= 1.0) {
        vec2 coord = vec2(Uv.x, Uv.y / ratioHW);
        coord.y -= (1.0 / ratioHW - 1.0) * 0.5;
        vec4 imgColor = texture2D(tex, coord);
        if(coord.y < 0.0 || coord.y > 1.0) {
            imgColor.w = 0.0;
        }
        return imgColor;
    } else {
        vec2 coord = vec2(Uv.x * ratioHW, Uv.y);
        coord.x -= (1.0 * ratioHW - 1.0) * 0.5;
        vec4 imgColor = texture2D(tex, coord);
        if(coord.x < 0.0 || coord.x > 1.0) {
            imgColor.w = 0.0;
        }
        return imgColor;
    }
}

void main() {
    vec3 tiltPos = vPosition;
    tiltPos.y *= 30.0;
    float noise = pnoise(tiltPos * 10.0 + uSeed) * 0.5 + 0.5;
    float displaceCurr = noise * 0.3 * uTransition;
    vec2 coordCurr = vec2(vUv.x - displaceCurr * 1.5, vUv.y ); 
    vec4 colorCurr = getCropedImage(uTextureCurr, coordCurr, uTextureCurrRatioHW);

    float displaceNext = noise * 0.3 * (1.0 - uTransition);
    vec2 coordNext = vec2(vUv.x + displaceNext * 1.5, vUv.y ); 
    vec4 colorNext = getCropedImage(uTextureNext, coordNext, uTextureNextRatioHW);

    vec4 color = colorCurr * (1.0 - uTransition) + colorNext * uTransition;
    color *= 0.9;
    gl_FragColor = color + uEmissive;
}