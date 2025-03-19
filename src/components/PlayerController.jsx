import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import { useStore } from './store';
import { Controls } from '../App';
import { KennyPlayer } from './models/characters/KennyPlayer';
import * as THREE from 'three';

export const PlayerController = ({ id, isMainPlayer = false }) => {
  const bodyRef = useRef();
  const [isGrounded, setIsGrounded] = useState(true);
  // Player is only considered moving if they have actual velocity (not just keys pressed)
  const [isActuallyMoving, setIsActuallyMoving] = useState(false);
  const { gamePaused, actions } = useStore();
  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  
  // Get keyboard controls
  const upPressed = useKeyboardControls((state) => state[Controls.up]);
  const downPressed = useKeyboardControls((state) => state[Controls.down]);
  const leftPressed = useKeyboardControls((state) => state[Controls.left]);
  const rightPressed = useKeyboardControls((state) => state[Controls.right]);
  
  useEffect(() => {
    // Register player with store
    if (bodyRef.current) {
      actions.addPlayer({
        id,
        ref: bodyRef,
        position: bodyRef.current.translation()
      });
      
      return () => {
        actions.removePlayer(id);
      };
    }
  }, [id, actions]);

  useFrame((state, delta) => {
    // Skip physics updates when game is paused
    if (!bodyRef.current || !isMainPlayer || gamePaused) return;
    
    // Create velocity vector based on world coordinates
    const velocity = { x: 0, y: 0, z: 0 };
    const speed = 5;
    
    // Determine movement direction
    let movingForward = false;
    let movingBackward = false;
    let movingLeft = false;
    let movingRight = false;
    
    // Calculate movement direction - in fixed world coordinate system
    // Up = -Z direction (forward)
    // Down = +Z direction (backward)
    // Left = -X direction
    // Right = +X direction
    if (upPressed) {
      velocity.z -= speed;
      movingForward = true;
      targetRotationRef.current = Math.PI;  // Rotate to face -Z (forward)
    }
    if (downPressed) {
      velocity.z += speed;
      movingBackward = true;
      targetRotationRef.current = 0;  // Rotate to face +Z (backward)
    }
    // Swapped left and right controls to fix inversion
    if (leftPressed) {
      velocity.x -= speed;
      movingLeft = true;
      targetRotationRef.current = -Math.PI / 2;  // Rotate to face -X (corrected)
    }
    if (rightPressed) {
      velocity.x += speed;
      movingRight = true;
      targetRotationRef.current = Math.PI / 2;  // Rotate to face +X (corrected)
    }
    
    // Handle diagonal movement with proper rotations (adjusted for corrected left/right)
    if (movingForward && movingLeft) targetRotationRef.current = Math.PI * 1.25;  // -Z, -X
    if (movingForward && movingRight) targetRotationRef.current = Math.PI * 0.75; // -Z, +X
    if (movingBackward && movingLeft) targetRotationRef.current = -Math.PI * 0.25; // +Z, -X
    if (movingBackward && movingRight) targetRotationRef.current = Math.PI * 0.25; // +Z, +X
    
    // Apply movement directly using world coordinates
    bodyRef.current.setLinvel(velocity);
    
    // Get current velocity from the physics body
    const currentVel = bodyRef.current.linvel();
    
    // Check if player is actually moving based on current velocity
    // Use a small threshold to detect actual movement
    const isPlayerMoving = Math.abs(currentVel.x) > 0.5 || Math.abs(currentVel.z) > 0.5;
    
    // Update movement state (only when it changes to avoid unnecessary re-renders)
    if (isPlayerMoving !== isActuallyMoving) {
      setIsActuallyMoving(isPlayerMoving);
    }
    
    // Smoothly interpolate rotation of the player model
    if (isPlayerMoving) {
      rotationRef.current = THREE.MathUtils.lerp(
        rotationRef.current,
        targetRotationRef.current,
        0.1 * delta * 60
      );
    }
    
    // Update player position and rotation in store
    const position = bodyRef.current.translation();
    actions.updatePlayerPosition(id, position, rotationRef.current);
  });

  // Cleanup isActuallyMoving when component unmounts
  useEffect(() => {
    return () => {
      setIsActuallyMoving(false);
    };
  }, []);

  return (
    <RigidBody 
      ref={bodyRef} 
      colliders={false} 
      mass={1}
      lockRotations
      position={[0, 1, 0]}
      enabledRotations={[false, false, false]}
    >
      <CuboidCollider args={[0.5, 1, 0.5]} />
      <group rotation={[0, rotationRef.current, 0]}>
        <KennyPlayer 
          scale={[1, 1, 1]} 
          isMoving={isActuallyMoving}
        />
      </group>
    </RigidBody>
  );
};