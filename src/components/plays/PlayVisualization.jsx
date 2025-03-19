import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { formationToFieldPosition } from './Formations';
import { generatePlayRoutes } from './Routes';
import { useStore } from '../store';
import { Html } from '@react-three/drei';

// Creates visual representation of a play on the field
export const PlayVisualization = ({ play, active = false }) => {
  const routeRefs = useRef({});
  const { downs } = useStore();
  
  // Calculate line of scrimmage in 3D space
  const lineOfScrimmageZ = useMemo(() => {
    return -((downs.position / 100) * 200) + 100;
  }, [downs.position]);
  
  // Process formation and routes
  const formationAndRoutes = useMemo(() => {
    if (!play) return { positions: [], routes: {} };
    
    // Determine if we need to flip the formation based on possession
    const flipFormation = downs.possession !== "offense";
    
    // Convert formation to absolute field position
    const positions = formationToFieldPosition(
      play.formation, 
      lineOfScrimmageZ, 
      flipFormation
    );
    
    // Generate routes for visualization
    const routes = generatePlayRoutes(play.formation, play.routes);
    
    return { positions, routes };
  }, [play, lineOfScrimmageZ, downs.possession]);
  
  // Animation for routes
  useFrame((state, delta) => {
    if (!active || !play) return;
    
    // Animate route visualization
    const time = state.clock.getElapsedTime();
    
    // Make routes "grow" over time when play is active
    Object.entries(routeRefs.current).forEach(([playerId, ref]) => {
      if (ref) {
        // Calculate progress based on time
        const progress = Math.min(1, time / 2); // Complete in 2 seconds
        
        // Only show part of the route up to current progress
        ref.dashOffset = 1 - progress;
      }
    });
  });
  
  if (!play) return null;
  
  return (
    <group>
      {/* Formation player positions */}
      {formationAndRoutes.positions.map((player) => (
        <PlayerMarker
          key={player.id}
          position={player.coordinates}
          role={player.role}
          isOffense={play.type !== "blitz" && play.type !== "zone" && play.type !== "man"}
        />
      ))}
      
      {/* Route visualization */}
      {active && Object.entries(formationAndRoutes.routes).map(([playerId, route]) => {
        if (!route || !route.curve) return null;
        
        // Generate points along curve
        const points = route.getPoints(20);
        
        return (
          <RouteVisualization
            key={`route-${playerId}`}
            points={points}
            color={route.color}
            ref={(el) => routeRefs.current[playerId] = el}
          />
        );
      })}
    </group>
  );
};

// Player position marker on the field
const PlayerMarker = ({ position, role, isOffense }) => {
  // Different colors for different player types
  const getMarkerColor = () => {
    if (isOffense) {
      // Offensive roles
      if (role === 'QB') return '#ff0000'; // Red for QB
      if (role === 'RB' || role === 'FB') return '#ff8800'; // Orange for backs
      if (role === 'WR' || role === 'TE') return '#00ff00'; // Green for receivers
      return '#ffffff'; // White for linemen
    } else {
      // Defensive roles
      if (role === 'DL') return '#ff8800'; // Orange for D-line
      if (role === 'LB') return '#ff0000'; // Red for linebackers
      if (role === 'CB' || role === 'S') return '#00ff00'; // Green for secondary
      return '#ffffff'; // White for others
    }
  };
  
  const color = getMarkerColor();
  
  return (
    <group position={position}>
      {/* Player dot */}
      <mesh position={[0, 0.1, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Role label */}
      <Billboard position={[0, 1, 0]}>
        <HtmlLabel color={color}>
          {role}
        </HtmlLabel>
      </Billboard>
    </group>
  );
};

// Helper component to display HTML text that always faces camera
const HtmlLabel = ({ children, color = 'white' }) => {
  return (
    <Html
      center
      distanceFactor={10}
      occlude
      style={{
        color,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '2px 5px',
        borderRadius: '3px',
        userSelect: 'none',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}
    >
      {children}
    </Html>
  );
};

// Helper component to display text that always faces camera
const Billboard = ({ children, ...props }) => {
  const ref = useRef();
  
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
  });
  
  return <group ref={ref} {...props}>{children}</group>;
};

// Route visualization as a tube
const RouteVisualization = React.forwardRef(({ points, color }, ref) => {
  return (
    <mesh>
      <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 64, 0.1, 8, false]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
});

export default PlayVisualization;