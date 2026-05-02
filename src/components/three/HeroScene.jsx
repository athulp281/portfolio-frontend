import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

function Orb() {
  const ref = useRef(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.08;
    ref.current.rotation.y += delta * 0.12;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} scale={2.2} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 32]} />
        <MeshDistortMaterial
          color="#22d3ee"
          emissive="#8b5cf6"
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.15}
          distort={0.45}
          speed={1.6}
        />
      </mesh>
    </Float>
  );
}

function ParticleField({ count = 800 }) {
  const points = useRef(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={new THREE.Color("#9aa3ff")}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05060a"]} />
      <fog attach="fog" args={["#05060a", 8, 22]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-6, -2, -4]} intensity={1.5} color="#8b5cf6" />
      <Suspense fallback={null}>
        <Orb />
        <ParticleField />
        <Stars radius={50} depth={30} count={1500} factor={4} fade speed={1} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
