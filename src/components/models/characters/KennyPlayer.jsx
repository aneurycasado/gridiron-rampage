import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';
import { RigidBody } from '@react-three/rapier';

// List of available Kenny character models
const CHARACTER_MODELS = [
  '/models/characters/character-male-a.glb',
  '/models/characters/character-male-b.glb',
  '/models/characters/character-male-c.glb',
  '/models/characters/character-male-d.glb',
];

// Select a default model
const DEFAULT_MODEL = CHARACTER_MODELS[0];

export const KennyPlayer = React.forwardRef(({ isMoving = false, scale = [1, 1, 1] }, ref) => {
  const { scene, animations } = useGLTF(DEFAULT_MODEL);
  const modelRef = useRef();
  const mixerRef = useRef();
  const actionsRef = useRef({});

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

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Update animations based on movement
    if (actionsRef.current) {
      const currentAction = isMoving ? 'walk' : 'idle';
      Object.entries(actionsRef.current).forEach(([name, action]) => {
        if (name === currentAction && !action.isRunning()) {
          action.reset().fadeIn(0.2).play();
        } else if (name !== currentAction && action.isRunning()) {
          action.fadeOut(0.2);
        }
      });
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