import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { SatelliteState } from '../../lib/types';
import { Earth } from './Earth';
import { OrbitRing } from './OrbitRing';
import { Satellite } from './Satellite';
import { GroundStation } from './GroundStation';

interface DigitalTwinViewerProps {
  stateRef: React.RefObject<SatelliteState>;
}

const SUN_POSITION = new THREE.Vector3(12, 4, -12);
const ORBIT_RADIUS = 2.8;
const ORBIT_PERIOD_SECS = 45;

const SceneController: React.FC<{ stateRef: React.RefObject<SatelliteState> }> = ({ stateRef }) => {
  const satelliteGroupRef = useRef<THREE.Group>(null);

  useFrame((frameState) => {
    if (!satelliteGroupRef.current) return;

    const elapsed = frameState.clock.getElapsedTime();
    const orbitAngle = (elapsed / ORBIT_PERIOD_SECS) * Math.PI * 2;

    const x = Math.cos(orbitAngle) * ORBIT_RADIUS;
    const z = Math.sin(orbitAngle) * ORBIT_RADIUS;
    satelliteGroupRef.current.position.set(x, 0, z);

    const radialOut = new THREE.Vector3(x, 0, z).normalize();
    const velocity = new THREE.Vector3(-Math.sin(orbitAngle), 0, Math.cos(orbitAngle)).normalize();
    const orbitalNormal = new THREE.Vector3(0, 1, 0);

    const basisMatrix = new THREE.Matrix4();
    basisMatrix.makeBasis(
      orbitalNormal,
      radialOut,
      velocity
    );

    satelliteGroupRef.current.quaternion.setFromRotationMatrix(basisMatrix);
  });

  return (
    <group>
      <directionalLight
        position={SUN_POSITION}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.15} />

      <mesh position={SUN_POSITION}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#fef08a" />
        <pointLight intensity={1.5} distance={15} decay={1} color="#fef08a" />
      </mesh>

      <group>
        <Earth rotationSpeed={0.04} />
        
        <GroundStation
          stateRef={stateRef}
          latitude={78.2}
          longitude={15.4}
          name="Svalbard (SESS)"
        />
        <GroundStation
          stateRef={stateRef}
          latitude={-77.8}
          longitude={166.7}
          name="McMurdo Station"
        />
        <GroundStation
          stateRef={stateRef}
          latitude={-25.8}
          longitude={27.7}
          name="Hartebeesthoek (HBK)"
        />
        <GroundStation
          stateRef={stateRef}
          latitude={35.4}
          longitude={-116.8}
          name="Goldstone DSN"
        />
      </group>

      <OrbitRing radius={ORBIT_RADIUS} color="#38bdf8" lineWidth={1.5} />

      <group ref={satelliteGroupRef}>
        <Satellite stateRef={stateRef} sunPosition={SUN_POSITION} />
      </group>
    </group>
  );
};

export const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = React.memo(({ stateRef }) => {
  return (
    <div className="relative w-full h-full min-h-[360px] bg-[#03050d] rounded-xl overflow-hidden border border-border/70 shadow-sm">
      <Canvas
        camera={{ position: [4.0, 3.0, 4.0], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#03050d']} />
        
        <Stars
          radius={100}
          depth={50}
          count={4000}
          factor={4}
          saturation={0.5}
          fade
          speed={0.5}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={12.0}
        />

        <SceneController stateRef={stateRef} />
      </Canvas>

      <div className="absolute bottom-3 left-4 pointer-events-none flex flex-col gap-0.5 text-[9px] font-mono text-muted-foreground bg-background/80 px-2 py-1.5 rounded border border-border/40 backdrop-blur-xs select-none z-10">
        <div>ORBIT: 520 KM (LEO)</div>
        <div>INC: 0.0° (EQUATORIAL)</div>
        <div>DRAG ROTATES | RIGHT-CLICK PANS | SCROLL ZOOMS</div>
      </div>
    </div>
  );
}, () => true);

DigitalTwinViewer.displayName = 'DigitalTwinViewer';
