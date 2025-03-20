import { create } from 'zustand';
import { GameController } from './GameController';
import { playSound } from '../utils/sound';

// Helper to convert between yard lines and 3D positions
const yardLineToZPosition = (yardLine) => {
  return Math.min(Math.max(-((yardLine / 100) * 200) + 100, -95), 95);
};

export const QuarterController = create((set, get) => ({
  // Quarter state
  quarterTime: 900, // 15 minutes in seconds
  isOffense: true, // Whether player is on offense
  fieldPosition: 20, // Yard line (0-100)
  
  // Actions
  actions: {
    initQuarter: () => {
      console.log('Initializing quarter');
      set({
        quarterTime: 900,
        isOffense: true,
        fieldPosition: 20
      });
    },
    
    resetQuarter: () => {
      set({
        quarterTime: 900,
        isOffense: true,
        fieldPosition: 20
      });
    },
    
    updateQuarterTime: (delta) => {
      const { quarterTime } = get();
      const newTime = Math.max(quarterTime - delta, 0);
      
      set({ quarterTime: newTime });
      
      // If quarter time reaches 0, advance to next quarter
      if (newTime === 0) {
        GameController.getState().actions.advanceQuarter();
        playSound('quarter_end.mp3', 0.7);
      }
    },
    
    togglePossession: () => {
      const { isOffense, fieldPosition } = get();
      
      // Flip field position when possession changes
      const newFieldPosition = 100 - fieldPosition;
      
      set({ 
        isOffense: !isOffense,
        fieldPosition: newFieldPosition
      });
      
      // Play turnover sound
      playSound('turnover.mp3', 0.7);
      
      return newFieldPosition;
    },
    
    updateFieldPosition: (newPosition) => {
      // Constrain field position to valid range (0-100)
      const validPosition = Math.min(Math.max(newPosition, 0), 100);
      
      set({ fieldPosition: validPosition });
      
      return validPosition;
    },
    
    getFieldPositionZ: () => {
      const { fieldPosition } = get();
      return yardLineToZPosition(fieldPosition);
    },
    
    isPlayerOnOffense: () => {
      return get().isOffense;
    }
  }
}));