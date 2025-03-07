'use client'
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Html } from '@react-three/drei';

interface DominoProps {
  position: [number, number, number];
  rotation: [number, number, number];
  value: [number, number];
  onClick?: () => void;
  isSelected?: boolean;
  scale?: [number, number, number];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  castShadow?: boolean;
}

const Domino: React.FC<DominoProps> = ({
  position,
  rotation,
  value,
  onClick,
  isSelected,
  scale = [1, 1, 1],
  onMouseEnter,
  onMouseLeave,
  castShadow = false
}) => {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.1 + 0.1;
    }
  });

  const [left, right] = value;

  const Spot = ({ position }: { position: [number, number, number] }) => (
    <mesh position={position} castShadow={castShadow}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={onClick} scale={scale}>
      {/* Main domino body - flat rectangle */}
      <mesh castShadow={castShadow} receiveShadow>
        <boxGeometry args={[1, 0.2, 2]} />
        <meshStandardMaterial color={isSelected ? 'lightblue' : 'ivory'} />
      </mesh>

      {/* Left side spots (now on top face, first half) */}
      {getSpotPositions(left).map((pos, index) => (
        <Spot key={`left-${index}`} position={[pos[0], 0.11, pos[1] - 0.5]} />
      ))}

      {/* Right side spots (now on top face, second half) */}
      {getSpotPositions(right).map((pos, index) => (
        <Spot key={`right-${index}`} position={[pos[0], 0.11, pos[1] + 0.5]} />
      ))}

      {/* Divider line on top face */}
      <mesh position={[0, 0.11, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.95, 0.01, 0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>

      <Html
        position={[0, 0.2, 0]}
        occlude
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </Html>
    </group>
  );
};

const getSpotPositions = (value: number): [number, number][] => {
  const positions: [number, number][] = [
    [-0.25, -0.25], [0, -0.25], [0.25, -0.25],
    [-0.25, 0], [0, 0], [0.25, 0],
    [-0.25, 0.25], [0, 0.25], [0.25, 0.25],
  ];

  switch (value) {
    case 1: return [positions[4]];
    case 2: return [positions[0], positions[8]];
    case 3: return [positions[0], positions[4], positions[8]];
    case 4: return [positions[0], positions[2], positions[6], positions[8]];
    case 5: return [positions[0], positions[2], positions[4], positions[6], positions[8]];
    case 6: return [positions[0], positions[2], positions[3], positions[5], positions[6], positions[8]];
    default: return [];
  }
};

export default Domino;