import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';
import { RigidBody } from '@react-three/rapier';

// List of available Kenny character models
const CHARACTER_MODELS = [
  '/models/characters/character-male-a.glb',  // Blue jersey
  '/models/characters/character-male-b.glb',  // Red jersey
  '/models/characters/character-male-c.glb',  // Green jersey
  '/models/characters/character-male-d.glb',  // Yellow jersey
];

// Team constants for easy referencing
export const TEAM = {
  OFFENSE: 0,  // Index for offense team (Blue - character-male-a)
  DEFENSE: 1,  // Index for defense team (Red - character-male-b)
};

export const KennyPlayer = React.forwardRef(({ 
  isMoving = false, 
  direction = 0, 
  scale = [1, 1, 1],
  modelIndex = 0   // Default to first model (blue)
}, ref) => {
  // Ensure model index is valid
  const safeModelIndex = Math.min(Math.max(0, modelIndex), CHARACTER_MODELS.length - 1);
  const modelPath = CHARACTER_MODELS[safeModelIndex];
  
  // Load specified model
  const { scene, animations } = useGLTF(modelPath);
  const modelRef = useRef();
  const mixerRef = useRef();
  const actionsRef = useRef({});
  const [currentAnimation, setCurrentAnimation] = useState('idle');

  useEffect(() => {
    if (scene && animations.length > 0) {
      // Create animation mixer
      mixerRef.current = new THREE.AnimationMixer(scene);
      
      // Create actions for each animation
      animations.forEach((clip) => {
        const action = mixerRef.current.clipAction(clip);
        actionsRef.current[clip.name] = action;
      });

      // Set up initial animation
      if (actionsRef.current['idle']) {
        actionsRef.current['idle'].play();
      }
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [scene, animations]);

  // Update animation state when movement changes
  useEffect(() => {
    // Only animate when actually moving
    const animationState = isMoving ? 'walk' : 'idle';
    if (currentAnimation !== animationState) {
      setCurrentAnimation(animationState);
    }
  }, [isMoving, currentAnimation]);

  useFrame((state, delta) => {
    // Only update animation mixer when player is moving or transitioning
    if (mixerRef.current && isMoving) {
      mixerRef.current.update(delta);
    }

    // Update animations based on movement state
    if (actionsRef.current) {
      if (isMoving && actionsRef.current['walk']) {
        // Play walk animation when moving
        if (!actionsRef.current['walk'].isRunning()) {
          // Stop all other animations
          Object.values(actionsRef.current).forEach(action => {
            if (action.isRunning()) action.stop();
          });
          
          // Start walk animation
          actionsRef.current['walk'].reset().fadeIn(0.2).play();
        }
      } else if (!isMoving) {
        // Stop all animations when not moving
        Object.values(actionsRef.current).forEach(action => {
          if (action.isRunning()) action.stop();
        });
      }
    }

    // Smoothly rotate the model to face the direction of movement
    if (modelRef.current && direction !== 0) {
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        direction,
        0.1
      );
    }
  });

  return (
    <group ref={ref} scale={scale}>
      <primitive ref={modelRef} object={scene} />
    </group>
  );
});

// Preload all Kenny character models for use in the game
CHARACTER_MODELS.forEach(path => {
  useGLTF.preload(path);
});