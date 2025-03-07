'use client';

import React from 'react';
import { MeshProps } from '@react-three/fiber';

interface TableProps extends MeshProps {
    width?: number;
    length?: number;
    thickness?: number;
    color?: string;
}

const Table: React.FC<TableProps> = ({
    width = 20,  // Reduced from 30
    length = 25, // Reduced from 40
    thickness = 0.3,
    color = '#5a4731', // Richer wood color
    ...props
}) => {
    return (
        <group>
            {/* Main Table Surface */}
            <mesh receiveShadow {...props}>
                <boxGeometry args={[width, thickness, length]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Table Legs */}
            <TableLeg position={[-width / 2 + 1, -5, -length / 2 + 1]} />
            <TableLeg position={[width / 2 - 1, -5, -length / 2 + 1]} />
            <TableLeg position={[-width / 2 + 1, -5, length / 2 - 1]} />
            <TableLeg position={[width / 2 - 1, -5, length / 2 - 1]} />

            {/* Subtle Border */}
            <mesh position={[0, thickness / 2 + 0.01, 0]} receiveShadow>
                <boxGeometry args={[width + 0.2, 0.05, length + 0.2]} />
                <meshStandardMaterial color="#3d3022" />
            </mesh>
        </group>
    );
};

// Simple table leg component
const TableLeg: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <mesh position={position} receiveShadow>
            <cylinderGeometry args={[0.5, 0.5, 10, 8]} />
            <meshStandardMaterial color="#3d3022" />
        </mesh>
    );
};

export default Table;