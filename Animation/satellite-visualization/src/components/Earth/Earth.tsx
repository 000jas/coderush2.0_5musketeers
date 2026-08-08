import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EarthProps {
  rotationSpeed?: number;
}

export const Earth: React.FC<EarthProps> = ({ rotationSpeed = 0.05 }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Programmatically generate a detailed high-tech grid map on a 2D canvas
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // 1. Deep Space Ocean Background
    ctx.fillStyle = '#060a17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Neon Grid lines (Latitude and Longitude)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    const gridSpacing = 32;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 3. Draw high-tech abstract continents using polygon coordinates
    // Approximate coordinates mapped to 2048x1024
    const drawLand = (coords: [number, number][], color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      coords.forEach(([lon, lat], index) => {
        // Map longitude [-180, 180] to [0, 2048]
        const x = ((lon + 180) / 360) * canvas.width;
        // Map latitude [-90, 90] to [1024, 0] (canvas 0 is at top)
        const y = ((90 - lat) / 180) * canvas.height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();

      // Add a subtle glowing stroke to outline the land
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Stylized continent outlines
    const landColor = 'rgba(15, 23, 42, 0.9)'; // Dark landmass
    
    // North America
    drawLand([
      [-168, 65], [-120, 70], [-80, 75], [-60, 60], [-50, 50],
      [-60, 45], [-75, 38], [-80, 25], [-100, 20], [-105, 30],
      [-125, 48], [-140, 60]
    ], landColor);

    // South America
    drawLand([
      [-80, 10], [-45, -5], [-35, -7], [-40, -20], [-60, -40],
      [-70, -55], [-75, -50], [-70, -35], [-80, -15], [-82, 0]
    ], landColor);

    // Africa
    drawLand([
      [-17, 32], [10, 32], [32, 30], [34, 12], [51, 11],
      [46, -10], [40, -20], [22, -35], [16, -33], [10, -10],
      [8, 5], [-15, 12]
    ], landColor);

    // Eurasia / Europe / Asia
    drawLand([
      [-10, 60], [30, 70], [60, 75], [100, 75], [140, 70],
      [170, 65], [180, 60], [140, 35], [120, 20], [105, 20],
      [100, 10], [80, 8], [75, 12], [60, 25], [45, 15],
      [35, 30], [26, 40], [12, 44], [0, 48]
    ], landColor);

    // Australia
    drawLand([
      [113, -25], [115, -35], [130, -38], [145, -38],
      [150, -33], [145, -20], [130, -15], [120, -15]
    ], landColor);

    // Antarctica
    drawLand([
      [-180, -75], [180, -75], [180, -90], [-180, -90]
    ], 'rgba(30, 41, 59, 0.9)'); // Icy dark gray for Antarctica

    // 4. Add high-tech dots to represent ground networks / city lights
    ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
    const majorCities: [number, number][] = [
      [-74, 40.7], [-0.1, 51.5], [37.6, 55.7], [139.7, 35.7],
      [151.2, -33.9], [-43.2, -22.9], [18.4, -33.9], [77.2, 28.6]
    ];
    majorCities.forEach(([lon, lat]) => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      
      // Draw pulsing center
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Programmatically generate a cloud / atmospheric noise texture on a canvas
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some wispy cloud bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 15; i++) {
      const cy = Math.random() * canvas.height;
      const ch = 50 + Math.random() * 120;
      const grad = ctx.createLinearGradient(0, cy, 0, cy + ch);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, `rgba(186, 230, 253, ${0.12 + Math.random() * 0.15})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, cy, canvas.width, ch);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Update loop for rotation
  useFrame((_state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed * delta;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += (rotationSpeed * 1.25) * delta;
    }
  });

  return (
    <group>
      {/* 1. Glowing Atmosphere Outer Envelope */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 2. Cloud Layer (Atmosphere) */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.02, 32, 32]} />
        <meshStandardMaterial
          alphaMap={cloudTexture}
          transparent
          color="#e0f2fe"
          roughness={0.9}
          metalness={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Base Earth Globe */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.4}
          metalness={0.15}
          bumpScale={0.05}
        />
      </mesh>
    </group>
  );
};
