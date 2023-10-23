varying vec3 vNormal;
varying vec2 vUv;

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

mat2 get2dRotateMatrix(float _angle) {
        return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
    }

void main() {
    vUv = uv;
    vNormal = normal;

    vec3 displace = position;
    displace.y += uTime * 2.0;
    displace.x += uSeed;
    float dist = pnoise(displace * 0.1) * 1.5 * (2.0 - uv.y);

    vec3 movement = position;
    movement.x += pow(uv.y, 2.0) * 20.0 * pnoise(vec3((uTime + uSeed) * 0.3)) * uDynamic;;
    movement.z += pow(uv.y, 2.0) * 10.0 * pnoise(vec3((uTime + 5.4564 + uSeed) * 0.2)) * uDynamic;

    vec3 newPosition = movement + vNormal * vec3(dist); 
    newPosition.xz *= get2dRotateMatrix( uv.y * 8.0 * pnoise(vec3((uTime + uSeed) * 0.1)) * uDynamic);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}