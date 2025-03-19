import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

// FieldOverlay provides field markings for pre-snap visualization
export const FieldOverlay = ({ 
  play, 
  formation,
  lineOfScrimmageZ = 0,
  showFormationLabels = true,
  showRoutes = true 
}) => {
  const lineOfScrimmageRef = useRef();
  const firstDownLineRef = useRef();
  const formationLabelsRef = useRef({});
  const { downs } = useStore();
  
  // Update position of LOS and first down line
  useEffect(() => {
    // Line of scrimmage
    if (lineOfScrimmageRef.current) {
      lineOfScrimmageRef.current.position.z = lineOfScrimmageZ;
    }
    
    // First down line
    if (firstDownLineRef.current) {
      const firstDownPos = -((downs.firstDownLine / 100) * 200) + 100;
      firstDownLineRef.current.position.z = firstDownPos;
    }
  }, [lineOfScrimmageZ, downs.firstDownLine]);
  
  return (
    <group>
      {/* Line of Scrimmage */}
      <group ref={lineOfScrimmageRef} position={[0, 0.05, lineOfScrimmageZ]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 0.5]} />
          <meshBasicMaterial color="yellow" transparent opacity={0.7} />
        </mesh>
        
        <mesh position={[-22, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 1]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      </group>
      
      {/* First Down Line */}
      <group ref={firstDownLineRef} position={[0, 0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 0.5]} />
          <meshBasicMaterial color="#2ecc71" transparent opacity={0.7} />
        </mesh>
        
        <mesh position={[22, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 1]} />
          <meshBasicMaterial color="#2ecc71" />
        </mesh>
      </group>
      
      {/* Yard Marker Every 5 Yards */}
      <YardMarkers />
      
      {/* Hash Marks */}
      <HashMarks />
      
      {/* Formation and Player Position Labels */}
      {showFormationLabels && formation && (
        <FormationLabels 
          formation={formation} 
          lineOfScrimmageZ={lineOfScrimmageZ} 
          ref={formationLabelsRef} 
        />
      )}
    </group>
  );
};

// Yard line markers
const YardMarkers = () => {
  const markers = [];
  const fieldLength = 100 * 2; // 0-100 yard lines = 200 units in game space
  const spacing = fieldLength / 20; // Markers every 5 yards
  
  for (let i = 0; i <= 20; i++) {
    if (i % 2 === 0) { // Only show every 10 yards
      const zPos = -fieldLength / 2 + i * spacing;
      const yardLine = i * 5;
      const displayNumber = yardLine <= 50 ? yardLine : 100 - yardLine;
      
      markers.push(
        <group key={`yard-${i}`} position={[0, 0.05, zPos]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 0.2]} />
            <meshBasicMaterial color="white" transparent opacity={0.5} />
          </mesh>
          
          <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 1]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </group>
      );
    }
  }
  
  return <group>{markers}</group>;
};

// Hash marks along the sides
const HashMarks = () => {
  const hashMarks = [];
  const fieldLength = 100 * 2;
  const hashSpacing = fieldLength / 40; // 40 hash marks (every 5 yards)
  const hashWidth = 1;
  
  for (let i = 1; i < 40; i++) {
    if (i % 2 !== 0) continue; // Only add hash marks every 5 yards
    
    const zPos = -fieldLength / 2 + i * hashSpacing;
    
    // Left hash marks
    hashMarks.push(
      <mesh key={`hash-left-${i}`} position={[-15, 0.05, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[hashWidth, 0.1]} />
        <meshBasicMaterial color="white" transparent opacity={0.5} />
      </mesh>
    );
    
    // Right hash marks
    hashMarks.push(
      <mesh key={`hash-right-${i}`} position={[15, 0.05, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[hashWidth, 0.1]} />
        <meshBasicMaterial color="white" transparent opacity={0.5} />
      </mesh>
    );
  }
  
  return <group>{hashMarks}</group>;
};

// Formation player position labels
const FormationLabels = React.forwardRef(({ formation, lineOfScrimmageZ }, ref) => {
  // Determine if offense or defense based on user's possession
  const { downs } = useStore();
  const isOffense = downs.possession === 'offense';
  
  // Get appropriate color based on player type
  const getColorForPosition = (role) => {
    if (isOffense) {
      if (role === 'QB') return '#ff0000';
      if (role === 'RB' || role === 'FB') return '#ff8800';
      if (role === 'WR' || role === 'TE') return '#00ff00';
      return '#ffffff';
    } else {
      if (role === 'DL') return '#ff8800';
      if (role === 'LB') return '#ff0000';
      if (role === 'CB' || role === 'S') return '#00ff00';
      return '#ffffff';
    }
  };
  
  // Need to calculate actual position based on line of scrimmage
  const getAbsolutePosition = (position) => {
    const [relX, relY, relZ] = position.relativeCoordinates;
    
    // Handle team direction based on possession
    const flipFormation = downs.possession !== 'offense';
    const xPos = flipFormation ? -relX : relX;
    const zOffset = flipFormation ? -relZ : relZ;
    
    return [xPos, relY, lineOfScrimmageZ + zOffset];
  };
  
  return (
    <group>
      {formation.positions.map((position) => {
        const [x, y, z] = getAbsolutePosition(position);
        const color = getColorForPosition(position.role);
        
        return (
          <group key={position.id} position={[x, y + 1, z]}>
            <mesh ref={el => ref.current[position.id] = el}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
            
            {/* Position marker dot */}
            <mesh position={[0, -0.8, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

export default FieldOverlay;