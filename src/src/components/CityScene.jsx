import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Html, OrbitControls, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

function Road() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 44]} />
        <meshStandardMaterial color="#1f2937" roughness={0.95} metalness={0.05} />
      </mesh>
      {Array.from({ length: 14 }).map((_, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -18 + index * 3]}>
          <planeGeometry args={[0.35, 1.4]} />
          <meshStandardMaterial color="#e5e7eb" emissive="#f8fafc" emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 44]} />
        <meshStandardMaterial color="#5b4b4b" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 44]} />
        <meshStandardMaterial color="#5b4b4b" roughness={1} />
      </mesh>
      <gridHelper args={[44, 44, '#7c6f6f', '#7c6f6f']} position={[-9, 0.05, 0]} />
      <gridHelper args={[44, 44, '#7c6f6f', '#7c6f6f']} position={[9, 0.05, 0]} />
    </group>
  );
}

function SidewalkEdges() {
  return (
    <group>
      {[-8, 8].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]} receiveShadow>
          <boxGeometry args={[0.45, 0.35, 44]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function LampPost({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4, 12]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0.42, 3.9, 0]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.08]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 3.55, 0]} castShadow>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color="#fff7d6" emissive="#ffe9a8" emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0.8, 3.55, 0]} intensity={16} distance={8} color="#ffe8a3" />
    </group>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.4, 10]} />
        <meshStandardMaterial color="#5b3b24" roughness={1} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.75, 18, 18]} />
        <meshStandardMaterial color="#0f766e" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Building({ district, active, onSelect }) {
  const meshRef = useRef();
  const roofRef = useRef();
  const glowColor = useMemo(() => new THREE.Color(district.color), [district.color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetY = active ? 0.22 : 0;
    const targetScale = active ? 1.035 : 1;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 3.5);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3.5);
    if (roofRef.current) {
      roofRef.current.rotation.y += delta * 0.12;
    }
  });

  const [w, h, d] = district.size;
  const [x, , z] = district.position;

  return (
    <group position={[x, 0, z]} onClick={() => onSelect(district.id)}>
      <group ref={meshRef}>
        <RoundedBox args={[w, h, d]} radius={0.18} smoothness={4} position={[0, h / 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#0b1327" metalness={0.25} roughness={0.72} />
        </RoundedBox>

        <mesh position={[0, h + 0.2, 0]} ref={roofRef} castShadow>
          <cylinderGeometry args={[Math.max(w, d) * 0.26, Math.max(w, d) * 0.34, 0.5, 6]} />
          <meshStandardMaterial color={district.accent} emissive={district.accent} emissiveIntensity={0.55} metalness={0.5} />
        </mesh>

        <mesh position={[0, h / 2 + 0.2, d / 2 + 0.03]} castShadow>
          <planeGeometry args={[w * 0.72, h * 0.72]} />
          <meshStandardMaterial color="#f6e7c7" emissive={district.color} emissiveIntensity={active ? 0.45 : 0.2} />
        </mesh>

        {Array.from({ length: Math.max(2, Math.floor(h)) }).map((_, row) => (
          <group key={row}>
            {Array.from({ length: 3 }).map((__, col) => (
              <mesh
                key={`${row}-${col}`}
                position={[-w * 0.22 + col * (w * 0.22), 1.2 + row * 1.15, d / 2 + 0.05]}
              >
                <planeGeometry args={[w * 0.13, 0.65]} />
                <meshStandardMaterial
                  color="#fef3c7"
                  emissive={district.color}
                  emissiveIntensity={active ? 1.25 : 0.5}
                />
              </mesh>
            ))}
          </group>
        ))}

        <mesh position={[0, 0.9, d / 2 + 0.06]}>
          <planeGeometry args={[w * 0.23, 1.1]} />
          <meshStandardMaterial color={district.accent} emissive={district.accent} emissiveIntensity={0.35} />
        </mesh>

        <mesh position={[0, h + 1.1, d / 2]}>
          <boxGeometry args={[w * 0.82, 0.65, 0.2]} />
          <meshStandardMaterial color="#111827" emissive="#0f172a" emissiveIntensity={0.5} />
        </mesh>

        <Text
          position={[0, h + 1.12, d / 2 + 0.12]}
          fontSize={0.32}
          maxWidth={w * 0.7}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
        >
          {district.short}
        </Text>

        {active && (
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <mesh position={[0, h + 2.05, 0]}>
              <sphereGeometry args={[0.22, 24, 24]} />
              <meshStandardMaterial color={district.color} emissive={district.color} emissiveIntensity={3} />
            </mesh>
            <pointLight position={[0, h + 2.05, 0]} intensity={18} distance={5} color={district.color} />
          </Float>
        )}
      </group>
    </group>
  );
}

function CameraRig({ activeDistrict }) {
  useFrame((state, delta) => {
    const defaults = new THREE.Vector3(0, 8, 20);
    const lookTarget = new THREE.Vector3(0, 3.5, 0);

    const focusMap = {
      projects: { pos: new THREE.Vector3(-8.5, 6.4, 14), look: new THREE.Vector3(-10, 3.4, 5) },
      about: { pos: new THREE.Vector3(-5, 5.2, 7), look: new THREE.Vector3(-4, 2, -7) },
      stack: { pos: new THREE.Vector3(4.8, 6.2, 14), look: new THREE.Vector3(3.5, 2.5, 7) },
      dashboards: { pos: new THREE.Vector3(11.5, 8.4, 8), look: new THREE.Vector3(10, 5.8, -3) },
      contact: { pos: new THREE.Vector3(0, 4.5, 18), look: new THREE.Vector3(0, 1.8, 13) },
    };

    const target = activeDistrict ? focusMap[activeDistrict.id] : { pos: defaults, look: lookTarget };
    state.camera.position.lerp(target.pos, delta * 2.2);
    state.camera.lookAt(target.look);
  });

  return null;
}

function GroundLights() {
  return (
    <group>
      {[-5, 5].map((x) =>
        Array.from({ length: 6 }).map((_, index) => (
          <mesh key={`${x}-${index}`} position={[x, 0.08, -12 + index * 5]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.28, 24]} />
            <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

function BackgroundCity() {
  return (
    <group position={[0, 0, -18]}>
      {Array.from({ length: 15 }).map((_, index) => {
        const x = -24 + index * 3.3;
        const h = 3 + (index % 5) * 1.4;
        return (
          <mesh key={index} position={[x, h / 2, 0]} castShadow>
            <boxGeometry args={[2.2, h, 2.2]} />
            <meshStandardMaterial color="#111827" emissive="#1e293b" emissiveIntensity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

function Moon() {
  return (
    <group position={[0, 15, -14]}>
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial color="#fff7db" emissive="#fff4cc" emissiveIntensity={1.3} />
      </mesh>
      <pointLight intensity={10} distance={70} color="#fef3c7" />
    </group>
  );
}

function Scene({ districts, activeDistrict, onSelect }) {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 22, 40]} />
      <hemisphereLight intensity={0.65} color="#93c5fd" groundColor="#020617" />
      <ambientLight intensity={0.85} />
      <spotLight
        position={[0, 18, 8]}
        intensity={160}
        angle={0.5}
        penumbra={0.7}
        castShadow
        color="#dbeafe"
      />
      <Environment preset="night" />
      <Moon />
      <Road />
      <SidewalkEdges />
      <GroundLights />
      <BackgroundCity />

      {districts.map((district) => (
        <Building
          key={district.id}
          district={district}
          active={activeDistrict?.id === district.id}
          onSelect={onSelect}
        />
      ))}

      {Array.from({ length: 7 }).map((_, index) => (
        <React.Fragment key={index}>
          <LampPost position={[-6.8, 0, -14 + index * 4.5]} />
          <LampPost position={[6.8, 0, -14 + index * 4.5]} />
        </React.Fragment>
      ))}

      {[-11.8, -9.8, -7.8, 7.8, 9.8, 11.8].map((x, index) => (
        <Tree key={x} position={[x, 0, -12 + (index % 3) * 8]} />
      ))}

      <CameraRig activeDistrict={activeDistrict} />
      <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={1.32} minPolarAngle={0.88} />
    </>
  );
}

export default function CityScene({ districts, activeDistrict, onSelect }) {
  return (
    <Canvas shadows camera={{ position: [0, 8, 20], fov: 42 }}>
      <Suspense
        fallback={
          <Html center>
            <div style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>Carregando cidade 3D...</div>
          </Html>
        }
      >
        <Scene districts={districts} activeDistrict={activeDistrict} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}
