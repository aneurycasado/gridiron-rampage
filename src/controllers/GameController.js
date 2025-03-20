import { create } from 'zustand';
import { playSound } from '../utils/sound';
import { QuarterController } from './QuarterController';
import { PossessionController } from './PossessionController';
import { PlayController } from './PlayController';

export const GameController = create((set, get) => ({
  // Game state
  gameStarted: false,
  gamePaused: false,
  fieldVisible: true,
  controls: "keyboard",
  
  // Game statistics
  score: {
    player: 0,
    opponent: 0
  },
  
  // Game time
  quarter: 1,
  gameTime: 900, // 15 minutes in seconds
  
  // Player stats
  playerStats: {
    yardsRushed: 0,
    passingYards: 0,
    touchdowns: 0,
    tackles: 0
  },
  
  // Actions
  actions: {
    setGameStarted: (gameStarted) => {
      console.log(`Setting game started to: ${gameStarted}`);
      set({ gameStarted, fieldVisible: true });
      
      // Initialize sub-controllers when game starts
      if (gameStarted) {
        QuarterController.getState().actions.initQuarter();
        PossessionController.getState().actions.initPossession();
      }
    },
    
    togglePause: () => {
      const { gamePaused } = get();
      console.log(`Toggling game paused from ${gamePaused} to ${!gamePaused}`);
      set({ gamePaused: !gamePaused });
      
      // Pause/unpause play controller
      PlayController.getState().actions.setPaused(!gamePaused);
    },
    
    setPaused: (paused) => {
      console.log(`Setting game paused to: ${paused}`);
      set({ gamePaused: paused });
      
      // Pause/unpause play controller
      PlayController.getState().actions.setPaused(paused);
    },
    
    setControls: (controls) => {
      set({ controls });
    },
    
    addScore: (team, points) => {
      set((state) => ({
        score: {
          ...state.score,
          [team]: state.score[team] + points
        }
      }));
      
      // Play touchdown sound
      if (points === 7) {
        playSound('touchdown.mp3', 0.7);
      }
      
      // Update player stats if player team scored touchdown
      if (team === 'player' && points === 7) {
        set((state) => ({
          playerStats: {
            ...state.playerStats,
            touchdowns: state.playerStats.touchdowns + 1
          }
        }));
      }
    },
    
    updatePlayerStats: (stats) => {
      set((state) => ({
        playerStats: {
          ...state.playerStats,
          ...stats
        }
      }));
    },
    
    advanceQuarter: () => {
      const { quarter } = get();
      
      if (quarter < 4) {
        set({ quarter: quarter + 1 });
        QuarterController.getState().actions.initQuarter();
      } else {
        // Game over
        console.log('Game over!');
        set({ gameStarted: false });
      }
    },
    
    resetGame: () => {
      // Reset game state
      set({
        gameStarted: false,
        gamePaused: false,
        fieldVisible: true,
        score: {
          player: 0,
          opponent: 0
        },
        quarter: 1,
        gameTime: 900,
        playerStats: {
          yardsRushed: 0,
          passingYards: 0,
          touchdowns: 0,
          tackles: 0
        }
      });
      
      // Reset sub-controllers
      QuarterController.getState().actions.resetQuarter();
      PossessionController.getState().actions.resetPossession();
      PlayController.getState().actions.resetPlay();
    }
  }
}));