import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, ContactShadows } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

function AbstractShape() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    // Gentle rotation
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      (state.pointer.y * Math.PI) / 4,
      0.1
    )
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      (state.pointer.x * Math.PI) / 4,
      0.1
    )
  })

  return (
    <Float
      speed={2.5}
      rotationIntensity={1}
      floatIntensity={2}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial
          color="#8b5cf6" // primary purple
          roughness={0.1}
          metalness={0.5}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Internal wireframe layer for cool tech effect */}
      <mesh>
        <icosahedronGeometry args={[1.001, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe opacity={0.1} transparent />
      </mesh>
    </Float>
  )
}

export function Interactive3D() {
  return (
    <div className="w-full h-full min-h-[300px] pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <AbstractShape />
        <Environment preset="city" />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
      </Canvas>
    </div>
  )
}
