import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { SatelliteState } from '../types/SatelliteState';
import { Earth } from '../components/Earth/Earth';
import { OrbitRing } from '../components/OrbitRing/OrbitRing';
import { Satellite } from '../components/Satellite/Satellite';
import { GroundStation } from '../components/GroundStation/GroundStation';

interface SpaceSceneProps {
  stateRef: React.RefObject<SatelliteState>;
}

// Fixed position of the Sun in space (world coordinates)
const SUN_POSITION = new THREE.Vector3(12, 4, -12);
const ORBIT_RADIUS = 2.8;
const ORBIT_PERIOD_SECS = 45; // Seconds for a full orbital revolution

// Inner component to handle frame-by-frame updates inside the Canvas context
const SceneController: React.FC<{ stateRef: React.RefObject<SatelliteState> }> = ({ stateRef }) => {
  const satelliteGroupRef = useRef<THREE.Group>(null);
  const currentAngleRef = useRef(0);

  useFrame((frameState, delta) => {
    if (!satelliteGroupRef.current || !stateRef.current) return;

    // 1. Calculate orbital angle based on telemetry mode
    // Instead of fixed time, we adjust speed based on mode
    let speedMult = 1.0;
    if (stateRef.current.missionMode === 'Safe Mode') {
      speedMult = 0.2; // Slow down significantly in safe mode
    } else if (stateRef.current.missionMode === 'Earth Observation') {
      speedMult = 0.8; // Slow down slightly for observation
    }
    
    // If the simulation is paused (communication disconnected or manual pause), 
    // we could stop it, but let's keep it moving smoothly
    currentAngleRef.current += (delta / ORBIT_PERIOD_SECS) * Math.PI * 2 * speedMult;
    const orbitAngle = currentAngleRef.current;

    // 2. Position satellite on the circular XZ orbital path
    const x = Math.cos(orbitAngle) * ORBIT_RADIUS;
    const z = Math.sin(orbitAngle) * ORBIT_RADIUS;
    satelliteGroupRef.current.position.set(x, 0, z);

    // 3. Orient satellite so local negative Y-axis points towards Earth center [0,0,0]
    // Local X-axis aligns with orbital plane normal (world vertical Y axis)
    // Local Y-axis aligns with radial outward vector
    // Local Z-axis aligns with tangent velocity vector
    const radialOut = new THREE.Vector3(x, 0, z).normalize();
    const velocity = new THREE.Vector3(-Math.sin(orbitAngle), 0, Math.cos(orbitAngle)).normalize();
    const orbitalNormal = new THREE.Vector3(0, 1, 0); // vertical

    const basisMatrix = new THREE.Matrix4();
    basisMatrix.makeBasis(
      orbitalNormal, // local X (panels extend along this axle)
      radialOut,     // local Y (radial direction, bottom/negative Y points down)
      velocity       // local Z (tangential direction of movement)
    );

    satelliteGroupRef.current.quaternion.setFromRotationMatrix(basisMatrix);
  });

  return (
    <group>
      {/* Sun Light Source */}
      <directionalLight
        position={SUN_POSITION}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={5}
        shadow-camera-far={25}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
      <ambientLight intensity={0.15} />

      {/* Sun Visual Mesh */}
      <mesh position={SUN_POSITION}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#fef08a" />
        {/* Sun aura glow */}
        <pointLight intensity={1.5} distance={15} decay={1} color="#fef08a" />
      </mesh>

      {/* Earth (with embedded Ground Stations that rotate with it) */}
      <group>
        <Earth rotationSpeed={0.04} />
        
        {/* Svalbard Ground Station, Norway */}
        <GroundStation
          stateRef={stateRef}
          latitude={78.2}
          longitude={15.4}
          name="Svalbard (SESS)"
        />
        {/* McMurdo Ground Station, Antarctica */}
        <GroundStation
          stateRef={stateRef}
          latitude={-77.8}
          longitude={166.7}
          name="McMurdo Station"
        />
        {/* Hartebeesthoek Ground Station, South Africa */}
        <GroundStation
          stateRef={stateRef}
          latitude={-25.8}
          longitude={27.7}
          name="Hartebeesthoek (HBK)"
        />
        {/* Goldstone Ground Station, California */}
        <GroundStation
          stateRef={stateRef}
          latitude={35.4}
          longitude={-116.8}
          name="Goldstone DSN"
        />
      </group>

      {/* Orbit Trajectory Path Ring */}
      <OrbitRing radius={ORBIT_RADIUS} color="#38bdf8" lineWidth={1.5} />

      {/* Satellite (animated position and alignment) */}
      <group ref={satelliteGroupRef}>
        <Satellite stateRef={stateRef} sunPosition={SUN_POSITION} />
      </group>
    </group>
  );
};

export const SpaceScene: React.FC<SpaceSceneProps> = React.memo(({ stateRef }) => {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [4.0, 3.0, 4.0], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#03050d']} />
        
        {/* Stars skybox background */}
        <Stars
          radius={100}
          depth={50}
          count={4000}
          factor={4}
          saturation={0.5}
          fade
          speed={0.5}
        />
        
        {/* Scene controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={12.0}
        />

        {/* Core Scene Elements */}
        <SceneController stateRef={stateRef} />
      </Canvas>

      {/* Navigation and state cues overlays */}
      <div className="canvas-overlay-hints">
        <div>ORBIT HEIGHT: 520 KM (LEO)</div>
        <div>ORBIT INCLINATION: 0.0° (EQUATORIAL)</div>
        <div>CONTROLS: LEFT-CLICK + DRAG TO ROTATE | RIGHT-CLICK + DRAG TO PAN | SCROLL TO ZOOM</div>
      </div>
    </div>
  );
}, () => true); // Never re-renders the Canvas tree to keep OrbitControls stable
