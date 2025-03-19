// Export all play system components from a single index
import PlayBook, { createPlay, createRoute, suggestPlays } from './PlayBook';
import Formations, { formationToFieldPosition, OFFENSIVE_FORMATIONS, DEFENSIVE_FORMATIONS } from './Formations';
import Routes, { ROUTE_PATTERNS, generateRoutePath } from './Routes';
import PlayVisualization from './PlayVisualization';
import FieldOverlay from './FieldOverlay';
import PlaySelectionMenu from './PlaySelectionMenu';
import AIPlayer from './AIPlayer';
import offensivePlays from './OffensivePlays';
import defensivePlays from './DefensivePlays';

// Export play system
export {
  // Core components
  PlayBook,
  Formations,
  Routes,
  PlayVisualization,
  FieldOverlay,
  PlaySelectionMenu,
  AIPlayer,
  
  // Helper functions
  createPlay,
  createRoute,
  suggestPlays,
  formationToFieldPosition,
  generateRoutePath,
  
  // Constants and data
  OFFENSIVE_FORMATIONS,
  DEFENSIVE_FORMATIONS,
  ROUTE_PATTERNS,
  offensivePlays,
  defensivePlays
};

// Default export the full play system
export default {
  PlayBook,
  Formations,
  Routes,
  PlayVisualization,
  FieldOverlay,
  PlaySelectionMenu,
  AIPlayer,
  offensivePlays,
  defensivePlays
};