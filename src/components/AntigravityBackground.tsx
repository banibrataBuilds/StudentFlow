import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  
  varying vec2 vUv;

  // Simplex noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    // Create slow, fluid motion
    float t = uTime * 0.2;
    
    // Multiple layers of noise for complex fluid movement
    float n1 = snoise(uv * 2.0 + vec2(t * 0.5, t * 0.2));
    float n2 = snoise(uv * 3.0 - vec2(t * 0.3, t * 0.4));
    float n3 = snoise(uv * 1.5 + vec2(sin(t), cos(t)));
    
    // Blend noises
    float noise = (n1 + n2 + n3) / 3.0;
    
    // Map noise to color gradient
    vec3 color = mix(uColor1, uColor2, smoothstep(-1.0, 1.0, noise + uv.x));
    color = mix(color, uColor3, smoothstep(-1.0, 1.0, n2 + uv.y));
    color = mix(color, uColor4, smoothstep(-0.5, 0.5, n3 * noise));

    // Darken and create depth
    color *= 0.4 + 0.6 * smoothstep(-1.0, 1.0, noise);
    
    gl_FragColor = vec4(color, 1.0);
  }
`

function FluidAurora() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
    // Deep Space / Cyber-Fluid colors
    uColor1: { value: new THREE.Color('#0f0c29') }, // Deep space
    uColor2: { value: new THREE.Color('#302b63') }, // Deep purple
    uColor3: { value: new THREE.Color('#240b36') }, // Dark magenta
    uColor4: { value: new THREE.Color('#00d2ff') }  // Cyan accent
  }), [viewport])

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

export function AntigravityBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas 
        camera={{ position: [0, 0, 1] }} 
        dpr={[1, 2]}
      >
        <FluidAurora />
      </Canvas>
      {/* Overlay to dim background and add a subtle noise texture */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[50px] mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/90 pointer-events-none" />
    </div>
  )
}
