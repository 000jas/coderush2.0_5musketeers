import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SatelliteState } from '../../lib/types';

interface SolarPanelsProps {
  stateRef: React.RefObject<SatelliteState>;
  sunPosition: THREE.Vector3;
}

export const SolarPanels: React.FC<SolarPanelsProps> = ({ stateRef, sunPosition }) => {
  const leftPanelRef = useRef<THREE.Group>(null);
  const rightPanelRef = useRef<THREE.Group>(null);

  // Generate a procedural solar cell grid texture
  const solarTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Deep space blue backing
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 128);

    // Cyan glowing grid lines
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;

    // Draw solar grid cells
    const cellW = 16;
    const cellH = 16;
    for (let x = 2; x < 256; x += cellW) {
      for (let y = 2; y < 128; y += cellH) {
        // Dark cell center
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(x, y, cellW - 2, cellH - 2);
        // Highlight grid border
        ctx.strokeRect(x, y, cellW - 2, cellH - 2);
        
        // Silicon reflection lines
        ctx.strokeStyle = '#0891b2';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + cellH - 4);
        ctx.lineTo(x + cellW - 4, y + 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  useFrame((_state, delta) => {
    const s = stateRef.current;
    if (!s) return;

    let targetRotationX = 0;

    // Handle target rotation based on the current mission mode
    if (s.missionMode === 'Safe Mode') {
      targetRotationX = 0;
    } else if (s.missionMode === 'Earth Observation') {
      targetRotationX = Math.PI / 4;
    } else {
      const direction = sunPosition.clone().normalize();
      targetRotationX = Math.atan2(direction.y, direction.z);
    }

    // Smoothly interpolate solar panel rotations
    const lerpSpeed = 2.0;
    if (leftPanelRef.current) {
      leftPanelRef.current.rotation.x = THREE.MathUtils.lerp(
        leftPanelRef.current.rotation.x,
        targetRotationX,
        lerpSpeed * delta
      );
    }
    if (rightPanelRef.current) {
      rightPanelRef.current.rotation.x = THREE.MathUtils.lerp(
        rightPanelRef.current.rotation.x,
        targetRotationX,
        lerpSpeed * delta
      );
    }
  });

  return (
    <group>
      {/* 1. Left Solar Panel Assembly */}
      <group ref={leftPanelRef} position={[-0.45, 0, 0]}>
        {/* Support Axle */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.25, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        
        {/* Solar Panel Wing */}
        <group position={[-0.325, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.015, 0.35]} />
            <meshStandardMaterial
              map={solarTexture}
              roughness={0.1}
              metalness={0.9}
              bumpScale={0.02}
            />
          </mesh>
          <mesh position={[0, -0.009, 0]}>
            <boxGeometry args={[0.46, 0.005, 0.36]} />
            <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 2. Right Solar Panel Assembly */}
      <group ref={rightPanelRef} position={[0.45, 0, 0]}>
        {/* Support Axle */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.25, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        
        {/* Solar Panel Wing */}
        <group position={[0.325, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.015, 0.35]} />
            <meshStandardMaterial
              map={solarTexture}
              roughness={0.1}
              metalness={0.9}
              bumpScale={0.02}
            />
          </mesh>
          <mesh position={[0, -0.009, 0]}>
            <boxGeometry args={[0.46, 0.005, 0.36]} />
            <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
