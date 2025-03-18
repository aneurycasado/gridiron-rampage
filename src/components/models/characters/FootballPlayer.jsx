import React, { useRef } from 'react';
import { Box, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function FootballPlayer({ isRageMode = false, rotation = 0, ...props }) {
  const playerRef = useRef();
  
  useFrame(() => {
    if (playerRef.current) {
      // Apply rotation if it's a number
      if (typeof rotation === 'number') {
        playerRef.current.rotation.y = rotation;
      }
    }
  });
  
  return (
    <group ref={playerRef} {...props}>
      {/* Body */}
      <Box
        args={[0.8, 1.5, 0.5]}
        position={[0, 0.75, 0]}
        castShadow
      >
        <meshStandardMaterial 
          color={isRageMode ? "#ff0000" : "#0000ff"} 
          roughness={0.5}
        />
      </Box>
      
      {/* Head */}
      <Sphere
        args={[0.3, 16, 16]}
        position={[0, 1.8, 0]}
        castShadow
      >
        <meshStandardMaterial 
          color={isRageMode ? "#ffff00" : "#ffffff"} 
          roughness={0.5}
        />
      </Sphere>
      
      {/* Helmet */}
      <Sphere
        args={[0.35, 16, 16]}
        position={[0, 1.8, 0]}
        scale={[1, 0.7, 1]}
        castShadow
      >
        <meshStandardMaterial 
          color={isRageMode ? "#ff4500" : "#333333"} 
          roughness={0.5}
          transparent
          opacity={0.7}
        />
      </Sphere>
      
      {/* Rage mode glow effect */}
      {isRageMode && (
        <Sphere
          args={[1, 16, 16]}
          position={[0, 1, 0]}
        >
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={0.3}
          />
        </Sphere>
      )}
    </group>
  );
}