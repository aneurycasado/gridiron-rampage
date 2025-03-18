import React, { useRef, useEffect, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { RigidBody } from '@react-three/rapier';

export const Football = forwardRef(({ id, position = [0, 1, 0], rotation = 0, ...props }, ref) => {
  const meshRef = useRef();
  const bodyRef = useRef();
  const { actions } = useStore();
  
  // Football physics properties
  const velocity = useRef({ x: 0, y: 0, z: 0 });
  const isThrown = useRef(false);
  const throwForce = useRef(0);
  const throwAngle = useRef(0);
  const throwHeight = useRef(0);
  const isFalling = useRef(false);
  const ownerRef = useRef(null);
  const gravity = 9.8;
  
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
      actions.removeFootball(id);
    };
  }, [id, actions]);
  
  // Create and apply textures for football
  useEffect(() => {
    // Create football texture
    const textureLoader = new THREE.TextureLoader();
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
        bodyRef.current.setTranslation({
          x: owner.position.x + 0.5, // Offset to position in hand
          y: owner.position.y + 1.2,
          z: owner.position.z - 0.3
        });
        
        // Match rotation with player
        bodyRef.current.setRotation({
          x: 0,
          y: owner.rotation.y,
          z: 0
        });
      }
    }
    
    // Add slight idle animation when not thrown
    if (!isThrown.current && !ownerRef.current) {
      const currentPosition = bodyRef.current.translation();
      bodyRef.current.setTranslation({
        x: currentPosition.x,
        y: 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05,
        z: currentPosition.z
      });
      
      // Slow rotation
      const currentRotation = bodyRef.current.rotation();
      bodyRef.current.setRotation({
        x: currentRotation.x,
        y: currentRotation.y + delta * 0.5,
        z: currentRotation.z
      });
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

  return (
    <RigidBody ref={bodyRef} position={position}>
      <group>
        {/* Football mesh - using elongated sphere for football shape */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[0.15, 32, 16]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.2} />
        </mesh>
        
        {/* White laces */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.01, 0.1, 0.005]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.01, 0.1, 0.005]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Scale to make the football elongated */}
        <group scale={[1, 0.7, 1.8]}>
          {/* We scale the group containing the ball to create proper football shape */}
        </group>
      </group>
    </RigidBody>
  );
});