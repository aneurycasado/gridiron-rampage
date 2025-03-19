import React, { useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useStore } from './store';

export const Ground = ({ position = [0, 0, 0] }) => {
  // Field dimensions
  const fieldWidth = 100;
  const fieldLength = 200;
  
  // Get the fieldVisible state from the store
  const { fieldVisible, actions } = useStore();
  
  // If the field is not visible, make sure to reset it
  useEffect(() => {
    if (!fieldVisible) {
      console.log("Ground component: Field not visible, restoring...");
      setTimeout(() => actions.resetPlay(), 100);
    }
  }, [fieldVisible, actions]);
  
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
  // Get the current downs state to show the first down line
  const { downs } = useStore();
  
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
    
    // Add yard number marking every 10 yards (except at 50)
    if (i % 2 === 0 && i > 0 && i < 20) {
      const yardNumber = i < 10 ? i * 10 : (20 - i) * 10;
      
      // Only add numbers for 10, 20, 30, and 40 yard lines on both halves
      if (yardNumber !== 50) {
        // Left side yard number
        yardLines.push(
          <mesh key={`yard-num-left-${i}`} position={[-width/4, 0.01, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 2]} />
            <meshBasicMaterial color="white" />
          </mesh>
        );
        
        // Right side yard number
        yardLines.push(
          <mesh key={`yard-num-right-${i}`} position={[width/4, 0.01, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 2]} />
            <meshBasicMaterial color="white" />
          </mesh>
        );
      }
    }
  }
  
  // Calculate first down line position in 3D space
  // Convert yard line (0-100) to 3D space Z-coordinate (-100 to +100)
  const firstDownLinePos = -((downs.firstDownLine / 100) * 200) + 100;
  
  return (
    <group>
      {yardLines}
      
      {/* First down line */}
      <mesh position={[0, 0.02, firstDownLinePos]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, 0.5]} />
        <meshBasicMaterial color="#2ecc71" transparent opacity={0.8} />
      </mesh>
      
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
      
      {/* Line of scrimmage marker */}
      <LineOfScrimmage width={width} length={length} />
      
      {/* Hash marks */}
      <HashMarks width={width} length={length} />
    </group>
  );
};

// Add line of scrimmage marker
const LineOfScrimmage = ({ width }) => {
  const { downs } = useStore();
  
  // Calculate line of scrimmage position in 3D space
  const lineOfScrimmageZ = -((downs.lineOfScrimmage / 100) * 200) + 100;
  
  return (
    <mesh position={[0, 0.02, lineOfScrimmageZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, 0.5]} />
      <meshBasicMaterial color="yellow" />
    </mesh>
  );
};

// Add hash marks along the sides of the field
const HashMarks = ({ width, length }) => {
  const hashMarks = [];
  const hashSpacing = length / 40; // 40 hash marks (every 5 yards)
  const hashWidth = 1;
  
  // Create hash marks on both sides of the field
  for (let i = 1; i < 40; i++) {
    if (i % 2 !== 0) continue; // Only add hash marks every 5 yards
    
    const zPos = -length / 2 + i * hashSpacing;
    
    // Left hash marks
    hashMarks.push(
      <mesh key={`hash-left-${i}`} position={[-width/3, 0.01, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[hashWidth, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    );
    
    // Right hash marks
    hashMarks.push(
      <mesh key={`hash-right-${i}`} position={[width/3, 0.01, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[hashWidth, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    );
  }
  
  return <group>{hashMarks}</group>;
};