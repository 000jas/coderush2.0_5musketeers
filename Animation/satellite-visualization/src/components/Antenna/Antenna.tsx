import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SatelliteState } from '../../types/SatelliteState';

interface AntennaProps {
  stateRef: React.RefObject<SatelliteState>;
}

export const Antenna: React.FC<AntennaProps> = ({ stateRef }) => {
  const gimbalRef = useRef<THREE.Group>(null);

  useFrame((frameState, delta) => {
    const s = stateRef.current;
    if (!s) return;

    const elapsed = frameState.clock.getElapsedTime();
    const lerpSpeed = 2.0;

    let targetRotX = 0;
    let targetRotY = 0;

    if (s.missionMode === 'Data Downlink') {
      // Point towards Earth, but simulate minor steering adjustment jitter
      targetRotX = (Math.PI / 12) + Math.sin(elapsed * 0.8) * 0.05;
      targetRotY = Math.cos(elapsed * 0.6) * 0.05;
    } else if (s.missionMode === 'Safe Mode') {
      // Folded/stowed stance
      targetRotX = -Math.PI / 6;
      targetRotY = 0;
    }

    if (gimbalRef.current) {
      gimbalRef.current.rotation.x = THREE.MathUtils.lerp(
        gimbalRef.current.rotation.x,
        targetRotX,
        lerpSpeed * delta
      );
      gimbalRef.current.rotation.y = THREE.MathUtils.lerp(
        gimbalRef.current.rotation.y,
        targetRotY,
        lerpSpeed * delta
      );
    }
  });

  return (
    // Antenna mounted on the nadir/side of the satellite body
    <group position={[0, -0.22, -0.15]} ref={gimbalRef}>
      {/* Support boom structure */}
      <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Gimbal Joint sphere */}
      <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Parabolic Dish assembly */}
      <group position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Parabolic reflector dish (using a hollow cone or segment) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.02, 0.05, 16, 2, true]} />
          <meshStandardMaterial
            color="#d97706" // Gold foil backing
            roughness={0.15}
            metalness={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Dish Hub center cap */}
        <mesh position={[0, -0.015, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Subreflector feed horn support struts */}
        <mesh position={[0.05, 0.06, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.003, 0.003, 0.13, 4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[-0.05, 0.06, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.003, 0.003, 0.13, 4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Receiver feed horn tip */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.015, 0.008, 0.02, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
