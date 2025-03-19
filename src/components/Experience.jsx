import React, { useRef, useState, useEffect, useMemo } from 'react';
import { PerspectiveCamera, Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useStore } from "./store";
import { Ground } from "./Ground";
import { WallsArena } from "./WallsArena";
import { PlayerController } from "./PlayerController";
import AIPlayer from "./plays/AIPlayer";
import { TEAM } from "./models/characters/KennyPlayer";
import { Football } from "./models/items/Football";
import { Physics } from '@react-three/rapier';
import { PlayVisualization } from './plays/PlayVisualization';
import { FieldOverlay } from './plays/FieldOverlay';
import * as THREE from 'three';

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const Experience = () => {
  const { gameStarted, gamePaused, playActive, fieldVisible, rageMode, players, plays, downs, actions } = useStore();
  const cameraRef = useRef();
  const offensivePlayerRef = useRef();
  const defensivePlayerRef = useRef();
  const bodyRef = useRef();
  const footballRef = useRef();
  const aiPlayersRef = useRef({});
  
  // Camera settings - keep camera a fixed distance behind player
  const cameraOffset = useRef({
    height: 6,       // Camera height above field
    distance: 15     // Distance behind player (in +Z direction)
  });
  
  // Dynamic line of scrimmage based on current downs state
  const lineOfScrimmage = () => {
    // Convert yard line (0-100) to 3D space Z-coordinate (-100 to +100)
    const zPos = -((downs.position / 100) * 200) + 100;
    return { x: 0, z: zPos };
  };
  
  // Camera target position for smooth transitions
  const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 0));
  
  // Generate a stable football ID
  const footballId = useMemo(() => `football-${Math.random().toString(36).substr(2, 9)}`, []);

  // Get the main player
  const mainPlayer = useMemo(() => players[0], [players]);
  
  // Auto-start the game
  useEffect(() => {
    actions.resetPlay();
  }, [actions, gameStarted]);

  // Ensure field stays visible
  useEffect(() => {
    if (!fieldVisible) {
      console.log("Field visibility lost, restoring...");
      actions.resetPlay();
    }
  }, [fieldVisible, actions]);

  useFrame((state, delta) => {
    // Skip frame updates when the game is paused
    if (gamePaused) return;
    
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
    else if (gameStarted) {
      try {
        // Get current play state
        const { playActive, footballs, activePossession, players } = useStore.getState();
        
        if (cameraRef.current) {
          // Get a reference to the football and offensive player
          const football = footballs[0];
          const offensivePlayer = players.find(p => p.id === "player-offense");
          
          // Camera behavior depends on game state
          if (playActive && (football || offensivePlayer)) {
            // During active play - camera follows the action (football or player with ball)
            let targetPos = { x: 0, y: 1, z: 0 };
            
            // First priority: use football position if available
            if (football && football.position) {
              targetPos = {
                x: football.position[0] || 0,
                y: football.position[1] || 1,
                z: football.position[2] || 0
              };
            } 
            // Second priority: use football ref if position not directly available
            else if (football && football.ref && football.ref.current) {
              const ballPos = football.ref.current.translation();
              targetPos = { x: ballPos.x, y: ballPos.y, z: ballPos.z };
            }
            // Third priority: fall back to offensive player position if football data not available
            else if (offensivePlayer && offensivePlayer.position) {
              targetPos = {
                x: offensivePlayer.position.x,
                y: offensivePlayer.position.y,
                z: offensivePlayer.position.z
              };
            }
            
            // Use a fixed camera position that follows the ball but doesn't rotate with player direction
            // This eliminates excessive camera movement when changing direction
            
            // Position camera at a fixed offset behind the action (in +Z direction)
            targetCameraPosition.current.set(
              targetPos.x, // Stay aligned with ball on X-axis
              cameraOffset.current.height, // Maintain height
              targetPos.z + cameraOffset.current.distance // Fixed position behind (higher Z value)
            );
            
            // Always look at the ball's position
            const lookAtTarget = new THREE.Vector3(
              targetPos.x, // Look directly at ball X position
              targetPos.y, // Look at ball height
              targetPos.z  // Look directly at ball Z position
            );
            
            // Use extremely gentle lerping to reduce camera shake
            // Apply stronger damping to reduce oscillation
            
            // For X movement (side to side) - very gentle
            cameraRef.current.position.x = THREE.MathUtils.lerp(
              cameraRef.current.position.x, 
              targetCameraPosition.current.x, 
              delta * 0.8 // Very gentle tracking 
            );
            
            // For Y movement (up/down) - very stable
            cameraRef.current.position.y = THREE.MathUtils.lerp(
              cameraRef.current.position.y, 
              targetCameraPosition.current.y, 
              delta * 0.5 // Most gentle tracking
            );
            
            // For Z movement (forward/backward) - gentle but responsive
            cameraRef.current.position.z = THREE.MathUtils.lerp(
              cameraRef.current.position.z, 
              targetCameraPosition.current.z, 
              delta * 0.8 // Very gentle tracking
            );
            
            // Look at the target (which is ahead of the ball)
            cameraRef.current.lookAt(lookAtTarget);
          } else {
            // Default camera position when play is not active
            // Position camera at the line of scrimmage
            const currentLOS = lineOfScrimmage();
            const targetX = currentLOS.x;
            const targetY = cameraOffset.current.height;
            const targetZ = currentLOS.z + cameraOffset.current.distance;
            
            targetCameraPosition.current.set(
              targetX,
              targetY,
              targetZ
            );
            
            // Use different lerp speeds for different axes
            cameraRef.current.position.x = THREE.MathUtils.lerp(
              cameraRef.current.position.x, 
              targetCameraPosition.current.x, 
              delta * 2.0
            );
            
            cameraRef.current.position.y = THREE.MathUtils.lerp(
              cameraRef.current.position.y, 
              targetCameraPosition.current.y, 
              delta * 2.0
            );
            
            cameraRef.current.position.z = THREE.MathUtils.lerp(
              cameraRef.current.position.z, 
              targetCameraPosition.current.z, 
              delta * 2.0
            );
            
            // Look at the line of scrimmage
            // Use the same currentLOS as defined above
            const lookAtTarget = new THREE.Vector3(
              currentLOS.x,     // Center of field
              1,                // Just above ground level
              currentLOS.z      // Line of scrimmage
            );
            
            // Make camera look at the line of scrimmage
            cameraRef.current.lookAt(lookAtTarget);
          }
        }
      } catch (error) {
        console.error("Camera tracking error:", error);
      }
    }
  });

  // Dynamic positions for players and football based on line of scrimmage
  const getPositions = () => {
    const currentLOS = lineOfScrimmage();
    
    // Apply safety checks to ensure positions are within valid field boundaries
    const safeZ = clamp(currentLOS.z, -95, 95);
    
    // Position offensive player 3 units behind line of scrimmage
    const offensivePos = [0, 1, clamp(safeZ + 3, -95, 95)];
    
    // Position defensive player 3 units in front of line of scrimmage
    const defensivePos = [0, 1, clamp(safeZ - 3, -95, 95)];
    
    // Position football at line of scrimmage
    const footballPos = [0, 0.15, safeZ];
    
    // Log if we're near boundaries to help with debugging
    if (safeZ < -90 || safeZ > 90) {
      console.warn(`Experience: positions near boundaries - LOS Z: ${safeZ}`);
    }
    
    return { offensivePos, defensivePos, footballPos };
  };
  
  // downs already pulled from useStore at the top
  
  // Determine which player is on offense based on possession state
  const offenseTeamType = downs.possession === "offense" ? TEAM.OFFENSE : TEAM.DEFENSE;
  const defenseTeamType = downs.possession === "offense" ? TEAM.DEFENSE : TEAM.OFFENSE;
  
  // Get current positions based on the line of scrimmage
  const positions = getPositions();
  
  // Football component
  const FootballComponent = gameStarted ? (
    <Football 
      key={footballId}
      id={footballId}
      position={positions.footballPos} 
      ref={footballRef}
    />
  ) : null;

  // Determine rotation based on possession (which way players should face)
  const offensiveRotation = downs.possession === "offense" ? Math.PI : 0;
  const defensiveRotation = downs.possession === "offense" ? 0 : Math.PI;
  
  // Offensive player component
  const OffensivePlayerComponent = gameStarted ? (
    <PlayerController 
      key="offensive-player"
      ref={offensivePlayerRef}
      id="player-offense"
      isMainPlayer={true} // Always control offensive player for this prototype
      position={positions.offensivePos}
      rotation={offensiveRotation} // Dynamic rotation based on possession
      teamType={offenseTeamType} // Dynamic team type based on possession
    />
  ) : null;
  
  // Defensive player component
  const DefensivePlayerComponent = gameStarted ? (
    <PlayerController 
      key="defensive-player"
      ref={defensivePlayerRef}
      id="player-defense"
      isMainPlayer={false} // AI controlled
      position={positions.defensivePos}
      rotation={defensiveRotation} // Dynamic rotation based on possession
      teamType={defenseTeamType} // Dynamic team type based on possession
    />
  ) : null;

  // Play visualization elements
  const selectedPlay = plays.selectedOffensivePlay || plays.selectedDefensivePlay;
  const lineOfScrimmageZ = -((downs.position / 100) * 200) + 100;
  
  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 6, 15]} // Initial position, will be updated
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
      
      {/* Play visualization components */}
      {gameStarted && !playActive && plays.showRoutes && selectedPlay && (
        <PlayVisualization 
          play={selectedPlay} 
          active={plays.playPhase === 'setup'} 
        />
      )}
      
      {gameStarted && !playActive && (
        <FieldOverlay 
          play={selectedPlay}
          formation={selectedPlay?.formation}
          lineOfScrimmageZ={lineOfScrimmageZ}
          showFormationLabels={plays.playPhase === 'setup'}
          showRoutes={plays.showRoutes}
        />
      )}
      
      <Physics debug={import.meta.env.DEV}>
        <WallsArena />
        <Ground />
        {OffensivePlayerComponent}
        {DefensivePlayerComponent}
        {FootballComponent}
        
        {/* Add AI players when using a play */}
        {gameStarted && plays.playPhase !== 'selection' && selectedPlay && (
          selectedPlay.formation.positions.filter(pos => 
            // Skip the main player positions that are already handled
            pos.role !== 'QB' && 
            pos.id !== 'player-offense' && 
            pos.id !== 'player-defense'
          ).map(position => {
            // Calculate position based on line of scrimmage
            const flip = downs.possession !== 'offense';
            const xPos = flip ? -position.relativeCoordinates[0] : position.relativeCoordinates[0];
            const zOffset = flip ? -position.relativeCoordinates[2] : position.relativeCoordinates[2];
            const zPos = lineOfScrimmageZ + zOffset;
            
            // Get route for this player if available
            const route = selectedPlay.routes && selectedPlay.routes[position.id];
            
            return (
              <AIPlayer
                key={`ai-${position.id}`}
                id={`ai-${position.id}`}
                position={[xPos, position.relativeCoordinates[1], zPos]}
                rotation={flip ? (position.rotation + Math.PI) % (2 * Math.PI) : position.rotation}
                role={position.role}
                teamType={downs.possession === 'offense' ? TEAM.OFFENSE : TEAM.DEFENSE}
                route={route}
                // Configure AI behavior based on role
                aiConfig={{
                  speed: position.role === 'WR' ? 11 : 
                         position.role === 'RB' ? 10 :
                         position.role === 'TE' ? 9 :
                         position.role === 'QB' ? 8 :
                         position.role === 'OL' ? 7 :
                         position.role === 'LB' ? 10 :
                         position.role === 'DL' ? 9 :
                         position.role === 'CB' ? 12 :
                         position.role === 'S' ? 11 : 8,
                  startDelay: position.role === 'WR' ? 0.1 : 
                              position.role === 'TE' ? 0.2 : 
                              position.role === 'OL' ? 0.3 : 0.2
                }}
                // Correctly forward the ref to the AI player
                ref={el => {
                  if (el) {
                    aiPlayersRef.current[position.id] = el;
                  }
                }}
              />
            );
          })
        )}
      </Physics>
    </>
  );
};