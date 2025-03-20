import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { Ground } from './Ground';
import { WallsArena } from './WallsArena';
import { PlayerController } from './PlayerController';
import { Football } from './models/items/Football';
import { 
  GameController,
  PlayController,
  OffensiveController,
  DefensiveController
} from '../controllers';
import { KennyPlayer, TEAM } from './models/characters/KennyPlayer';

export const Experience = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playActive, setPlayActive] = useState(false);
  const cameraRef = useRef();
  const lookAtTarget = useRef();
  
  // Initial camera settings
  const cameraSettings = {
    position: [0, 25, 30], // Higher up and back for better field view
    fov: 70 // Wider field of view for better visibility
  };
  
  // Check game state on component mount
  useEffect(() => {
    const gameState = GameController.getState();
    setGameStarted(gameState.gameStarted);
    
    // Subscribe to game state changes
    const unsubGame = GameController.subscribe(
      state => setGameStarted(state.gameStarted)
    );
    
    // Subscribe to play state changes
    const unsubPlay = PlayController.subscribe(
      state => setPlayActive(state.playActive)
    );
    
    return () => {
      unsubGame();
      unsubPlay();
    };
  }, []);
  
  // Setup players and field
  useEffect(() => {
    if (gameStarted) {
      // Position players based on formations
      setTimeout(() => {
        console.log("Positioning players from Experience component");
        OffensiveController.getState().actions.positionOffensivePlayers();
        DefensiveController.getState().actions.positionDefensivePlayers();
      }, 1000);
      
      // Also position players when players are added to the store
      const unsubPlayers = PlayController.subscribe(
        (state, prevState) => {
          if (state.players.length > prevState.players.length) {
            console.log("Players list updated, positioning players");
            setTimeout(() => {
              OffensiveController.getState().actions.positionOffensivePlayers();
              DefensiveController.getState().actions.positionDefensivePlayers();
            }, 500);
          }
        }
      );
      
      return () => {
        unsubPlayers();
      };
    }
  }, [gameStarted]);
  
  // Camera follow using useFrame instead of requestAnimationFrame
  useFrame((state, delta) => {
    if (!cameraRef.current) return;
    
    const cameraSpeed = 0.05; // Smaller = smoother but slower camera
    
    // Get player for camera follow
    const { players, activePossession, footballs } = PlayController.getState();
    const offensivePlayer = players.find(p => p.id === 'player-offense');
    
    // If no offensive player yet, keep default camera
    if (!offensivePlayer || !offensivePlayer.position) return;
    
    // If football is thrown, follow football
    const isFootballThrown = footballs.some(f => f.isThrown);
    
    if (playActive && isFootballThrown && footballs.length > 0) {
      const football = footballs[0];
      if (football.position) {
        // Follow the thrown football from behind
        const targetX = football.position[0];
        const targetZ = football.position[2] + 15; // Position behind the football
        
        // Smooth camera movement
        cameraRef.current.position.x = cameraRef.current.position.x * (1 - cameraSpeed) + targetX * cameraSpeed;
        cameraRef.current.position.z = cameraRef.current.position.z * (1 - cameraSpeed) + targetZ * cameraSpeed;
        cameraRef.current.position.y = 10; // Fixed height
        
        // Look at the football
        cameraRef.current.lookAt(football.position[0], football.position[1], football.position[2]);
      }
    } else {
      // Follow the offensive player from behind
      const cameraOffsetZ = 15; // Distance behind player
      const cameraHeight = 10; // Height above player
      
      // Position camera behind player based on their rotation
      const playerRotation = offensivePlayer.rotation || 0;
      
      // Calculate offset based on player rotation
      const offsetX = -Math.sin(playerRotation) * cameraOffsetZ;
      const offsetZ = -Math.cos(playerRotation) * cameraOffsetZ;
      
      // Target positions
      const targetX = offensivePlayer.position.x + offsetX;
      const targetZ = offensivePlayer.position.z + offsetZ;
      
      // Smooth camera movement
      cameraRef.current.position.x = cameraRef.current.position.x * (1 - cameraSpeed) + targetX * cameraSpeed;
      cameraRef.current.position.z = cameraRef.current.position.z * (1 - cameraSpeed) + targetZ * cameraSpeed;
      cameraRef.current.position.y = cameraHeight;
      
      // Make camera look at player with a small y offset for better viewing angle
      cameraRef.current.lookAt(
        offensivePlayer.position.x,
        offensivePlayer.position.y + 1,
        offensivePlayer.position.z
      );
    }
  });

  return (
    <Suspense fallback={null}>
      {/* Camera */}
      <mesh ref={lookAtTarget} position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={cameraSettings.position}
        fov={cameraSettings.fov}
        near={0.1}
        far={1000}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.7} /> {/* Brighter ambient light */}
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <Environment preset="city" />
      
      {/* Physics World */}
      <Physics gravity={[0, -30, 0]} debug={false}>
        {/* Stadium */}
        <Ground />
        <WallsArena />
        
        {/* Players */}
        <PlayerController
          id="player-offense"
          isMainPlayer={true}
          position={[0, 1, 0]}
          teamType={TEAM.OFFENSE}
        />
        
        <PlayerController
          id="player-defense"
          position={[0, 1, -10]}
          teamType={TEAM.DEFENSE}
        />
        
        {/* Football */}
        <Football id="main-football" position={[0, 1, 0]} />
      </Physics>
    </Suspense>
  );
};