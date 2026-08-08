import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitRingProps {
  radius?: number;
  segments?: number;
  color?: string;
  lineWidth?: number;
}

export const OrbitRing: React.FC<OrbitRingProps> = ({
  radius = 2.8,
  segments = 128,
  color = '#38bdf8',
  lineWidth = 1.0,
}) => {
  // Generate points on a circular orbit path in the XZ plane
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius, segments]);

  return (
    <group>
      {/* Principal solid orbit line */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={0.3}
      />
      {/* Faint wide glow line */}
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth * 3}
        transparent
        opacity={0.08}
      />
    </group>
  );
};
