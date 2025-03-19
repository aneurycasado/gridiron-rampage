import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';

// Define model paths
const MODEL_PATH_BLUE = '/models/characters/character-male-a.glb';
const MODEL_PATH_RED = '/models/characters/character-male-b.glb';

// Team constants for easy referencing
export const TEAM = {
  OFFENSE: 0,
  DEFENSE: 1,
};

// Role-based model assignment - simplified for reliability
export const getRoleBasedModelIndex = (role, teamType) => {
  // Just use team type for now - simplified approach
  return teamType === TEAM.OFFENSE ? TEAM.OFFENSE : TEAM.DEFENSE;
};

// Simple debug label
const DebugLabel = ({ role, teamType, enabled = true }) => {
  if (!enabled) return null;
  
  return (
    <Html
      position={[0, 2.3, 0]}
      center
      distanceFactor={10}
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '1px 4px',
        borderRadius: '2px',
        fontSize: '8px',
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      {role} - {teamType === TEAM.OFFENSE ? 'OFF' : 'DEF'}
    </Html>
  );
};

// Load models in advance - outside of component
// This ensures they're only loaded once
const blueModel = { loaded: false };
const redModel = { loaded: false };

try {
  console.log("Preloading offensive player model:", MODEL_PATH_BLUE);
  useGLTF.preload(MODEL_PATH_BLUE);
  blueModel.loaded = true;
} catch (error) {
  console.error("Failed to preload offensive model:", error);
}

try {
  console.log("Preloading defensive player model:", MODEL_PATH_RED);
  useGLTF.preload(MODEL_PATH_RED);
  redModel.loaded = true;
} catch (error) {
  console.error("Failed to preload defensive model:", error);
}

// Main player component
export const KennyPlayer = React.forwardRef(({ 
  isMoving = false, 
  direction = 0, 
  scale = [1, 1, 1],
  modelIndex = TEAM.OFFENSE,
  role = 'PLAYER'
}, ref) => {
  // Direct model path based on team
  const modelPath = modelIndex === TEAM.OFFENSE ? MODEL_PATH_BLUE : MODEL_PATH_RED;
  
  // Setup refs and state
  const modelRef = useRef();
  const actionsRef = useRef({});
  const mixerRef = useRef(null);
  const [modelError, setModelError] = useState(false);
  
  // Use memoized model loading to prevent unnecessary reloads
  const { scene, animations } = useMemo(() => {
    try {
      console.log(`Loading model: ${modelPath} for ${role}`);
      const gltf = useGLTF(modelPath);
      
      // Clone the scene to avoid shared materials issues
      const sceneClone = gltf.scene.clone(true);
      
      console.log(`Model loaded successfully: ${modelPath} (${gltf.animations.length} animations)`);
      return { 
        scene: sceneClone, 
        animations: gltf.animations 
      };
    } catch (error) {
      console.error(`Failed to load model: ${modelPath}`, error);
      setModelError(true);
      return { scene: null, animations: [] };
    }
  }, [modelPath]);
  
  // Initialize animations
  useEffect(() => {
    if (!scene || !animations || animations.length === 0 || modelError) return;
    
    try {
      // Create a new animation mixer for this instance
      const mixer = new THREE.AnimationMixer(scene);
      mixerRef.current = mixer;
      
      // Extract actions for idle and walk
      let hasIdle = false;
      let hasWalk = false;
      
      animations.forEach(clip => {
        try {
          const action = mixer.clipAction(clip);
          
          if (clip.name === 'idle') {
            actionsRef.current.idle = action;
            hasIdle = true;
          } else if (clip.name === 'walk') {
            actionsRef.current.walk = action;
            hasWalk = true;
          } else {
            // Store other animations just in case
            actionsRef.current[clip.name] = action;
          }
        } catch (e) {
          console.warn(`Failed to setup animation: ${clip.name}`, e);
        }
      });
      
      console.log(`Player ${role} animations: idle=${hasIdle}, walk=${hasWalk}`);
      
      // Start idle animation by default
      if (hasIdle) {
        actionsRef.current.idle.play();
      } else if (hasWalk) {
        // Fall back to walk if idle not available
        actionsRef.current.walk.play();
      } else if (animations.length > 0) {
        // Last resort: use any available animation
        const firstAction = mixer.clipAction(animations[0]);
        firstAction.play();
      }
    } catch (error) {
      console.error("Animation setup failed:", error);
      setModelError(true);
    }
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [scene, animations, modelError, role]);
  
  // Handle animation updates
  useFrame((state, delta) => {
    if (modelError || !mixerRef.current) return;
    
    try {
      // Always update the mixer to ensure animations play
      mixerRef.current.update(delta);
      
      // Update model rotation to match direction
      if (modelRef.current && direction !== undefined) {
        modelRef.current.rotation.y = THREE.MathUtils.lerp(
          modelRef.current.rotation.y,
          direction,
          0.1
        );
      }
      
      // Handle animation transitions
      if (actionsRef.current.idle && actionsRef.current.walk) {
        if (isMoving && !actionsRef.current.walk.isRunning()) {
          // Switch to walk animation
          actionsRef.current.idle.fadeOut(0.2);
          actionsRef.current.walk.reset().fadeIn(0.2).play();
        } else if (!isMoving && !actionsRef.current.idle.isRunning()) {
          // Switch to idle animation
          actionsRef.current.walk.fadeOut(0.2);
          actionsRef.current.idle.reset().fadeIn(0.2).play();
        }
      }
    } catch (e) {
      console.error("Animation frame error:", e);
    }
  });
  
  // Get team color
  const getTeamColor = () => {
    return modelIndex === TEAM.OFFENSE ? '#2277ff' : '#ff3333';
  };
  
  // Used for debugging - enable in development
  const showDebugInfo = import.meta.env.DEV;
  
  return (
    <group ref={ref} scale={scale}>
      {scene && !modelError ? (
        // Render actual 3D model when available
        <group>
          <primitive 
            ref={modelRef} 
            object={scene} 
            dispose={null} 
          />
          
          {/* Position indicator */}
          <mesh position={[0, 1.8, 0]} scale={0.08}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={getTeamColor()} />
          </mesh>
          
          {/* Debug label */}
          {showDebugInfo && (
            <DebugLabel 
              role={role} 
              teamType={modelIndex} 
            />
          )}
        </group>
      ) : (
        // Fallback shape when model fails to load
        <group>
          {/* Basic player shape */}
          <mesh>
            <capsuleGeometry args={[0.25, 1, 4, 8]} />
            <meshStandardMaterial 
              color={modelIndex === TEAM.OFFENSE ? '#0066cc' : '#cc0000'} 
            />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#ffcc99" />
          </mesh>
          
          {/* Position indicator */}
          <mesh position={[0, 1.8, 0]} scale={0.1}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={getTeamColor()} />
          </mesh>
          
          {/* Debug label */}
          {showDebugInfo && (
            <DebugLabel 
              role={role} 
              teamType={modelIndex} 
            />
          )}
        </group>
      )}
    </group>
  );
});

// Ensure immediate preloading execution
console.log("Initializing KennyPlayer models...");