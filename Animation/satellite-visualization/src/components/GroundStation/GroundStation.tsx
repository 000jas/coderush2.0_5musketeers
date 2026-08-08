import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { SatelliteState } from '../../types/SatelliteState';

interface GroundStationProps {
  stateRef: React.RefObject<SatelliteState>;
  latitude: number;
  longitude: number;
  name: string;
}

export const GroundStation: React.FC<GroundStationProps> = ({
  stateRef,
  latitude,
  longitude,
  name,
}) => {
  const beaconRef = useRef<THREE.PointLight>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Convert Latitude/Longitude to 3D Cartesian coordinates on Earth (r = 1.0)
  const { position, quaternion } = useMemo(() => {
    const r = 1.0;
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = -(r * Math.sin(phi) * Math.sin(theta));
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.cos(theta);

    const pos = new THREE.Vector3(x, y, z);
    
    // Quaternion to align local Y-axis (up) with the surface normal vector
    const normal = pos.clone().normalize();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    return { position: pos, quaternion: quat };
  }, [latitude, longitude]);

  // Animate the beacon pulsing inside the frame loop
  useFrame((frameState) => {
    const state = stateRef.current;
    if (!state) return;

    const elapsed = frameState.clock.getElapsedTime();
    let frequency = 2; // slow sync pulse
    let activeColor = '#38bdf8'; // cyan

    if (state.communicationStatus === 'Connected') {
      if (state.missionMode === 'Data Downlink') {
        frequency = 12; // Rapid active downlink transfer blinking
        activeColor = '#06b6d4';
      } else {
        frequency = 4; // Online idling
        activeColor = '#10b981'; // Green status
      }
    } else {
      frequency = 1; // Sleep beacon
      activeColor = '#f59e0b'; // Amber warning/disconnected
    }

    const pulseValue = (Math.sin(elapsed * frequency) + 1) / 2;

    // Apply color and intensity updates directly to elements
    if (materialRef.current) {
      materialRef.current.opacity = 0.2 + pulseValue * 0.7;
      materialRef.current.color.set(activeColor);
    }
    if (beaconRef.current) {
      beaconRef.current.intensity = pulseValue * 0.5;
      beaconRef.current.color.set(activeColor);
    }
    if (ringRef.current) {
      const scale = 1.0 + pulseValue * 0.8;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      {/* 1. Base metal pad */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.005, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* 2. Geodesic Dome */}
      <mesh castShadow position={[0, 0.008, 0]}>
        <sphereGeometry args={[0.015, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* 3. Small transmitting tower antenna stem */}
      <mesh castShadow position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.002, 0.004, 0.03, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 4. Pulsing Glow Ring on Surface */}
      <mesh ref={ringRef} position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03, 0.035, 16]} />
        <meshBasicMaterial
          ref={materialRef}
          color="#38bdf8"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. Glowing Point Light Beacon */}
      <pointLight
        ref={beaconRef}
        position={[0, 0.04, 0]}
        distance={0.3}
        decay={2}
        intensity={0.5}
      />
      
      {/* 6. Glowing Beacon Tip Sphere */}
      <mesh position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* 7. Hover/Floating Label */}
      <Html distanceFactor={5} position={[0, 0.08, 0]} center>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '9px',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 0 8px rgba(56, 189, 248, 0.2)'
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
};
