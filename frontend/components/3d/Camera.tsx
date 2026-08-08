import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SatelliteState } from '../../lib/types';

interface CameraProps {
  stateRef: React.RefObject<SatelliteState>;
}

export const Camera: React.FC<CameraProps> = ({ stateRef }) => {
  const gimbalRef = useRef<THREE.Group>(null);
  const tubeRef = useRef<THREE.Mesh>(null);

  useFrame((frameState, delta) => {
    const s = stateRef.current;
    if (!s) return;

    const elapsed = frameState.clock.getElapsedTime();
    const lerpSpeed = 3.0;

    let targetExtension = 0.05;
    let targetRotationX = 0;
    let targetRotationY = 0;

    if (s.missionMode === 'Safe Mode') {
      targetExtension = -0.05;
      targetRotationX = 0;
      targetRotationY = 0;
    } else if (s.cameraStatus === 'Active') {
      targetExtension = 0.15;
      targetRotationX = Math.sin(elapsed * 1.5) * 0.15;
      targetRotationY = Math.cos(elapsed * 1.2) * 0.15;
    }

    if (tubeRef.current) {
      tubeRef.current.position.z = THREE.MathUtils.lerp(
        tubeRef.current.position.z,
        targetExtension,
        lerpSpeed * delta
      );
    }

    if (gimbalRef.current) {
      gimbalRef.current.rotation.x = THREE.MathUtils.lerp(
        gimbalRef.current.rotation.x,
        targetRotationX,
        lerpSpeed * delta
      );
      gimbalRef.current.rotation.y = THREE.MathUtils.lerp(
        gimbalRef.current.rotation.y,
        targetRotationY,
        lerpSpeed * delta
      );
    }
  });

  return (
    <group position={[0, -0.22, 0.05]} ref={gimbalRef}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[0.09, 0.05, 0.06]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      <mesh castShadow ref={tubeRef} position={[0, -0.06, 0.05]}>
        <cylinderGeometry args={[0.045, 0.045, 0.12, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
        
        <mesh position={[0, -0.061, 0]}>
          <cylinderGeometry args={[0.047, 0.047, 0.01, 16]} />
          <meshStandardMaterial color="#d97706" roughness={0.1} metalness={0.9} />
        </mesh>

        <mesh position={[0, -0.062, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.002, 16]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.6}
            roughness={0.0}
            metalness={1.0}
            transparent
            opacity={0.8}
          />
        </mesh>
      </mesh>
    </group>
  );
};
