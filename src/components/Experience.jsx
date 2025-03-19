import React, { useRef, useState, useEffect, useMemo } from 'react';
import { PerspectiveCamera, Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useStore } from "./store";
import { Ground } from "./Ground";
import { WallsArena } from "./WallsArena";
import { PlayerController } from "./PlayerController";
import { Football } from "./models/items/Football";
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';

export const Experience = () => {
  const { gameStarted, gamePaused, gamePhase, rageMode, players } = useStore();
  const cameraRef = useRef();
  const playerRef = useRef();
  const bodyRef = useRef();
  const footballRef = useRef();
  
  // Camera settings - keep camera a fixed distance behind player
  const cameraOffset = useRef({
    height: 4,      // Camera height above player
    distance: 8     // Distance behind player (in +Z direction)
  });
  
  // Camera target position for smooth transitions
  const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 0));
  
  // Generate a stable football ID
  const footballId = useMemo(() => `football-${Math.random().toString(36).substr(2, 9)}`, []);

  // Get the main player
  const mainPlayer = useMemo(() => players[0], [players]);
  
  // Only run game physics when in 'playing' phase
  const isPlayingPhase = gamePhase === 'playing';
  
  useFrame((state, delta) => {
    // Skip frame updates when the game is paused
    if (gamePaused) return;
    
    if (!gameStarted || !isPlayingPhase) {
      // Intro camera rotation for non-gameplay phases
      const time = state.clock.getElapsedTime() * 0.2;
      const radius = 30;
      
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(time) * radius;
        cameraRef.current.position.z = Math.cos(time) * radius;
        cameraRef.current.lookAt(0, 0, 0);
      }
    }
    else if (gameStarted && isPlayingPhase && mainPlayer && mainPlayer.ref && mainPlayer.ref.current) {
      try {
        // Get player position
        const playerPos = mainPlayer.ref.current.translation();
        
        if (cameraRef.current) {
          // Keep camera directly behind player in world space (ignore player rotation)
          // This makes camera only follow player position, not rotation
          
          // Let's fix coordinate system understanding
          // In our game setup:
          // Player initially faces -Z direction
          // Camera should be at +Z relative to player (behind them)
          
          // Calculate target camera position (always behind player in world space)
          const targetX = playerPos.x;
          const targetY = playerPos.y + cameraOffset.current.height;
          const targetZ = playerPos.z + cameraOffset.current.distance;
          
          // Apply slight damping to reduce lateral (X) camera movement jitter
          // This helps prevent blurriness when moving right
          const dampedX = cameraRef.current.position.x * 0.05 + targetX * 0.95;
          
          targetCameraPosition.current.set(
            dampedX,
            targetY,
            targetZ
          );
          
          // Use different lerp speeds for different axes to prevent blurry camera movement
          // Slower lerp for X axis (side-to-side) to reduce blur when moving right
          cameraRef.current.position.x = THREE.MathUtils.lerp(
            cameraRef.current.position.x, 
            targetCameraPosition.current.x, 
            delta * 5.0 // Faster X transition
          );
          
          // Standard lerp for Y (height)
          cameraRef.current.position.y = THREE.MathUtils.lerp(
            cameraRef.current.position.y, 
            targetCameraPosition.current.y, 
            delta * 2.5
          );
          
          // Standard lerp for Z (distance)
          cameraRef.current.position.z = THREE.MathUtils.lerp(
            cameraRef.current.position.z, 
            targetCameraPosition.current.z, 
            delta * 2.5
          );
          
          // Create a smoothed lookAt target
          // Use the same damping for X axis to match camera position damping
          const lookAtTarget = new THREE.Vector3(
            dampedX,                // Damped X position (reduces blur)
            playerPos.y + 1,        // Look slightly above player
            playerPos.z             // Look at player's Z position
          );
          
          // Make camera look at the smoothed target
          cameraRef.current.lookAt(lookAtTarget);
        }
      } catch (error) {
        console.error("Camera tracking error:", error);
      }
    }
  });

  // Football component
  const FootballComponent = gameStarted && isPlayingPhase ? (
    <Football 
      key={footballId}
      id={footballId}
      position={[0, 1, -5]} 
      ref={footballRef}
    />
  ) : null;

  // Player component - only shown during active gameplay
  const PlayerComponent = gameStarted && isPlayingPhase ? (
    <PlayerController 
      key="main-player"
      ref={playerRef}
      id="player-1"
      isMainPlayer={true}
    />
  ) : null;

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 5, 10]} // Initial position, will be updated
        fov={60}
        near={0.1}
        far={1000}
      />
      
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
      />
      <ambientLight intensity={0.5} />
      
      <Environment preset="city" />
      
      <Physics debug={import.meta.env.DEV}>
        <WallsArena />
        <Ground />
        {PlayerComponent}
        {FootballComponent}
      </Physics>
    </>
  );
};