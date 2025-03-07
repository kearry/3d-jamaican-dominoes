// src/components/DominoChain.tsx

import React, { useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import Domino from './Domino';
import Table from './Table';
import { useGameContext } from '../context/GameContext';
import { Domino as DominoType } from '../types/gameTypes';

interface ControlsProps {
  target?: [number, number, number];
}

const Controls: React.FC<ControlsProps> = ({ target = [0, 0, 0] }) => {
  const { camera } = useThree();

  // Set the camera to look at the target
  React.useEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);

  return <OrbitControls target={target} enableDamping dampingFactor={0.25} />;
};

const DominoChain: React.FC = () => {
  const { state } = useGameContext();
  const { dominoChain: chain } = state;

  // A center placeholder mesh that won't be visible but helps with orbit controls
  const PlaceholderMesh = () => (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" opacity={0} transparent />
    </mesh>
  );

  return (
    <div className="w-full h-full rounded-md overflow-hidden">
      <Canvas shadows>
        {/* Add a PerspectiveCamera with a better angle for viewing flat dominoes */}
        <PerspectiveCamera
          makeDefault
          position={[0, 18, 10]}
          fov={40}
          near={0.1}
          far={1000}
        />

        {/* Light setup */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Environment for better lighting and reflections */}
        <Environment preset="sunset" />

        {/* 3D Table component */}
        <Table position={[0, -0.5, 0]} />

        {/* Placeholder for orbit controls to focus on */}
        <PlaceholderMesh />

        {/* Domino chain - Raised Y position to sit on top of table */}
        <group position={[0, 0.3, 0]}>
          {chain.map((domino: DominoType, index: number) => {
            const { leftPips, rightPips, position, rotation } = domino;
            return (
              <Domino
                key={`${index}-${leftPips}-${rightPips}`}
                value={[leftPips, rightPips]}
                position={position}
                rotation={rotation}
                isSelected={false}
                castShadow={true}
                scale={[2, 2, 2]} // Increase the scale of dominoes
              />
            );
          })}
        </group>

        <Controls target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};

export default DominoChain;