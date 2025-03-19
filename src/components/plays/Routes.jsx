import * as THREE from 'three';
import { createRoute } from './PlayBook';

// Common route patterns used in football plays
// Each route is defined as an array of points relative to the player's starting position
// The coordinate system is:
// x: lateral position (left-right)
// y: vertical position (up-down) - usually 0 unless jumping
// z: forward-backward position

export const ROUTE_PATTERNS = {
  // Straight line routes
  GO: [
    { x: 0, y: 0, z: 0 },    // Starting position
    { x: 0, y: 0, z: -20 }   // Deep route straight ahead
  ],
  
  SLANT: [
    { x: 0, y: 0, z: 0 },     // Starting position
    { x: 0, y: 0, z: -3 },    // Quick steps forward
    { x: -5, y: 0, z: -10 }   // Diagonal cut inside
  ],
  
  OUT: [
    { x: 0, y: 0, z: 0 },     // Starting position
    { x: 0, y: 0, z: -7 },    // Vertical stem
    { x: 5, y: 0, z: -7 }     // Cut to outside
  ],
  
  IN: [
    { x: 0, y: 0, z: 0 },     // Starting position
    { x: 0, y: 0, z: -7 },    // Vertical stem
    { x: -5, y: 0, z: -7 }    // Cut to inside
  ],
  
  COMEBACK: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 0, y: 0, z: -12 },    // Vertical stem
    { x: 0, y: 0, z: -10 }     // Come back to ball
  ],
  
  CURL: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 0, y: 0, z: -8 },     // Vertical stem
    { x: -2, y: 0, z: -8 },    // Curl inside
    { x: -2, y: 0, z: -6 }     // Loop back
  ],
  
  CORNER: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 0, y: 0, z: -8 },     // Vertical stem
    { x: 6, y: 0, z: -15 }     // Break to corner
  ],
  
  POST: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 0, y: 0, z: -10 },    // Vertical stem
    { x: -6, y: 0, z: -18 }    // Break to post
  ],
  
  FLAT: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 5, y: 0, z: -1 }      // Quick flat route
  ],
  
  WHEEL: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 5, y: 0, z: -1 },     // Start as flat route
    { x: 5, y: 0, z: -8 },     // Turn up field
    { x: 0, y: 0, z: -15 }     // Wheel back inside
  ],
  
  DIG: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 0, y: 0, z: -10 },    // Vertical stem
    { x: -5, y: 0, z: -10 }    // Dig across middle
  ],
  
  // Designed for running backs
  SWING: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 6, y: 0, z: 2 },      // Swing out of backfield
    { x: 8, y: 0, z: -3 }      // Turn upfield
  ],
  
  // Blocking routes
  BLOCK_PASS: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 0, y: 0, z: -2 }      // Stay close to block
  ],
  
  BLOCK_RELEASE: [
    { x: 0, y: 0, z: 0 },      // Starting position
    { x: 0, y: 0, z: -2 },     // Start blocking
    { x: 3, y: 0, z: -5 }      // Release to flat
  ]
};

// Helper function to customize a route pattern for a specific player position
export const customizeRoute = (routePattern, playerPosition, options = {}) => {
  const { 
    sideFlip = false,      // Flip route horizontally (for opposite side of field)
    depthAdjust = 0,       // Adjust route depth (+ deeper, - shallower)
    widthAdjust = 0,       // Adjust route width
    startPos = { x: 0, z: 0 } // Starting position offset
  } = options;
  
  // Deep copy the route pattern to avoid modifying the original
  const customizedRoute = JSON.parse(JSON.stringify(routePattern));
  
  // Apply customizations to each point
  return customizedRoute.map((point, index) => {
    // First point is always the player's starting position
    if (index === 0) {
      return { 
        x: startPos.x, 
        y: point.y, 
        z: startPos.z 
      };
    }
    
    return {
      // Apply horizontal flip if needed
      x: sideFlip ? -point.x + widthAdjust : point.x + widthAdjust,
      y: point.y, // Y usually stays the same
      z: point.z - depthAdjust // Adjust depth
    };
  });
};

// Generate a THREE.js curve for visualization and AI path following
export const generateRoutePath = (route, color = '#ff0000') => {
  return createRoute(route, color);
};

// Helper to generate coordinated routes for a play
export const generatePlayRoutes = (formation, routeAssignments) => {
  const routes = {};
  
  // For each player with a route assignment
  Object.entries(routeAssignments).forEach(([positionId, routeInfo]) => {
    // Find the player position in the formation
    const playerPosition = formation.positions.find(p => p.id === positionId);
    
    if (!playerPosition) return;
    
    // Get route pattern
    const { pattern, options = {}, color } = routeInfo;
    const routePattern = ROUTE_PATTERNS[pattern];
    
    if (!routePattern) return;
    
    // Customize the route for this player
    const customizedRoute = customizeRoute(routePattern, playerPosition, options);
    
    // Generate the THREE.js path
    routes[positionId] = generateRoutePath(customizedRoute, color || '#ff0000');
  });
  
  return routes;
};

export default {
  patterns: ROUTE_PATTERNS,
  customize: customizeRoute,
  generate: generateRoutePath,
  generatePlayRoutes
};