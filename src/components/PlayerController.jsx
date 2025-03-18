import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import { useStore } from './store';
import { Controls } from '../App';
import { KennyPlayer } from './models/characters/KennyPlayer';

export const PlayerController = ({ id, isMainPlayer = false }) => {
  const bodyRef = useRef();
  const [isGrounded, setIsGrounded] = useState(true);
  const { actions } = useStore();
  
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

  useFrame(() => {
    if (!bodyRef.current || !isMainPlayer) return;
    
    const velocity = { x: 0, y: 0, z: 0 };
    const speed = 5;
    
    // Basic movement
    if (upPressed) velocity.z -= speed;
    if (downPressed) velocity.z += speed;
    if (leftPressed) velocity.x -= speed;
    if (rightPressed) velocity.x += speed;
    
    // Apply movement
    bodyRef.current.setLinvel(velocity);
    
    // Update player position in store
    const position = bodyRef.current.translation();
    actions.updatePlayerPosition(id, position);
  });

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
      <KennyPlayer 
        scale={[1, 1, 1]} 
        isMoving={upPressed || downPressed || leftPressed || rightPressed}
      />
    </RigidBody>
  );
};