import { create } from 'zustand';
import { PlayController } from './PlayController';
import { PossessionController } from './PossessionController';

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const DefensiveController = create((set, get) => ({
  // Defensive state
  defensiveFormation: 'man', // default formation
  defensivePlaybook: [
    { name: 'Man Coverage', formation: 'man' },
    { name: 'Zone Coverage', formation: 'zone' },
    { name: 'Blitz', formation: 'blitz' }
  ],
  selectedDefense: null,
  aiAggressiveness: 0.5, // 0-1 scale, higher = more aggressive
  
  // Actions
  actions: {
    selectFormation: (formation) => {
      set({ defensiveFormation: formation });
    },
    
    selectDefense: (defenseName) => {
      const { defensivePlaybook } = get();
      const defense = defensivePlaybook.find(d => d.name === defenseName);
      
      if (defense) {
        set({ selectedDefense: defense });
      }
    },
    
    setAIAggressiveness: (level) => {
      // Clamp between 0 and 1
      const safeLevel = clamp(level, 0, 1);
      set({ aiAggressiveness: safeLevel });
    },
    
    positionDefensivePlayers: () => {
      // For now, we only have one defensive player
      // This would position all defensive players based on formation
      const { defensiveFormation, aiAggressiveness } = get();
      const { lineOfScrimmage } = PossessionController.getState();
      const { players } = PlayController.getState();
      
      console.log("Positioning defensive players. Line of scrimmage:", lineOfScrimmage);
      console.log("Players:", players);
      
      // Find defensive player
      const defensivePlayer = players.find(p => p.id === "player-defense");
      
      if (!defensivePlayer || !defensivePlayer.ref || !defensivePlayer.ref.current) {
        console.warn("No defensive player found to position!");
        return;
      }
      
      // Convert line of scrimmage to 3D Z position
      const scrimmageZ = -((lineOfScrimmage / 100) * 200) + 100;
      
      // Position based on formation (would be more complex with multiple players)
      let posX = 0;
      let posZ = scrimmageZ - 3; // 3 units in front of line of scrimmage by default
      
      // Add some randomization to X position
      posX = (Math.random() - 0.5) * 10; // random position ±5 units from center
      
      if (defensiveFormation === 'man') {
        // Position for man coverage
        posZ = scrimmageZ - 3; 
      } else if (defensiveFormation === 'zone') {
        // Position deeper for zone coverage
        posZ = scrimmageZ - 6;
      } else if (defensiveFormation === 'blitz') {
        // Position closer to line for blitz
        posZ = scrimmageZ - 1;
      }
      
      // Adjust position based on AI aggressiveness
      posZ = posZ + ((0.5 - aiAggressiveness) * 4); // More aggressive = closer to line
      
      console.log(`Positioning defensive player at [${posX}, 1, ${posZ}]`);
      
      // Ensure position is within field boundaries
      posX = clamp(posX, -45, 45);
      posZ = clamp(posZ, -95, 95);
      
      // Set player position
      defensivePlayer.ref.current.setTranslation({
        x: posX,
        y: 1,
        z: posZ
      });
      
      // Reset velocity
      defensivePlayer.ref.current.setLinvel({ x: 0, y: 0, z: 0 });
      
      console.log(`Positioned defensive player in ${defensiveFormation} formation at [${posX}, 1, ${posZ}]`);
    },
    
    getCurrentFormation: () => {
      return get().defensiveFormation;
    },
    
    getDefensivePlaybook: () => {
      return get().defensivePlaybook;
    },
    
    getAIAggressiveness: () => {
      return get().aiAggressiveness;
    }
  }
}));