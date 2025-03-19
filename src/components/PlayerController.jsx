import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import { useStore } from './store';
import { Controls } from '../App';
import { KennyPlayer, TEAM } from './models/characters/KennyPlayer';
import * as THREE from 'three';

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const PlayerController = ({ 
  id, 
  isMainPlayer = false,
  position = [0, 1, 0],
  rotation = 0,
  teamType = TEAM.OFFENSE  // Default to offense team (blue jersey)
}) => {
  // References and state
  const bodyRef = useRef();
  const visualRef = useRef(); // Reference for visual model rotation
  const [isGrounded, setIsGrounded] = useState(true);
  const [isActuallyMoving, setIsActuallyMoving] = useState(false);
  const { gamePaused, playActive, actions } = useStore();
  const rotationRef = useRef(rotation);
  const targetRotationRef = useRef(rotation);
  const lastSafePosition = useRef({ x: 0, y: 1, z: 0 });
  
  // Movement state
  const [isSprinting, setIsSprinting] = useState(false);
  const [stamina, setStamina] = useState(100);
  const [recoveryDelay, setRecoveryDelay] = useState(0);
  
  // Physics parameters
  const walkSpeed = 5;
  const runSpeed = 10;
  const sprintSpeed = 15;
  const defensiveSpeed = 8; // Slower speed for defensive player
  const accelerationRate = 0.15;
  const decelerationRate = 0.25;
  const damping = 0.1; // Higher value means more damping (0-1)
  const turnSpeed = 0.1; // How quickly the player rotates to face movement direction
  
  // Current movement values
  const currentSpeed = useRef(0);
  const targetSpeed = useRef(0);
  const moveDirection = useRef(new THREE.Vector3());
  
  // AI state tracking
  const aiState = useRef({
    isActive: false,
    rushDelay: false,
    lastTargetPos: { x: 0, z: 0 },
    lastDirectionChange: 0, // Time tracker for direction changes
    directionChangeCooldown: 0.5 // Seconds between direction updates
  });
  
  // Keyboard controls
  const upPressed = useKeyboardControls((state) => state[Controls.up]);
  const downPressed = useKeyboardControls((state) => state[Controls.down]);
  const leftPressed = useKeyboardControls((state) => state[Controls.left]);
  const rightPressed = useKeyboardControls((state) => state[Controls.right]);
  const sprintPressed = useKeyboardControls((state) => state[Controls.jump]); // Using jump as sprint
  const tacklePressed = useKeyboardControls((state) => state[Controls.tackle]);
  
  // For keeping track of player collision
  const [hasCollidedWithOffense, setHasCollidedWithOffense] = useState(false);
  
  // Initial setup: register player with store
  useEffect(() => {
    if (bodyRef.current) {
      actions.addPlayer({
        id,
        ref: bodyRef,
        position: bodyRef.current.translation(),
        rotation: rotationRef.current
      });
      
      return () => {
        actions.removePlayer(id);
      };
    }
  }, [id, actions]);
  
  // Set initial rotation
  useEffect(() => {
    rotationRef.current = rotation;
    targetRotationRef.current = rotation;
    
    if (visualRef.current) {
      visualRef.current.rotation.y = rotation;
    }
  }, [rotation]);
  
  // Move defensive player to correct position when play starts
  useEffect(() => {
    if (playActive && id === "player-defense") {
      const { downs } = useStore.getState();
      const lineOfScrimmageZ = -((downs.lineOfScrimmage / 100) * 200) + 100;
      const safeZ = clamp(lineOfScrimmageZ - 3, -95, 95);
      
      console.log(`Defensive player positioning at start of play: Line Z=${lineOfScrimmageZ}, Safe Z=${safeZ}`);
      
      // First, position the player
      setTimeout(() => {
        if (bodyRef.current) {
          const newPos = { 
            x: 0, 
            y: 1, 
            z: safeZ
          };
          
          // Safety check position
          if (newPos.z < -95 || newPos.z > 95) {
            console.warn(`Defensive player position invalid, correcting: ${newPos.z}`);
            newPos.z = clamp(newPos.z, -95, 95);
          }
          
          console.log(`Setting defensive player position to: [${newPos.x}, ${newPos.y}, ${newPos.z}]`);
          bodyRef.current.setTranslation(newPos);
          bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
          
          // Update last safe position
          lastSafePosition.current = { x: newPos.x, y: newPos.y, z: newPos.z };
          
          // Set AI state
          aiState.current = {
            isActive: true,
            rushDelay: true,
            lastTargetPos: { x: 0, z: 0 },
            lastDirectionChange: 0,
            directionChangeCooldown: 0.5
          };
          
          // Delay before AI starts pursuing
          setTimeout(() => {
            if (playActive) {
              console.log("Activating defensive player AI pursuit");
              aiState.current.rushDelay = false;
              
              // Apply initial forward impulse for a "rush" effect - reduced from 25 to 15
              bodyRef.current.applyImpulse({ x: 0, y: 0, z: 15 }, true);
            }
          }, 300);
        }
      }, 50);
    } else {
      // Reset AI state when play is not active
      aiState.current.isActive = false;
    }
  }, [playActive, id]);
  
  // Main physics and movement update loop
  useFrame((state, delta) => {
    // Skip updates when game is paused or no body reference
    if (!bodyRef.current || gamePaused) return;
    
    // Get latest game state
    const { playActive, playEnded, players, activePossession, downs } = useStore.getState();
    const currentPos = bodyRef.current.translation();
    
    // Boundary check - reset player if outside field
    if (currentPos.x < -49 || currentPos.x > 49 || currentPos.z < -99 || currentPos.z > 99) {
      console.log(`Player ${id} outside boundaries, resetting to last safe position`);
      
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
    
    // =============================================
    // PLAYER MOVEMENT LOGIC
    // =============================================
    
    // Get current velocity
    const currentVel = bodyRef.current.linvel();
    let velocity = { x: 0, y: 0, z: 0 };
    
    // Only process movement during active play
    if (playActive) {
      // PLAYER-CONTROLLED BEHAVIOR
      if (isMainPlayer) {
        // Determine base speed
        let speed = walkSpeed;
        
        // Stamina and sprint management
        if (sprintPressed && stamina > 0 && recoveryDelay === 0) {
          speed = sprintSpeed;
          setIsSprinting(true);
          setStamina(prev => Math.max(prev - (delta * 25), 0)); // Deplete stamina
          
          if (stamina <= 1) {
            setRecoveryDelay(2); // 2 second recovery delay when stamina depleted
          }
        } else {
          setIsSprinting(false);
          
          // Handle stamina recovery and delay
          if (recoveryDelay > 0) {
            setRecoveryDelay(prev => Math.max(prev - delta, 0));
          } else if (stamina < 100 && !sprintPressed) {
            setStamina(prev => Math.min(prev + (delta * 10), 100)); // Recover stamina
          }
        }
        
        // Process keyboard input to determine movement direction
        let movingForward = false;
        let movingBackward = false;
        let movingLeft = false;
        let movingRight = false;
        
        // Calculate movement direction
        if (upPressed) {
          velocity.z -= 1;
          movingForward = true;
          targetRotationRef.current = Math.PI; // Facing -Z
        }
        if (downPressed) {
          velocity.z += 1;
          movingBackward = true;
          targetRotationRef.current = 0; // Facing +Z
        }
        if (leftPressed) {
          velocity.x -= 1;
          movingLeft = true;
          targetRotationRef.current = -Math.PI / 2; // Facing -X
        }
        if (rightPressed) {
          velocity.x += 1;
          movingRight = true;
          targetRotationRef.current = Math.PI / 2; // Facing +X
        }
        
        // Calculate diagonal movement rotations
        if (movingForward && movingLeft) targetRotationRef.current = Math.PI * 1.25;  // -Z, -X
        if (movingForward && movingRight) targetRotationRef.current = Math.PI * 0.75; // -Z, +X
        if (movingBackward && movingLeft) targetRotationRef.current = -Math.PI * 0.25; // +Z, -X
        if (movingBackward && movingRight) targetRotationRef.current = Math.PI * 0.25; // +Z, +X
        
        // Normalize velocity for consistent speed in all directions
        const length = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        if (length > 0) {
          // Store movement direction
          moveDirection.current.set(velocity.x / length, 0, velocity.z / length);
          
          // Set target speed based on input
          if (isSprinting) {
            targetSpeed.current = sprintSpeed;
          } else {
            targetSpeed.current = runSpeed;
          }
        } else {
          // No movement input, slow down
          targetSpeed.current = 0;
        }
        
        // Tackle mechanics (make player lunge forward with extra speed)
        if (tacklePressed && isGrounded && isActuallyMoving) {
          // Apply a forward impulse in the direction of movement
          const forwardBoost = moveDirection.current.clone().multiplyScalar(30);
          bodyRef.current.applyImpulse({ 
            x: forwardBoost.x, 
            y: 2, // Small upward boost for a diving tackle
            z: forwardBoost.z 
          }, true);
          
          // Play tackle sound if available
          try {
            const audio = new Audio('/sounds/tackle.mp3');
            audio.volume = 0.7;
            audio.play().catch(e => console.log("Audio play error:", e));
          } catch (e) {
            console.error("Error playing sound:", e);
          }
        }
      } 
      // AI BEHAVIOR (for defensive player)
      else if (id === "player-defense") {
        // Skip AI logic during initial rush delay
        if (!aiState.current.rushDelay) {
          // Update direction change timer
          aiState.current.lastDirectionChange += delta;
          
          // Find the offensive player to chase
          const targetPlayer = players.find(p => p.id === "player-offense");
          
          if (targetPlayer && targetPlayer.position) {
            // Calculate direction to offensive player
            const targetX = targetPlayer.position.x;
            const targetZ = targetPlayer.position.z;
            
            // Save target position for fallback
            aiState.current.lastTargetPos = { x: targetX, z: targetZ };
            
            // Direction vector
            const dirX = targetX - currentPos.x;
            const dirZ = targetZ - currentPos.z;
            
            // Normalize direction
            const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
            
            if (length > 0) {
              // Only update direction if cooldown has elapsed
              if (aiState.current.lastDirectionChange >= aiState.current.directionChangeCooldown) {
                // Add slight randomization to movement direction (wobble effect)
                const randomX = (Math.random() - 0.5) * 0.3; // ±15% randomization
                const randomZ = (Math.random() - 0.5) * 0.3; // ±15% randomization
                
                // Set movement direction with slight randomization
                moveDirection.current.set(
                  (dirX / length) + randomX, 
                  0, 
                  (dirZ / length) + randomZ
                ).normalize(); // Normalize after adding randomness
                
                // Vary speed slightly for more human-like movement
                const speedVariation = 0.85 + (Math.random() * 0.3); // 85-115% of base speed
                targetSpeed.current = defensiveSpeed * speedVariation;
                
                // Set visual rotation to face target
                targetRotationRef.current = Math.atan2(dirX, dirZ);
                
                // Reset cooldown timer
                aiState.current.lastDirectionChange = 0;
              }
              // If still in cooldown, maintain current direction but keep pursuing
              else {
                // Maintain current target speed
                targetSpeed.current = Math.min(targetSpeed.current, defensiveSpeed);
              }
            }
            
            // Check for collision with offensive player
            if (length < 3.0 && !hasCollidedWithOffense) { // Increased from 2.5 to 3.0
              setHasCollidedWithOffense(true);
              
              // Record tackle position for next play
              const safePosition = {
                x: clamp(targetX, -45, 45),
                y: 1,
                z: clamp(targetZ, -95, 95)
              };
              actions.recordTacklePosition(safePosition);
              
              // End the play
              actions.endPlay();
              console.log("Tackle! Play ended.");
              
              // Play tackle sound
              try {
                const audio = new Audio(`/sounds/tackle.mp3`);
                audio.volume = 0.7;
                audio.play().catch(e => console.log("Audio play error:", e));
              } catch (e) {
                console.error("Error playing tackle sound:", e);
              }
            }
          } 
          // Fallback behavior if target not found
          else if (aiState.current.lastTargetPos) {
            // Move to last known position
            const dirX = aiState.current.lastTargetPos.x - currentPos.x;
            const dirZ = aiState.current.lastTargetPos.z - currentPos.z;
            
            // Normalize direction
            const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
            
            if (length > 0) {
              moveDirection.current.set(dirX / length, 0, dirZ / length);
              targetSpeed.current = defensiveSpeed * 0.8; // Use 80% of defensive speed for fallback
              targetRotationRef.current = Math.atan2(dirX, dirZ);
            }
          }
        }
      }
    } else {
      // When play not active
      targetSpeed.current = 0;
      
      // Reset collision state
      if (hasCollidedWithOffense) {
        setHasCollidedWithOffense(false);
      }
    }
    
    // =============================================
    // PHYSICS UPDATE
    // =============================================
    
    // Smoothly adjust actual speed toward target speed
    if (targetSpeed.current > currentSpeed.current) {
      // Accelerating
      currentSpeed.current = Math.min(
        currentSpeed.current + accelerationRate * delta * 60,
        targetSpeed.current
      );
    } else if (targetSpeed.current < currentSpeed.current) {
      // Decelerating
      currentSpeed.current = Math.max(
        currentSpeed.current - decelerationRate * delta * 60,
        targetSpeed.current
      );
    }
    
    // Calculate final velocity
    velocity = {
      x: moveDirection.current.x * currentSpeed.current,
      y: currentVel.y, // Maintain current Y velocity for jumps
      z: moveDirection.current.z * currentSpeed.current
    };
    
    // Apply damping to slow down naturally
    const dampingFactor = damping * delta * 60;
    if (targetSpeed.current === 0) {
      velocity.x = currentVel.x * (1 - dampingFactor);
      velocity.z = currentVel.z * (1 - dampingFactor);
    }
    
    // Set final velocity on physics body
    bodyRef.current.setLinvel(velocity);
    
    // Apply custom damping (more precise than RigidBody's built-in dampingLinear)
    if (Math.abs(currentVel.x) < 0.01 && Math.abs(currentVel.z) < 0.01) {
      // If nearly stopped, fully stop to prevent micro-movements
      if (targetSpeed.current === 0) {
        bodyRef.current.setLinvel({ x: 0, y: currentVel.y, z: 0 });
      }
    }
    
    // =============================================
    // VISUAL UPDATES
    // =============================================
    
    // Update player movement state
    const isMoving = Math.abs(currentVel.x) > 0.5 || Math.abs(currentVel.z) > 0.5;
    if (isMoving !== isActuallyMoving) {
      setIsActuallyMoving(isMoving);
    }
    
    // Smooth rotation interpolation for the visual model
    if (isMoving && visualRef.current) {
      // Smoothly interpolate toward target rotation
      rotationRef.current = THREE.MathUtils.lerp(
        rotationRef.current,
        targetRotationRef.current,
        turnSpeed * delta * 60
      );
    }
    
    // Update position and rotation in store
    if (currentPos.x > -50 && currentPos.x < 50 && currentPos.z > -100 && currentPos.z < 100) {
      actions.updatePlayerPosition(id, currentPos, rotationRef.current);
    }
  });
  
  // Handle wall collisions with physics response
  const handleWallCollision = (position, velocity) => {
    if (!bodyRef.current) return;
    
    // Field boundaries (slightly inside the actual walls)
    const fieldWidth = 98;
    const fieldLength = 198;
    
    // Bounce factor (higher = bouncier)
    const bounceFactor = 0.8;
    
    // Check walls and apply bounce effect
    const newVelocity = { ...velocity };
    let didBounce = false;
    
    // Left wall
    if (position.x < -fieldWidth/2) {
      newVelocity.x = Math.abs(velocity.x) * bounceFactor; // Bounce right
      didBounce = true;
      
      // Ensure player stays within bounds
      bodyRef.current.setTranslation({
        x: -fieldWidth/2 + 0.5, // Move slightly inside the field
        y: position.y,
        z: position.z
      });
    }
    // Right wall
    else if (position.x > fieldWidth/2) {
      newVelocity.x = -Math.abs(velocity.x) * bounceFactor; // Bounce left
      didBounce = true;
      
      // Ensure player stays within bounds
      bodyRef.current.setTranslation({
        x: fieldWidth/2 - 0.5, // Move slightly inside the field
        y: position.y,
        z: position.z
      });
    }
    
    // Back wall (end zone 1)
    if (position.z < -fieldLength/2) {
      newVelocity.z = Math.abs(velocity.z) * bounceFactor; // Bounce forward
      didBounce = true;
      
      // Ensure player stays within bounds
      bodyRef.current.setTranslation({
        x: position.x,
        y: position.y,
        z: -fieldLength/2 + 0.5 // Move slightly inside the field
      });
    }
    // Front wall (end zone 2)
    else if (position.z > fieldLength/2) {
      newVelocity.z = -Math.abs(velocity.z) * bounceFactor; // Bounce backward
      didBounce = true;
      
      // Ensure player stays within bounds
      bodyRef.current.setTranslation({
        x: position.x,
        y: position.y,
        z: fieldLength/2 - 0.5 // Move slightly inside the field
      });
    }
    
    // Apply bounce effect if we hit a wall
    if (didBounce) {
      bodyRef.current.setLinvel(newVelocity);
      
      // Add some upward force for a jump effect on strong collisions
      if (velocity.length() > 8) {
        bodyRef.current.applyImpulse({ x: 0, y: 5, z: 0 });
        
        // Add rage points for wall hits
        actions.addRagePoints(5);
        
        // Play wall hit sound if available
        try {
          const audio = new Audio(`/sounds/wall_hit.mp3`);
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio play error:", e));
        } catch (e) {
          // Silently fail if sound doesn't exist
        }
      }
    }
  };
  
  // Ground collision detection
  const handleCollisionStart = (event) => {
    const { other } = event;
    // Check if collision is with the ground
    if (other.rigidBodyObject && other.rigidBodyObject.name === 'ground') {
      setIsGrounded(true);
    }
  };
  
  const handleCollisionEnd = (event) => {
    const { other } = event;
    // Check if leaving the ground
    if (other.rigidBodyObject && other.rigidBodyObject.name === 'ground') {
      setIsGrounded(false);
    }
  };
  
  return (
    <RigidBody 
      ref={bodyRef} 
      colliders={false} 
      mass={1}
      lockRotations
      position={position}
      enabledRotations={[false, false, false]}
      restitution={0.2} // Add some bounciness to player collisions
      friction={0.2}    // Low friction for smooth movement
      linearDamping={0.2} // Base physics damping (we add more in code)
      onCollisionEnter={handleCollisionStart}
      onCollisionExit={handleCollisionEnd}
      name={id}
    >
      <CuboidCollider args={[0.25, 0.7, 0.25]} />
      <group ref={visualRef} rotation={[0, rotationRef.current, 0]}>
        <KennyPlayer 
          scale={[1.2, 1.2, 1.2]} 
          isMoving={isActuallyMoving}
          modelIndex={teamType}
        />
        
        {/* Optional: Add visual indicator for sprint/stamina */}
        {isSprinting && isMainPlayer && (
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ffff00" toneMapped={false} />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
};