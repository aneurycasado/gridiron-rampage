import { create } from 'zustand';
import { PlayController } from './PlayController';
import { PossessionController } from './PossessionController';

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const OffensiveController = create((set, get) => ({
  // Offensive state
  offensiveFormation: 'spread', // default formation
  offensivePlaybook: [
    { name: 'Spread', formation: 'spread' },
    { name: 'I-Form', formation: 'i-form' },
    { name: 'Shotgun', formation: 'shotgun' }
  ],
  selectedPlay: null,
  
  // Actions
  actions: {
    selectFormation: (formation) => {
      set({ offensiveFormation: formation });
    },
    
    selectPlay: (playName) => {
      const { offensivePlaybook } = get();
      const play = offensivePlaybook.find(p => p.name === playName);
      
      if (play) {
        set({ selectedPlay: play });
      }
    },
    
    positionOffensivePlayers: () => {
      // For now, we only have one offensive player
      // This would position all offensive players based on formation
      const { offensiveFormation } = get();
      const { lineOfScrimmage } = PossessionController.getState();
      const { players } = PlayController.getState();
      
      console.log("Positioning offensive players. Line of scrimmage:", lineOfScrimmage);
      console.log("Players:", players);
      
      // Find offensive player
      const offensivePlayer = players.find(p => p.id === "player-offense");
      
      if (!offensivePlayer || !offensivePlayer.ref || !offensivePlayer.ref.current) {
        console.warn("No offensive player found to position!");
        return;
      }
      
      // Convert line of scrimmage to 3D Z position
      const scrimmageZ = -((lineOfScrimmage / 100) * 200) + 100;
      
      // Position based on formation (would be more complex with multiple players)
      let posX = 0;
      let posZ = scrimmageZ + 3; // 3 units behind line of scrimmage by default
      
      if (offensiveFormation === 'spread') {
        posX = 0; // center
      } else if (offensiveFormation === 'i-form') {
        posX = 0; // center
        posZ = scrimmageZ + 5; // further back
      } else if (offensiveFormation === 'shotgun') {
        posX = 0; // center
        posZ = scrimmageZ + 7; // even further back
      }
      
      console.log(`Positioning offensive player at [${posX}, 1, ${posZ}]`);
      
      // Ensure position is within field boundaries
      posX = clamp(posX, -45, 45);
      posZ = clamp(posZ, -95, 95);
      
      // Set player position
      offensivePlayer.ref.current.setTranslation({
        x: posX,
        y: 1,
        z: posZ
      });
      
      // Reset velocity
      offensivePlayer.ref.current.setLinvel({ x: 0, y: 0, z: 0 });
      
      console.log(`Positioned offensive player in ${offensiveFormation} formation at [${posX}, 1, ${posZ}]`);
    },
    
    getCurrentFormation: () => {
      return get().offensiveFormation;
    },
    
    getOffensivePlaybook: () => {
      return get().offensivePlaybook;
    }
  }
}));