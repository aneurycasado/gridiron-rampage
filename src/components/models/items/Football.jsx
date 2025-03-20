import React, { useRef, useEffect, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayController, PossessionController } from '../../../controllers';
import { RigidBody } from '@react-three/rapier';

// Football is modified to take on a more realistic shape and appearance
export const Football = forwardRef(({ id, position = [0, 1, 0], rotation = 0, ...props }, ref) => {
  const meshRef = useRef();
  const bodyRef = useRef();
  const actions = PlayController.getState().actions;
  
  // Football physics properties
  const velocity = useRef({ x: 0, y: 0, z: 0 });
  const isThrown = useRef(false);
  const throwForce = useRef(0);
  const throwAngle = useRef(0);
  const throwHeight = useRef(0);
  const isFalling = useRef(false);
  const ownerRef = useRef(null);
  const gravity = 9.8;
  
  // Create football geometry with more realistic proportions
  const footballGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.15, 32, 16);
  }, []);
  
  // Add football to the store when component mounts
  useEffect(() => {
    // Register the football with the store only once on mount
    console.log(`Registering football with ID: ${id}`);
    const footballData = { 
      id, 
      ref: bodyRef,
      position,
      isThrown: false,
      ownerId: null
    };
    actions.addFootball(footballData);
    
    return () => {
      console.log(`Removing football with ID: ${id}`);
      // Using setTimeout to avoid React state update issues during unmounting
      setTimeout(() => {
        actions.removeFootball(id);
      }, 0);
    };
  }, [id, actions]);
  
  // Create and apply textures for football
  useEffect(() => {
    // Create football texture
    const leatherTexture = new THREE.MeshStandardMaterial({
      color: '#8B4513',
      roughness: 0.8,
      metalness: 0.2,
    });
    
    // Apply texture to the football mesh
    if (meshRef.current) {
      meshRef.current.material = leatherTexture;
    }
  }, []);
  
  // Handle football physics
  useFrame((state, delta) => {
    if (!bodyRef.current) return;
    
    // Limit delta to prevent large jumps
    if (delta > 0.1) delta = 0.1;
    
    // Get play state and players from store
    const { playActive, playEnded, players } = PlayController.getState();
    
    // When play starts or is active, ensure ball is attached to offensive player if not thrown
    if (playActive && !isThrown.current) {
      // Find offensive player
      const offensivePlayer = players.find(p => p.id === "player-offense");
      if (offensivePlayer) {
        // Attach ball to offensive player, ensuring it stays attached
        attachToPlayer(offensivePlayer);
      }
    }
    
    // If football is thrown
    if (isThrown.current) {
      // Apply gravity
      velocity.current.y -= gravity * delta;
      
      // Update position
      const currentPosition = bodyRef.current.translation();
      bodyRef.current.setTranslation({
        x: currentPosition.x + velocity.current.x * delta,
        y: currentPosition.y + velocity.current.y * delta,
        z: currentPosition.z + velocity.current.z * delta
      });
      
      // Rotate football for realism
      const currentRotation = bodyRef.current.rotation();
      bodyRef.current.setRotation({
        x: currentRotation.x + 10 * delta,
        y: currentRotation.y,
        z: currentRotation.z
      });
      
      // Check if football hit the ground
      if (currentPosition.y <= 0.5) {
        bodyRef.current.setTranslation({
          x: currentPosition.x,
          y: 0.5,
          z: currentPosition.z
        });
        
        // Bounce with energy loss
        if (Math.abs(velocity.current.y) > 1) {
          velocity.current.y = -velocity.current.y * 0.6;
          
          // Reduce horizontal velocity due to friction
          velocity.current.x *= 0.8;
          velocity.current.z *= 0.8;
        } else {
          // Stop bouncing if velocity is low
          velocity.current.y = 0;
          velocity.current.x *= 0.95;
          velocity.current.z *= 0.95;
          
          // Stop the throw if ball almost stopped
          if (
            Math.abs(velocity.current.x) < 0.1 && 
            Math.abs(velocity.current.z) < 0.1
          ) {
            isThrown.current = false;
            actions.setFootballStatus({
              id,
              isThrown: false,
              position: [
                currentPosition.x,
                currentPosition.y,
                currentPosition.z
              ]
            });
          }
        }
      }
      
      // Update football status in store
      actions.updateFootballPosition({
        id, 
        position: [
          currentPosition.x,
          currentPosition.y,
          currentPosition.z
        ]
      });
    } 
    // If football is attached to a player
    else if (ownerRef.current) {
      // Position the ball next to the player's hand
      const owner = ownerRef.current;
      
      if (owner && owner.position) {
        // Position football directly in front of the player
        // Calculate offset based on player rotation
        const rotationY = owner.rotation || 0;
        
        // Always place ball directly in front of player regardless of rotation
        // Use consistent negative Z offset to ensure ball is in front
        
        // Calculate fixed-position target in front of player by using their rotation
        // Use a reduced offset to keep the ball closer to the player
        const offsetX = Math.sin(rotationY) * 0.4; // Reduced X offset for closer positioning
        const offsetZ = Math.cos(rotationY) * 0.4; // Reduced Z offset for closer positioning
        
        // Calculate the position directly in front of the player based on their facing direction
        const frontX = owner.position.x + offsetX;
        const frontY = owner.position.y + 0.6; // Slightly lower for better visibility
        const frontZ = owner.position.z - offsetZ; // Important: negative to be in front
        
        // Set the ball position directly - reduce interpolation for more direct control
        bodyRef.current.setTranslation({
          x: frontX,
          y: frontY,
          z: frontZ
        });
        
        // Angle the ball forward in a running carry position
        bodyRef.current.setRotation({
          x: Math.PI / 3, // Angled forward for running position
          y: rotationY,   // Match player's rotation
          z: 0
        });
        
        // Update position in store for camera tracking - use actual ball position
        // rather than target position to ensure camera follows actual ball
        const actualPos = bodyRef.current.translation();
        actions.updateFootballPosition({
          id, 
          position: [actualPos.x, actualPos.y, actualPos.z]
        });
      }
    }
    
    // When play is not active (or ended), reset the ball position and ownership
    if ((!playActive || playEnded)) {
      // Get the latest downs state to position ball correctly
      const possessionState = PossessionController.getState();
      
      // Calculate the Z position based on the line of scrimmage (convert yard line to 3D space)
      // The field is 200 units long (-100 to +100 in Z), so we need to convert yard lines (0-100) to this space
      const ballZPosition = -((possessionState.position / 100) * 200) + 100;
      
      // Calculate the ball direction based on possession
      // If defense has possession, ball should face the opposite direction
      const ballYRotation = possessionState.possession === "offense" ? 0 : Math.PI;
      
      // Reset ball position to current line of scrimmage
      bodyRef.current.setTranslation({
        x: 0, // Reset X position to center
        y: 0.15, // Lower to ground level
        z: ballZPosition // Position at the current line of scrimmage
      });
      
      // Rotate to lie flat with proper direction
      bodyRef.current.setRotation({
        x: Math.PI / 2, // Lay flat on the ground
        y: ballYRotation, // Rotate based on possession direction
        z: 0
      });
      
      // If play ended or not active, release the ball
      isThrown.current = false;
      ownerRef.current = null;
      
      // Update store about ball status
      actions.setFootballStatus({
        id,
        isThrown: false,
        ownerId: null,
        position: [0, 0.15, ballZPosition]
      });
      
      console.log(`Football reset at position: ${ballZPosition}, possession: ${possessionState.possession}`);
    }
  });

  // Method to throw the football
  const throwBall = (direction, force, height) => {
    isThrown.current = true;
    ownerRef.current = null;
    
    // Set initial velocity based on throw parameters
    velocity.current.x = direction.x * force;
    velocity.current.z = direction.z * force;
    velocity.current.y = height;
    
    // Update store with throw status
    actions.setFootballStatus({
      id,
      isThrown: true,
      ownerId: null
    });
  };
  
  // Method to attach football to player
  const attachToPlayer = (player) => {
    isThrown.current = false;
    ownerRef.current = player;
    
    // Reset velocity
    velocity.current = { x: 0, y: 0, z: 0 };
    
    // Update store with new owner
    actions.setFootballStatus({
      id,
      isThrown: false,
      ownerId: player.id
    });
  };
  
  // Expose methods to parent components
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.throwBall = throwBall;
      bodyRef.current.attachToPlayer = attachToPlayer;
    }
  }, []);
  
  // Subscribe to the PlayController to update actions when needed
  useEffect(() => {
    const unsubscribe = PlayController.subscribe(() => {
      // Update the actions reference when the store changes
      const newActions = PlayController.getState().actions;
      actions = newActions;
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <RigidBody ref={bodyRef} position={position} rotation={[Math.PI / 2, 0, 0]} type="dynamic">
      <group scale={[1, 0.6, 2]}>
        {/* Football mesh - using scaled sphere for football shape */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[0.15, 32, 16]} />
          <meshStandardMaterial color="#613613" roughness={0.8} metalness={0.2} />
        </mesh>
        
        {/* White laces */}
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0]} scale={[1, 1, 0.5]}>
          <boxGeometry args={[0.05, 0.01, 0.15]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[0, 0, 0]} scale={[1, 1, 0.5]}>
          <boxGeometry args={[0.05, 0.01, 0.15]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.04, 0]} rotation={[0, 0, 0]} scale={[1, 1, 0.5]}>
          <boxGeometry args={[0.05, 0.01, 0.15]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]} scale={[1, 1, 0.5]}>
          <boxGeometry args={[0.05, 0.01, 0.15]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </RigidBody>
  );
});