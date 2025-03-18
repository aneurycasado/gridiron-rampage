import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Ground = ({ position = [0, 0, 0] }) => {
  // Field dimensions
  const fieldWidth = 100;
  const fieldLength = 200;
  
  return (
    <group position={position}>
      {/* Main field with collision */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh 
          receiveShadow 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
        >
          <planeGeometry args={[fieldWidth, fieldLength]} />
          <meshStandardMaterial color="#29631c" />
        </mesh>
      </RigidBody>
      
      {/* Field markings - no collision needed */}
      <FieldMarkings width={fieldWidth} length={fieldLength} />
    </group>
  );
};

const FieldMarkings = ({ width, length }) => {
  // Create yard lines
  const yardLines = [];
  const yardSpacing = length / 20; // 20 yard lines (every 10 yards, from 0 to 100)
  
  for (let i = 0; i <= 20; i++) {
    const zPos = -length / 2 + i * yardSpacing;
    yardLines.push(
      <mesh key={`yard-${i}`} position={[0, 0.01, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, 0.2]} />
        <meshBasicMaterial color="white" />
      </mesh>
    );
  }
  
  return (
    <group>
      {yardLines}
      
      {/* End zones */}
      <mesh position={[0, 0.01, -length / 2 + length / 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length / 20]} />
        <meshBasicMaterial color="red" transparent opacity={0.3} />
      </mesh>
      
      <mesh position={[0, 0.01, length / 2 - length / 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length / 20]} />
        <meshBasicMaterial color="blue" transparent opacity={0.3} />
      </mesh>
      
      {/* Mid field */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[width / 10, 32]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
};