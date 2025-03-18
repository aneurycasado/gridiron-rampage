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
  const { gameStarted, rageMode, players } = useStore();
  const cameraRef = useRef();
  const playerRef = useRef();
  const bodyRef = useRef();
  const footballRef = useRef();
  
  // Camera settings
  const cameraOffset = useRef({
    x: 0,
    y: 5,
    z: 10
  });
  
  // Generate a stable football ID
  const footballId = useMemo(() => `football-${Math.random().toString(36).substr(2, 9)}`, []);

  // Get the main player
  const mainPlayer = useMemo(() => players[0], [players]);
  
  useFrame((state, delta) => {
    if (!gameStarted) {
      // Intro camera rotation
      const time = state.clock.getElapsedTime() * 0.2;
      const radius = 30;
      
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(time) * radius;
        cameraRef.current.position.z = Math.cos(time) * radius;
        cameraRef.current.lookAt(0, 0, 0);
      }
    }
    else if (gameStarted && playerRef.current) {
      try {
        const playerPos = playerRef.current.translation();
        
        if (cameraRef.current) {
          // Update camera position to follow player with offset
          cameraRef.current.position.x = playerPos.x + cameraOffset.current.x;
          cameraRef.current.position.y = playerPos.y + cameraOffset.current.y;
          cameraRef.current.position.z = playerPos.z + cameraOffset.current.z;
          
          // Make camera look at player
          cameraRef.current.lookAt(
            playerPos.x,
            playerPos.y + 1, // Look slightly above player
            playerPos.z
          );
        }
      } catch (error) {
        console.error("Camera tracking error:", error);
      }
    }
  });

  // Football component
  const FootballComponent = gameStarted ? (
    <Football 
      key={footballId}
      id={footballId}
      position={[0, 1, -5]} 
      ref={footballRef}
    />
  ) : null;

  // Player component
  const PlayerComponent = gameStarted ? (
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
        position={[0, 10, 30]}
        fov={75}
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