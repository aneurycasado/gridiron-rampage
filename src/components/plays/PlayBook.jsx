import * as THREE from 'three';

// Utility function to create a play object
export const createPlay = ({
  id,
  name,
  type, // 'run', 'pass', 'option'
  formation,
  difficultyLevel,
  description,
  routes, // Array of route paths for receivers
  ballCarrier, // Default ball carrier position
  strengths = [], // Situations where play works well
  weaknesses = [], // Vulnerabilities
  animations = {}, // Special animations to use
  aiInstructions = {}, // Logic for AI teammates
}) => ({ 
  id, 
  name, 
  type, 
  formation, 
  difficultyLevel,
  description,
  routes,
  ballCarrier,
  strengths,
  weaknesses,
  animations,
  aiInstructions
});

// Helper to create route paths using THREE.js curves
export const createRoute = (points, color = '#ff0000') => {
  // Convert points to THREE.js Vector3 objects
  const vectors = points.map(p => new THREE.Vector3(p.x, p.y || 0, p.z));
  
  // Create a smooth curve through these points
  const curve = new THREE.CatmullRomCurve3(vectors);
  
  return {
    curve,
    color,
    points: vectors,
    // Generate points along curve for visualization
    getPoints: (segments = 20) => curve.getPoints(segments)
  };
};

// Helper to suggest plays based on game situation
export const suggestPlays = (gameState, availablePlays, count = 3) => {
  const { downs } = gameState;
  const yardsToGo = downs.toGo;
  const fieldPosition = downs.position;
  const currentDown = downs.current;
  
  // Score plays based on situation
  const scoredPlays = availablePlays.map(play => {
    let score = 0;
    
    // Down-based scoring
    if (currentDown === 1 || currentDown === 2) {
      // Early downs favor balanced approach
      if (play.type === 'run') score += 1;
      if (play.type === 'pass') score += 1;
    } else if (currentDown === 3) {
      // 3rd down favors passes unless very short yardage
      if (yardsToGo <= 2 && play.type === 'run') score += 2;
      else if (play.type === 'pass') score += 2;
    } else if (currentDown === 4) {
      // 4th down favors higher percentage plays
      if (yardsToGo <= 2 && play.type === 'run') score += 3;
      else if (play.type === 'pass' && play.difficultyLevel <= 2) score += 2;
    }
    
    // Yardage-based scoring
    if (yardsToGo <= 3) {
      // Short yardage favors runs
      if (play.type === 'run') score += 2; 
    } else if (yardsToGo >= 7) {
      // Long yardage favors passes
      if (play.type === 'pass') score += 2;
    }
    
    // Field position scoring
    if (fieldPosition <= 10) {
      // Backed up - favor safe plays
      if (play.difficultyLevel <= 2) score += 2;
    } else if (fieldPosition >= 80) {
      // Red zone - favor specialized plays
      if (play.strengths.includes('redZone')) score += 3;
    }
    
    // Check if play strengths match our situation
    for (const strength of play.strengths) {
      if (
        (strength === 'shortYardage' && yardsToGo <= 3) ||
        (strength === 'longYardage' && yardsToGo >= 7) ||
        (strength === 'redZone' && fieldPosition >= 80)
      ) {
        score += 2;
      }
    }
    
    return { ...play, score };
  });
  
  // Sort by score and return top suggestions
  return scoredPlays
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
};

// Export default empty playbook that will be populated by specific play catalogs
export default {
  offensivePlays: [],
  defensivePlays: []
};