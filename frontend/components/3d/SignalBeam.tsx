import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SatelliteState } from '../../lib/types';

interface SignalBeamProps {
  stateRef: React.RefObject<SatelliteState>;
}

export const SignalBeam: React.FC<SignalBeamProps> = ({ stateRef }) => {
  const beamMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((frameState) => {
    const s = stateRef.current;
    if (!s || s.communicationStatus !== 'Connected') {
      if (groupRef.current) {
        groupRef.current.visible = false;
      }
      return;
    }

    if (groupRef.current) {
      groupRef.current.visible = true;
    }

    const elapsed = frameState.clock.getElapsedTime();
    
    if (beamMaterialRef.current) {
      beamMaterialRef.current.opacity = 0.12 + Math.sin(elapsed * 15) * 0.08;
    }
    if (coreMaterialRef.current) {
      coreMaterialRef.current.opacity = 0.4 + Math.sin(elapsed * 25) * 0.25;
    }
    
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(elapsed * 30) * 0.005;
      groupRef.current.rotation.x = Math.cos(elapsed * 25) * 0.005;
    }
  });

  const beamLength = 1.7;

  return (
    <group ref={groupRef} position={[0, -0.3, -0.15]} visible={false}>
      <mesh position={[0, -beamLength / 2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.45, beamLength, 16, 1, true]} />
        <meshBasicMaterial
          ref={beamMaterialRef}
          color="#38bdf8"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -beamLength / 2, 0]}>
        <cylinderGeometry args={[0.003, 0.08, beamLength, 8, 1, true]} />
        <meshBasicMaterial
          ref={coreMaterialRef}
          color="#e0f2fe"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, -beamLength, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 16]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
