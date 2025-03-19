import React from 'react';
import { RigidBody } from '@react-three/rapier';

export function WallsArena() {
  // Field dimensions
  const fieldWidth = 100;
  const fieldLength = 200;
  const wallHeight = 8;
  const wallThickness = 1;
  
  // Wall positions
  const walls = [
    // Left sideline
    {
      position: [-fieldWidth / 2 - wallThickness / 2, wallHeight / 2, 0],
      scale: [wallThickness, wallHeight, fieldLength],
      rotation: [0, 0, 0]
    },
    // Right sideline
    {
      position: [fieldWidth / 2 + wallThickness / 2, wallHeight / 2, 0],
      scale: [wallThickness, wallHeight, fieldLength],
      rotation: [0, 0, 0]
    },
    // End zone 1
    {
      position: [0, wallHeight / 2, -fieldLength / 2 - wallThickness / 2],
      scale: [fieldWidth + wallThickness * 2, wallHeight, wallThickness],
      rotation: [0, 0, 0]
    },
    // End zone 2
    {
      position: [0, wallHeight / 2, fieldLength / 2 + wallThickness / 2],
      scale: [fieldWidth + wallThickness * 2, wallHeight, wallThickness],
      rotation: [0, 0, 0]
    }
  ];

  return (
    <group>
      {walls.map((wall, index) => (
        <WallSection 
          key={index}
          position={wall.position}
          scale={wall.scale}
          rotation={wall.rotation}
        />
      ))}
    </group>
  );
}

function WallSection({ position, scale, rotation }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation} restitution={0.4}>
      <mesh
        castShadow
        receiveShadow
        scale={scale}
      >
        <boxGeometry />
        <meshStandardMaterial color="#555555" transparent opacity={0.8} />
      </mesh>
    </RigidBody>
  );
}