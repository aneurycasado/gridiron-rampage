import { create } from 'zustand';
import { GameController } from './GameController';
import { QuarterController } from './QuarterController';
import { PlayController } from './PlayController';
import { playSound } from '../utils/sound';

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const PossessionController = create((set, get) => ({
  // Downs state
  current: 1,           // Current down (1-4)
  toGo: 10,             // Yards needed for first down
  position: 20,         // Current yard line (0-100)
  lineOfScrimmage: 20,  // Starting yard line of the current play
  firstDownLine: 30,    // Yard line needed for first down
  possession: "offense", // "offense" or "defense" to track who has the ball
  
  // Actions
  actions: {
    initPossession: () => {
      console.log('Initializing possession');
      set({
        current: 1,
        toGo: 10,
        position: 20,
        lineOfScrimmage: 20,
        firstDownLine: 30,
        possession: "offense"
      });
    },
    
    resetPossession: () => {
      set({
        current: 1,
        toGo: 10,
        position: 20,
        lineOfScrimmage: 20,
        firstDownLine: 30,
        possession: "offense"
      });
    },
    
    startNewPossession: (yardLine) => {
      const validYardLine = clamp(yardLine, 1, 99);
      const newFirstDownLine = Math.min(validYardLine + 10, 100);
      
      set({
        current: 1,
        toGo: Math.min(10, 100 - validYardLine),
        position: validYardLine,
        lineOfScrimmage: validYardLine,
        firstDownLine: newFirstDownLine
      });
      
      // Update field position in quarter controller
      QuarterController.getState().actions.updateFieldPosition(validYardLine);
    },
    
    recordLineOfScrimmage: () => {
      const { position } = get();
      
      set({ lineOfScrimmage: position });
      
      return position;
    },
    
    advanceDown: (yardsGained) => {
      const { current, position, lineOfScrimmage, firstDownLine } = get();
      const { score } = GameController.getState();
      
      // Update position based on yards gained
      const newPosition = clamp(position + yardsGained, 0, 100);
      
      // TOUCHDOWN: Check if reached or passed goal line (100)
      if (newPosition >= 100) {
        console.log("TOUCHDOWN!");
        playSound("touchdown.mp3", 0.7);
        
        // Add points and reset to the 20-yard line with 1st & 10
        GameController.getState().actions.addScore('player', 7);
        
        set({
          current: 1,
          toGo: 10,
          position: 20,
          lineOfScrimmage: 20,
          firstDownLine: 30
        });
        
        // Update field position in quarter controller
        QuarterController.getState().actions.updateFieldPosition(20);
        
        // Update player stats
        GameController.getState().actions.updatePlayerStats({
          yardsRushed: GameController.getState().playerStats.yardsRushed + yardsGained
        });
        
        console.log("Touchdown! Reset to the 20-yard line");
        return;
      }
      
      // FIRST DOWN: Check if reached or passed the first down line
      if (newPosition >= firstDownLine) {
        console.log("FIRST DOWN! Reached the first down line.");
        playSound("firstdown.mp3", 0.7);
        
        // Set new first down line (10 yards from current position, capped at 100)
        const newFirstDownLine = Math.min(newPosition + 10, 100); 
        
        set({
          current: 1,                   // Reset to first down
          toGo: Math.min(10, 100 - newPosition), // Standard 10 yards to go (or less if near goal line)
          position: newPosition,        // Update current position
          lineOfScrimmage: newPosition, // Update line of scrimmage
          firstDownLine: newFirstDownLine // Set new first down line
        });
        
        // Update field position in quarter controller
        QuarterController.getState().actions.updateFieldPosition(newPosition);
        
        // Update player stats
        GameController.getState().actions.updatePlayerStats({
          yardsRushed: GameController.getState().playerStats.yardsRushed + yardsGained
        });
        
        console.log(`New first down at the ${newPosition} yard line`);
        return;
      }
      
      // TURNOVER ON DOWNS: If it's 4th down and didn't get a first down
      if (current === 4) {
        console.log("TURNOVER ON DOWNS!");
        playSound("turnover.mp3", 0.7);
        
        // "Flip" field position for display purposes
        const flippedPosition = clamp(100 - newPosition, 1, 99); 
        const newFirstDownLine = Math.min(flippedPosition + 10, 100); 
        
        set({
          current: 1,                    // Reset to first down
          toGo: 10,                      // Standard 10 yards to go
          position: flippedPosition,     // Update position (flipped)
          lineOfScrimmage: flippedPosition, // Update line of scrimmage
          firstDownLine: newFirstDownLine, // Set new first down line
          possession: get().possession === "offense" ? "defense" : "offense" // Switch possession
        });
        
        // Toggle possession in quarter controller
        QuarterController.getState().actions.togglePossession();
        
        // Update player stats if yards were gained
        if (yardsGained > 0) {
          GameController.getState().actions.updatePlayerStats({
            yardsRushed: GameController.getState().playerStats.yardsRushed + yardsGained
          });
        }
        
        console.log(`Possession changed after turnover on downs. New position: ${flippedPosition}`);
        return;
      }
      
      // ADVANCE TO NEXT DOWN: Didn't get first down but still have downs left
      // Calculate new yards to go by subtracting yards gained from previous yards to go
      const yardsToGo = Math.max(1, firstDownLine - newPosition);
      console.log(`${current + 1} DOWN AND ${yardsToGo} TO GO!`);
      
      set({
        current: current + 1,       // Increment the down
        toGo: yardsToGo,            // Update yards needed for first down
        position: newPosition,       // Update position
        lineOfScrimmage: newPosition // Update line of scrimmage
      });
      
      // Update field position in quarter controller
      QuarterController.getState().actions.updateFieldPosition(newPosition);
      
      // Update player stats if yards were gained
      if (yardsGained > 0) {
        GameController.getState().actions.updatePlayerStats({
          yardsRushed: GameController.getState().playerStats.yardsRushed + yardsGained
        });
      }
    },
    
    getCurrentDown: () => {
      return get().current;
    },
    
    getYardsToGo: () => {
      return get().toGo;
    },
    
    getLineOfScrimmage: () => {
      return get().lineOfScrimmage;
    },
    
    getFirstDownLine: () => {
      return get().firstDownLine;
    }
  }
}));