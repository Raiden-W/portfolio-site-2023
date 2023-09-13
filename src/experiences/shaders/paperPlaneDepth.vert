uniform mat4 uRotateL1;
uniform mat4 uRotateL2Left;
uniform mat4 uRotateL2Right;
uniform mat4 uRotateL3Left;
uniform mat4 uRotateL3Right;

varying vec2 v_uv;

void main()
{
    //conner transformation
    mat4 rotateConner = tan(PI/12.) * uv.x - uv.y - tan(PI/12.) + 1. < 0. ? uRotateL3Left : 
                        1./tan(PI/12.) * uv.x - uv.y - (1./tan(PI/12.)) + 1. > 0. ? uRotateL3Right : mat4(1.); 
    vec4 rotatedL3Position = rotateConner * vec4(position, 1.0);
    
    //side transformation
    mat4 rotateSide = tan(PI/6.) * uv.x - uv.y - tan(PI/6.) + 1. < 0. ? uRotateL2Left :
                      1./tan(PI/6.) * uv.x - uv.y - (1./tan(PI/6.)) + 1. > 0. ? uRotateL2Right : mat4(1.);
    vec4 rotatedL2Position = rotateSide * rotatedL3Position;

    //middle transformation
    mat4 rotateMiddle = uv.y - uv.x > 0. ? uRotateL1 : inverse(uRotateL1);
    vec4 rotatedL1Position = rotateMiddle * rotatedL2Position;
    
    csm_Position = rotatedL1Position.xyz;

    // vec4 modelPosition = modelMatrix * rotatedL1Position;
    // vec4 viewPosition = viewMatrix * modelPosition;
    // vec4 projectedPosition = projectionMatrix * viewPosition;

    // gl_Position = projectedPosition;

    v_uv = uv;
}