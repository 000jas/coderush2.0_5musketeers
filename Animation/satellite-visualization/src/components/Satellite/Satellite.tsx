import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SatelliteState } from '../../types/SatelliteState';
import { SolarPanels } from '../SolarPanels/SolarPanels';
import { Camera } from '../Camera/Camera';
import { Antenna } from '../Antenna/Antenna';
import { SignalBeam } from '../SignalBeam/SignalBeam';

interface SatelliteProps {
  stateRef: React.RefObject<SatelliteState>;
  sunPosition: THREE.Vector3;
}

export const Satellite: React.FC<SatelliteProps> = ({ stateRef, sunPosition }) => {
  const chassisRef = useRef<THREE.Mesh>(null);
  const ledMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const flashMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const thrusterPlumeRef = useRef<THREE.Mesh>(null);
  const faultIndicatorRef = useRef<THREE.Group>(null);

  // Handle fine animations (blinks, plumes, flashes) on every WebGL render frame
  useFrame((frameState) => {
    const s = stateRef.current;
    if (!s) return;

    const elapsed = frameState.clock.getElapsedTime();

    // 1. Dynamic LED color determination and blinking logic
    let ledColor = '#10b981'; // Green (Excellent/Good)
    if (s.overallSatelliteHealth === 'Critical') {
      ledColor = '#ef4444'; // Red
    } else if (s.overallSatelliteHealth === 'Warning' || s.missionMode === 'Safe Mode') {
      ledColor = '#f59e0b'; // Orange/Yellow
    }

    if (ledMaterialRef.current) {
      if (s.overallSatelliteHealth === 'Critical') {
        // Fast emergency blink
        ledMaterialRef.current.color.set(ledColor);
        ledMaterialRef.current.opacity = Math.sin(elapsed * 15) > 0 ? 1 : 0.2;
      } else if (s.missionMode === 'Safe Mode') {
        // Slow warning blink
        ledMaterialRef.current.color.set(ledColor);
        ledMaterialRef.current.opacity = Math.sin(elapsed * 4) > 0 ? 0.9 : 0.3;
      } else {
        // Steady healthy glow
        ledMaterialRef.current.color.set(ledColor);
        ledMaterialRef.current.opacity = 0.9;
      }
    }

    // 2. Chassis material thermal glow adjustment
    if (chassisRef.current) {
      const material = chassisRef.current.material as THREE.MeshStandardMaterial;
      const isThermalWarning = s.cpuTemperature > 70 || 
                                s.activeFault.toLowerCase().includes('temperature') || 
                                s.activeFault.toLowerCase().includes('overtemp');
      
      if (isThermalWarning) {
        // Animate orange-red heat pulse
        const intensity = 0.15 + Math.sin(elapsed * 4) * 0.08;
        material.emissive.setHex(0xef4444);
        material.emissiveIntensity = intensity;
      } else {
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }
    }

    // 3. Camera Flash effect during Observation
    if (flashMaterialRef.current) {
      if (s.cameraStatus === 'Active') {
        // Render periodic visual optical flash sync with images captured
        const flashTrigger = Math.sin(elapsed * 6.28); // Sync pulse
        flashMaterialRef.current.opacity = flashTrigger > 0.9 ? (flashTrigger - 0.9) * 10.0 : 0.0;
      } else {
        flashMaterialRef.current.opacity = 0;
      }
    }

    // 4. Thruster Ion Plume pulsing (minor orientation adjustments)
    if (thrusterPlumeRef.current) {
      if (s.missionMode === 'Normal Operation' && s.currentTask.includes('Routine')) {
        // Pulse exhaust occasionally
        const plumePulse = Math.max(0, Math.sin(elapsed * 2) * Math.cos(elapsed * 0.5));
        thrusterPlumeRef.current.scale.set(1, plumePulse, 1);
        const plumeMat = thrusterPlumeRef.current.material as THREE.MeshBasicMaterial;
        plumeMat.opacity = plumePulse * 0.5;
      } else {
        thrusterPlumeRef.current.scale.set(0, 0, 0);
      }
    }

    // 5. Fault Warning Indicator animation (bounces / rotates)
    if (faultIndicatorRef.current) {
      if (s.activeFault !== 'None') {
        faultIndicatorRef.current.visible = true;
        faultIndicatorRef.current.position.y = 0.35 + Math.sin(elapsed * 6) * 0.05;
        faultIndicatorRef.current.rotation.y = elapsed * 3;
      } else {
        faultIndicatorRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* 1. Main Gold Foil Body (Satellite Chassis) */}
      <mesh ref={chassisRef} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.35, 0.3]} />
        <meshStandardMaterial
          color="#d97706" // Gold MLI foil color
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>
      
      {/* Outer structural metal frame rails */}
      <mesh castShadow position={[0.155, 0, 0.155]}>
        <boxGeometry args={[0.015, 0.37, 0.015]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.155, 0, 0.155]}>
        <boxGeometry args={[0.015, 0.37, 0.015]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0.155, 0, -0.155]}>
        <boxGeometry args={[0.015, 0.37, 0.015]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.155, 0, -0.155]}>
        <boxGeometry args={[0.015, 0.37, 0.015]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* 2. Status LEDs */}
      <group position={[0, 0, 0]}>
        {/* Front-left LED */}
        <mesh position={[0.12, 0.18, 0.12]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial ref={ledMaterialRef} color="#10b981" transparent />
        </mesh>
        {/* Front-right LED */}
        <mesh position={[-0.12, 0.18, 0.12]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial ref={ledMaterialRef} color="#10b981" transparent />
        </mesh>
        {/* Rear-left LED */}
        <mesh position={[0.12, 0.18, -0.12]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial ref={ledMaterialRef} color="#10b981" transparent />
        </mesh>
        {/* Rear-right LED */}
        <mesh position={[-0.12, 0.18, -0.12]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial ref={ledMaterialRef} color="#10b981" transparent />
        </mesh>
      </group>

      {/* 3. Thruster Assembly */}
      <group position={[0, 0.18, 0]}>
        {/* Nozzle housing */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.03, 0.04, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Plume (exhaust cone) */}
        <mesh ref={thrusterPlumeRef} position={[0, 0.07, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.03, 0.1, 8, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 4. Solar Panels Subcomponent */}
      <SolarPanels stateRef={stateRef} sunPosition={sunPosition} />

      {/* 5. Camera Subcomponent */}
      <Camera stateRef={stateRef} />

      {/* 6. Camera Optical Flash ring (Flash during observation) */}
      <mesh position={[0, -0.4, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0, 0.35, 0.4, 16, 1, true]} />
        <meshBasicMaterial
          ref={flashMaterialRef}
          color="#f8fafc"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 7. Antenna Subcomponent */}
      <Antenna stateRef={stateRef} />

      {/* 8. Signal Downlink Beam Subcomponent */}
      <SignalBeam stateRef={stateRef} />

      {/* 9. Floating Fault Warning Subsystem Indicator */}
      <group ref={faultIndicatorRef} position={[0, 0.35, 0]} visible={false}>
        {/* Warning Icon Halo */}
        <mesh>
          <torusGeometry args={[0.08, 0.008, 8, 24]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Central exclamation core */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.07, 6]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
};
