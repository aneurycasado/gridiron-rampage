import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useStore } from '../store';
import { KennyPlayer, TEAM, getRoleBasedModelIndex } from '../models/characters/KennyPlayer';
import * as THREE from 'three';

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// AI player component extending the base player concept
const AIPlayer = forwardRef(({ 
  id, 
  position = [0, 1, 0],
  rotation = 0,
  role = 'WR',
  teamType = TEAM.OFFENSE,
  route = null,
  isMainPlayer = false,
  aiConfig = {}
}, ref) => {
  // References and state
  const bodyRef = useRef();
  const visualRef = useRef();
  const { gamePaused, playActive, actions } = useStore();
  const [isGrounded, setIsGrounded] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  
  // Enhanced AI state with blocking behavior
  const aiState = useRef({
    isActive: false,
    routeIndex: 0,
    targetPoint: null,
    currentSpeed: 0,
    targetSpeed: 0,
    currentDelay: 0,
    pathProgress: 0,
    hasReachedEndpoint: false,
    mode: 'route', // 'route', 'block', or 'receive'
    blockTarget: null, // Reference to defensive player to block
    blockStrength: role === 'OL' ? 1.5 : 
                   role === 'TE' ? 1.2 : 
                   role === 'RB' || role === 'FB' ? 1.0 : 0.7 // Different blocking strength by position
  });

  // Movement and physics parameters
  const baseSpeed = aiConfig.speed || 8;
  const accelerationRate = 0.15;
  const decelerationRate = 0.25;
  const damping = 0.1;
  const turnSpeed = 0.15;
  const rotationRef = useRef(rotation);
  const targetRotationRef = useRef(rotation);
  const moveDirection = useRef(new THREE.Vector3());
  const lastSafePosition = useRef({ x: 0, y: 1, z: 0 });
  
  // Calculate route path if available
  const routePath = useRef(null);
  
  useEffect(() => {
    if (route && route.curve) {
      routePath.current = route.curve;
    }
  }, [route]);
  
  // Initial setup: register player with store
  useEffect(() => {
    if (bodyRef.current) {
      actions.addPlayer({
        id,
        ref: bodyRef,
        position: bodyRef.current.translation(),
        rotation: rotationRef.current,
        role,
        teamType
      });
      
      return () => {
        actions.removePlayer(id);
      };
    }
  }, [id, actions, role, teamType]);
  
  // Set initial rotation
  useEffect(() => {
    rotationRef.current = rotation;
    targetRotationRef.current = rotation;
    
    if (visualRef.current) {
      visualRef.current.rotation.y = rotation;
    }
  }, [rotation]);
  
  // Start following route when play becomes active
  useEffect(() => {
    // Reset AI state when play starts
    if (playActive) {
      // Determine initial behavior mode based on role
      let initialMode = 'route';
      
      // Linemen and some backs start in blocking mode
      if (role === 'OL' || role === 'FB') {
        initialMode = 'block';
      }
      
      // Initialize state with appropriate values for the role
      aiState.current = {
        isActive: true,
        routeIndex: 0,
        targetPoint: routePath.current ? new THREE.Vector3() : null,
        currentSpeed: 0,
        targetSpeed: baseSpeed,
        currentDelay: aiConfig.startDelay || 0.2, // Small delay before starting route
        pathProgress: 0,
        hasReachedEndpoint: false,
        mode: initialMode,
        blockTarget: null,
        blockStrength: role === 'OL' ? 1.5 : 
                      role === 'TE' ? 1.2 : 
                      role === 'RB' || role === 'FB' ? 1.0 : 0.7 // Different blocking strength by position
      };
      
      console.log(`AI Player ${id} (${role}) starting with mode: ${initialMode}`);
    } else {
      // Reset when play is not active
      aiState.current.isActive = false;
    }
  }, [playActive, id, role, aiConfig.startDelay, baseSpeed, routePath]);
  
  // Main AI behavior logic
  useFrame((state, delta) => {
    // Skip updates when game is paused or no body reference
    if (!bodyRef.current || gamePaused) return;
    
    // Get latest game state
    const { playActive, playEnded } = useStore.getState();
    const currentPos = bodyRef.current.translation();
    
    // Boundary check - reset player if outside field
    if (currentPos.x < -49 || currentPos.x > 49 || currentPos.z < -99 || currentPos.z > 99) {
      console.log(`AI Player ${id} outside boundaries, resetting to last safe position`);
      
      bodyRef.current.setTranslation({ 
        x: clamp(lastSafePosition.current.x, -45, 45), 
        y: 1, 
        z: clamp(lastSafePosition.current.z, -95, 95)
      });
      
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      return;
    } else {
      // Update last safe position
      lastSafePosition.current = { 
        x: currentPos.x, 
        y: currentPos.y, 
        z: currentPos.z 
      };
    }
    
    // Process AI behavior only when play is active
    if (playActive && aiState.current.isActive) {
      // Handle starting delay
      if (aiState.current.currentDelay > 0) {
        aiState.current.currentDelay -= delta;
        aiState.current.targetSpeed = 0;
      } else {
        // Get current ball carrier and game state for decision making
        const { players, activePossession } = useStore.getState();
        const ballCarrier = players.find(p => p.id === activePossession);
        
        // Decide what behavior mode to use based on current state
        if (teamType === TEAM.OFFENSE) {
          // OFFENSIVE PLAYER BEHAVIOR
          
          // Special behavior for linemen and blocking backs - always block
          if (role === 'OL' || (role === 'FB' && aiState.current.mode === 'block')) {
            aiState.current.mode = 'block';
          }
          // Receivers who reach their endpoint should look for the ball
          else if ((role === 'WR' || role === 'TE') && aiState.current.hasReachedEndpoint) {
            aiState.current.mode = 'receive';
          }
          // Players who aren't the ball carrier and aren't already blocking should consider blocking
          else if (activePossession !== id && aiState.current.mode !== 'block' && aiState.current.hasReachedEndpoint) {
            // Once player reaches endpoint, switch to blocking to help ball carrier
            const nearbyDefenders = players.filter(p => 
              p.teamType === TEAM.DEFENSE && 
              p.position && 
              new THREE.Vector3(
                p.position.x - currentPos.x, 
                0, 
                p.position.z - currentPos.z
              ).length() < 10
            );
            
            if (nearbyDefenders.length > 0) {
              aiState.current.mode = 'block';
              console.log(`Player ${id} (${role}) switching to blocking mode`);
            }
          }
        }
        
        // Execute behavior based on current mode
        switch (aiState.current.mode) {
          case 'route':
            // ROUTE RUNNING BEHAVIOR - similar to original code
            if (routePath.current && !aiState.current.hasReachedEndpoint) {
              // Get position along the route curve
              aiState.current.pathProgress = Math.min(aiState.current.pathProgress + delta * 0.3, 1);
              
              // Get next point along curve
              const pointOnCurve = routePath.current.getPointAt(aiState.current.pathProgress);
              aiState.current.targetPoint = pointOnCurve;
              
              // Calculate direction to target
              const directionToTarget = new THREE.Vector3(
                pointOnCurve.x - currentPos.x,
                0,
                pointOnCurve.z - currentPos.z
              );
              
              const distanceToTarget = directionToTarget.length();
              
              // If close to target, reduce speed and check if we've reached the end
              if (distanceToTarget < 1) {
                aiState.current.targetSpeed = baseSpeed * 0.5;
                
                // If at the end of the route, stop
                if (aiState.current.pathProgress >= 0.95) {
                  aiState.current.hasReachedEndpoint = true;
                }
              } else {
                // Otherwise maintain full speed
                aiState.current.targetSpeed = baseSpeed;
              }
              
              // Normalize direction
              if (distanceToTarget > 0.1) {
                directionToTarget.normalize();
                moveDirection.current.copy(directionToTarget);
                
                // Set rotation to face movement direction
                targetRotationRef.current = Math.atan2(directionToTarget.x, directionToTarget.z);
              } else {
                aiState.current.targetSpeed = 0;
              }
            } else {
              // No route or route completed - stop
              aiState.current.targetSpeed = 0;
              
              // Mark endpoint reached if not already
              if (!aiState.current.hasReachedEndpoint) {
                aiState.current.hasReachedEndpoint = true;
              }
            }
            break;
            
          case 'block':
            // BLOCKING BEHAVIOR
            // Find closest defensive player to block
            const defensivePlayerList = players.filter(p => 
              p.teamType === TEAM.DEFENSE && 
              p.position
            );
            
            // Choose blocking target - prioritize closest defender to ball carrier
            let blockTarget = null;
            let shortestDistance = Infinity;
            
            // If we have a ball carrier
            if (ballCarrier && ballCarrier.position) {
              // Find defenders closest to ball carrier
              defensivePlayerList.forEach(defender => {
                if (defender.position) {
                  const distToBallCarrier = new THREE.Vector3(
                    defender.position.x - ballCarrier.position.x,
                    0,
                    defender.position.z - ballCarrier.position.z
                  ).length();
                  
                  // Also consider our own position so we block nearby defenders
                  const distToBlocker = new THREE.Vector3(
                    defender.position.x - currentPos.x,
                    0,
                    defender.position.z - currentPos.z
                  ).length();
                  
                  // Combined score - lower is better
                  const combinedScore = distToBallCarrier * 0.7 + distToBlocker * 0.3;
                  
                  if (combinedScore < shortestDistance) {
                    shortestDistance = combinedScore;
                    blockTarget = defender;
                  }
                }
              });
            } 
            // No ball carrier, just find closest defender
            else {
              defensivePlayerList.forEach(defender => {
                if (defender.position) {
                  const distToBlocker = new THREE.Vector3(
                    defender.position.x - currentPos.x,
                    0,
                    defender.position.z - currentPos.z
                  ).length();
                  
                  if (distToBlocker < shortestDistance) {
                    shortestDistance = distToBlocker;
                    blockTarget = defender;
                  }
                }
              });
            }
            
            // If we found someone to block
            if (blockTarget) {
              // Calculate direction to defender
              const dirToDefender = new THREE.Vector3(
                blockTarget.position.x - currentPos.x,
                0,
                blockTarget.position.z - currentPos.z
              );
              
              const distToDefender = dirToDefender.length();
              
              // If close enough, perform blocking
              if (distToDefender < 3.0) {
                // We're in blocking contact - slow down
                aiState.current.targetSpeed = baseSpeed * 0.2;
                console.log(`${id} (${role}) blocking defender!`);
                
                // If very close, stop and stand ground
                if (distToDefender < 1.5) {
                  aiState.current.targetSpeed = 0;
                }
              } else {
                // Move toward defender to block
                aiState.current.targetSpeed = baseSpeed * 0.8;
                
                // Set direction toward defender
                if (distToDefender > 0.1) {
                  dirToDefender.normalize();
                  moveDirection.current.copy(dirToDefender);
                  
                  // Set rotation to face defender
                  targetRotationRef.current = Math.atan2(dirToDefender.x, dirToDefender.z);
                }
              }
            } else {
              // No one to block, slow down
              aiState.current.targetSpeed = baseSpeed * 0.3;
            }
            break;
            
          case 'receive':
            // RECEIVING BEHAVIOR (for receivers at end of routes)
            aiState.current.targetSpeed = 0;
            
            // Receivers turn to face the QB for a pass
            const qbPosition = findQBPosition();
            if (qbPosition) {
              const dirToQB = new THREE.Vector3(
                qbPosition.x - currentPos.x,
                0,
                qbPosition.z - currentPos.z
              );
              dirToQB.normalize();
              targetRotationRef.current = Math.atan2(dirToQB.x, dirToQB.z);
            }
            break;
            
          default:
            // Default - stop
            aiState.current.targetSpeed = 0;
        }
      }
    } else {
      // When play is not active
      aiState.current.targetSpeed = 0;
    }
    
    // PHYSICS CALCULATIONS
    
    // Get current velocity
    const currentVel = bodyRef.current.linvel();
    
    // Smoothly adjust speed
    if (aiState.current.targetSpeed > aiState.current.currentSpeed) {
      // Accelerating
      aiState.current.currentSpeed = Math.min(
        aiState.current.currentSpeed + accelerationRate * delta * 60,
        aiState.current.targetSpeed
      );
    } else if (aiState.current.targetSpeed < aiState.current.currentSpeed) {
      // Decelerating
      aiState.current.currentSpeed = Math.max(
        aiState.current.currentSpeed - decelerationRate * delta * 60,
        aiState.current.targetSpeed
      );
    }
    
    // Calculate final velocity
    let velocity = {
      x: moveDirection.current.x * aiState.current.currentSpeed,
      y: currentVel.y, // Maintain current Y velocity
      z: moveDirection.current.z * aiState.current.currentSpeed
    };
    
    // Apply damping for natural deceleration
    const dampingFactor = damping * delta * 60;
    if (aiState.current.targetSpeed === 0) {
      velocity.x = currentVel.x * (1 - dampingFactor);
      velocity.z = currentVel.z * (1 - dampingFactor);
    }
    
    // Apply velocity
    bodyRef.current.setLinvel(velocity);
    
    // If nearly stopped, fully stop
    if (Math.abs(currentVel.x) < 0.01 && Math.abs(currentVel.z) < 0.01) {
      if (aiState.current.targetSpeed === 0) {
        bodyRef.current.setLinvel({ x: 0, y: currentVel.y, z: 0 });
      }
    }
    
    // VISUAL UPDATES
    
    // Update player moving state
    const isCurrentlyMoving = Math.abs(currentVel.x) > 0.5 || Math.abs(currentVel.z) > 0.5;
    if (isCurrentlyMoving !== isMoving) {
      setIsMoving(isCurrentlyMoving);
    }
    
    // Smooth rotation interpolation for visual model
    if (isCurrentlyMoving && visualRef.current) {
      rotationRef.current = THREE.MathUtils.lerp(
        rotationRef.current,
        targetRotationRef.current,
        turnSpeed * delta * 60
      );
      
      visualRef.current.rotation.y = rotationRef.current;
    }
    
    // Update position in store
    if (currentPos.x > -50 && currentPos.x < 50 && currentPos.z > -100 && currentPos.z < 100) {
      actions.updatePlayerPosition(id, currentPos, rotationRef.current);
    }
  });
  
  // Helper function to find the QB position for receivers to face
  const findQBPosition = () => {
    const { players } = useStore.getState();
    const qb = players.find(p => p.role === 'QB');
    return qb ? qb.position : null;
  };
  
  // Ground collision detection
  const handleCollisionStart = (event) => {
    const { other } = event;
    if (other.rigidBodyObject && other.rigidBodyObject.name === 'ground') {
      setIsGrounded(true);
    }
  };
  
  const handleCollisionEnd = (event) => {
    const { other } = event;
    if (other.rigidBodyObject && other.rigidBodyObject.name === 'ground') {
      setIsGrounded(false);
    }
  };
  
  // Set the forwarded ref to the bodyRef
  React.useImperativeHandle(ref, () => bodyRef.current);

  return (
    <RigidBody 
      ref={bodyRef} 
      colliders={false} 
      mass={1}
      lockRotations
      position={position}
      enabledRotations={[false, false, false]}
      restitution={0.2}
      friction={0.2}
      linearDamping={0.2}
      onCollisionEnter={handleCollisionStart}
      onCollisionExit={handleCollisionEnd}
      name={id}
    >
      <CuboidCollider args={[0.25, 0.7, 0.25]} />
      <group ref={visualRef} rotation={[0, rotationRef.current, 0]}>
        <KennyPlayer 
          scale={[1.2, 1.2, 1.2]} 
          isMoving={isMoving}
          modelIndex={getRoleBasedModelIndex(role, teamType)}
          direction={targetRotationRef.current}
        />
        
        {/* Enhanced debug visualization for player role and state */}
        <group position={[0, 2.2, 0]}>
          {/* Role indicator */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial 
              color={
                role === 'QB' ? '#ff0000' : 
                role === 'WR' ? '#00ff00' :
                role === 'RB' || role === 'FB' ? '#ff8800' :
                role === 'TE' ? '#00ffff' :
                role === 'OL' ? '#ffffff' :
                role === 'DL' ? '#ff00ff' :
                role === 'LB' ? '#ffff00' :
                role === 'CB' || role === 'S' ? '#0000ff' :
                '#888888'  // Fallback for unknown roles
              }
              toneMapped={false} 
            />
          </mesh>
          
          {/* AI State indicator: Green when route completed, red when in progress */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshBasicMaterial 
              color={aiState.current.hasReachedEndpoint ? '#00ff00' : '#ff0000'} 
              toneMapped={false} 
            />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
});

export default AIPlayer;