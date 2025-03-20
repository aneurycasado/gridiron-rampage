import { create } from 'zustand';
import { GameController } from './GameController';
import { QuarterController } from './QuarterController';
import { PossessionController } from './PossessionController';
import { OffensiveController } from './OffensiveController';
import { DefensiveController } from './DefensiveController';

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Helper functions to convert between yard lines and 3D space Z positions
const yardLineToZPosition = (yardLine) => {
  return clamp(-((yardLine / 100) * 200) + 100, -95, 95);
};

const zPositionToYardLine = (zPosition) => {
  return clamp(100 - ((zPosition + 100) / 200) * 100, 0, 100);
};

export const PlayController = create((set, get) => ({
  // Play state
  playActive: false,
  playEnded: false,
  players: [], // Player references
  player: null, // Main player
  ragePoints: 0, // Current rage meter points
  rageMode: false, // Whether rage mode is active
  footballs: [], // Football objects in the game
  activePossession: "player-offense", // ID of player who has the ball
  tacklePosition: { x: 0, y: 1, z: 0 }, // Position where the tackle occurred
  playClock: 40, // Play clock in seconds
  
  // Actions
  actions: {
    resetPlay: () => {
      console.log("Resetting the play");
      
      // Get current position from possession controller
      const { position } = PossessionController.getState();
      const { players, tacklePosition } = get();
      
      // Set play state
      set({ 
        playActive: false,
        playEnded: false,
        playClock: 40 // Reset play clock
      });
      
      // Calculate line of scrimmage position in 3D space using our helper function
      const lineOfScrimmageZ = yardLineToZPosition(position);
      
      // Find offensive and defensive players
      const offensivePlayer = players.find(p => p.id === "player-offense");
      const defensivePlayer = players.find(p => p.id === "player-defense");
      
      // First, verify the tackle position is valid, otherwise reset to center
      const validTacklePos = {
        x: tacklePosition && !isNaN(tacklePosition.x) ? clamp(tacklePosition.x, -45, 45) : 0,
        y: 1,
        z: tacklePosition && !isNaN(tacklePosition.z) ? clamp(tacklePosition.z, -95, 95) : 0
      };
      
      // Use the valid tackle position for X, but ensure Z positions are based on line of scrimmage
      let safeOffensiveX = validTacklePos.x;
      let safeOffensiveZ = clamp(lineOfScrimmageZ + 3, -95, 95);
      let safeDefensiveX = clamp(validTacklePos.x + (Math.random() - 0.5) * 5, -45, 45);
      let safeDefensiveZ = clamp(lineOfScrimmageZ - 3, -95, 95);
      
      // Handle edge case - if calculated positions are still invalid, reset to center of field
      if (safeOffensiveZ < -95 || safeOffensiveZ > 95 || safeDefensiveZ < -95 || safeDefensiveZ > 95) {
        console.warn("Invalid player positions detected, resetting to safer values");
        safeOffensiveX = 0;
        safeOffensiveZ = clamp(lineOfScrimmageZ + 3, -95, 95);
        safeDefensiveX = 0;
        safeDefensiveZ = clamp(lineOfScrimmageZ - 3, -95, 95);
      }
      
      // Reset player positions if they exist, placing them relative to tackle position
      if (offensivePlayer && offensivePlayer.ref && offensivePlayer.ref.current) {
        // Place offensive player where the tackle occurred, but constrained to safe area
        offensivePlayer.ref.current.setTranslation({ 
          x: safeOffensiveX,
          y: 1,
          z: safeOffensiveZ
        });
        
        // Reset velocity to prevent unintended movement
        offensivePlayer.ref.current.setLinvel({ x: 0, y: 0, z: 0 });
      }
      
      if (defensivePlayer && defensivePlayer.ref && defensivePlayer.ref.current) {
        // Place defensive player in front of line of scrimmage with constrained position
        defensivePlayer.ref.current.setTranslation({ 
          x: safeDefensiveX,
          y: 1, 
          z: safeDefensiveZ
        });
        
        // Reset velocity to prevent unintended movement
        defensivePlayer.ref.current.setLinvel({ x: 0, y: 0, z: 0 });
      }
      
      console.log(`Reset play at yard line: ${position}, tackle position: [${safeOffensiveX}, 1, ${safeOffensiveZ}]`);
    },
    
    startPlay: () => {
      console.log("Starting the play");
      
      // Record line of scrimmage at the start of the play
      PossessionController.getState().actions.recordLineOfScrimmage();
      
      set({ 
        playActive: true,
        playEnded: false,
        playClock: 40 // Reset play clock
      });
      
      // For defensive player positioning, we'll rely on the PlayerController's own useEffect
      // that triggers when playActive changes. This ensures all positioning happens in one place.
      
      console.log("Play started - defensive player will be positioned through its controller");
      
      // Notify any listeners that might be interested in the play starting
      setTimeout(() => {
        // This still runs after a small delay to ensure game state is properly updated
        // and to maintain compatibility with existing code
        
        // Get latest state
        const state = get();
        if (!state.playActive) {
          console.log("Play was ended before defensive player could be positioned");
          return;
        }
        
        console.log("Play is active, players should be moving");
      }, 100); // Small delay to ensure state is updated
    },
    
    endPlay: () => {
      console.log("Ending the play");
      const { footballs, players } = get();
      
      // Get football position to calculate yards gained
      let ballPositionZ = PossessionController.getState().position;
      let tacklePos = { x: 0, y: 1, z: 0 };
      
      if (footballs.length > 0 && footballs[0].position) {
        ballPositionZ = Math.round(zPositionToYardLine(footballs[0].position[2])); // Convert from 3D space to yard line
        
        // Record the ball position as the tackle position (with constraints)
        tacklePos = {
          x: clamp(footballs[0].position[0] || 0, -45, 45),
          y: 1,
          z: clamp(footballs[0].position[2] || 0, -95, 95)
        };
      } else {
        // If no football found, use offensive player position
        const offensivePlayer = players.find(p => p.id === "player-offense");
        if (offensivePlayer && offensivePlayer.position) {
          tacklePos = { 
            x: clamp(offensivePlayer.position.x, -45, 45), 
            y: 1, 
            z: clamp(offensivePlayer.position.z, -95, 95) 
          };
          ballPositionZ = Math.round(zPositionToYardLine(offensivePlayer.position.z)); // Convert from 3D space to yard line
        }
      }
      
      // Ensure the ball position is within valid yard line range (0-100)
      ballPositionZ = clamp(ballPositionZ, 0, 100);
      
      // Calculate yards gained
      const yardsGained = ballPositionZ - PossessionController.getState().lineOfScrimmage;
      console.log(`Play ended. Yards gained: ${yardsGained}`);
      
      // Update state first
      set({ 
        playActive: false,
        playEnded: true,
        tacklePosition: tacklePos // Save the tackle position for the next play
      });
      
      // Process down advancement after state is updated
      setTimeout(() => {
        PossessionController.getState().actions.advanceDown(yardsGained);
      }, 100);
      
      // Update defensive player tackles stat if they made the tackle
      GameController.getState().actions.updatePlayerStats({
        tackles: GameController.getState().playerStats.tackles + 1
      });
    },
    
    recordTacklePosition: (position) => {
      // Constrain the tackle position within safe field boundaries
      const safePosition = {
        x: clamp(position.x, -45, 45), // Keep X within field width (with margin)
        y: 1,                          // Always keep at ground level + 1
        z: clamp(position.z, -95, 95)  // Keep Z within field length (with margin)
      };
      
      console.log(`Recording tackle position: [${safePosition.x}, ${safePosition.y}, ${safePosition.z}]`);
      set({ tacklePosition: safePosition });
    },
    
    setPaused: (paused) => {
      // This doesn't directly set playActive, it's just used for synchronizing with GameController pause
      console.log(`Play controller notified of pause state: ${paused}`);
    },
    
    updatePlayClock: (delta) => {
      // Only update play clock when play is active
      if (get().playActive) {
        const { playClock } = get();
        const newClock = Math.max(playClock - delta, 0);
        
        set({ playClock: newClock });
        
        // If play clock reaches 0, end the play (delay of game)
        if (newClock === 0) {
          console.log("Delay of game! Play clock expired.");
          get().actions.endPlay();
        }
      }
    },
    
    // Player management functions
    addPlayer: (player) => {
      console.log(`Adding player with ID: ${player.id}`);
      set((state) => ({
        players: [...state.players, player],
      }));
    },
    
    removePlayer: (playerId) => {
      console.log(`Removing player with ID: ${playerId}`);
      set((state) => ({
        players: state.players.filter(p => p.id !== playerId),
      }));
    },
    
    updatePlayerPosition: (playerId, position, rotation = 0) => {
      // Only update if position is within valid field boundaries
      if (position.x > -50 && position.x < 50 && position.z > -100 && position.z < 100) {
        set((state) => ({
          players: state.players.map(p => 
            p.id === playerId 
              ? { ...p, position, rotation }
              : p
          ),
        }));
      }
    },
    
    setPlayer: (player) => {
      set({ player });
    },
    
    // Rage meter functions
    addRagePoints: (points) => {
      set((state) => ({
        ragePoints: Math.min(state.ragePoints + points, 100),
      }));
    },
    
    activateRageMode: () => {
      const { ragePoints } = get();
      if (ragePoints >= 100) {
        set({ 
          rageMode: true, 
          ragePoints: 0 
        });
        
        // Auto-disable rage mode after 15 seconds
        setTimeout(() => {
          set({ rageMode: false });
        }, 15000);
      }
    },
    
    // Football related functions
    addFootball: (football) => {
      // Check if football with this ID already exists to prevent duplicates
      const state = get();
      const exists = state.footballs.some(f => f.id === football.id);
      
      if (!exists) {
        console.log(`Adding football with ID: ${football.id} to store`);
        set((state) => ({
          footballs: [...state.footballs, football],
        }));
      } else {
        console.log(`Football with ID: ${football.id} already exists in store`);
      }
    },
    
    removeFootball: (footballId) => {
      console.log(`Removing football with ID: ${footballId} from store`);
      // Check if the football exists before removing to prevent unnecessary updates
      const { footballs } = get();
      if (footballs.some(f => f.id === footballId)) {
        set((state) => ({
          footballs: state.footballs.filter((f) => f.id !== footballId),
        }));
      }
    },
    
    getFootball: (footballId) => {
      const { footballs } = get();
      return footballs.find((f) => f.id === footballId);
    },
    
    updateFootballPosition: ({ id, position }) => {
      // Only update football position if it's within valid field boundaries
      if (position && position[0] > -50 && position[0] < 50 && position[2] > -100 && position[2] < 100) {
        set((state) => ({
          footballs: state.footballs.map((f) => 
            f.id === id ? { ...f, position } : f
          ),
        }));
      }
    },
    
    setFootballStatus: ({ id, isThrown, ownerId, position }) => {
      set((state) => ({
        footballs: state.footballs.map((f) => 
          f.id === id ? { 
            ...f, 
            isThrown, 
            ownerId,
            position: position || f.position
          } : f
        ),
        // Update active possession
        activePossession: ownerId
      }));
    },
    
    throwFootball: ({ id, direction, force, height }) => {
      const { footballs } = get();
      const football = footballs.find(f => f.id === id);
      
      if (football && football.ref && football.ref.current) {
        football.ref.current.throwBall(direction, force, height);
      }
    },
    
    pickupFootball: ({ footballId, playerId }) => {
      const { footballs, players } = get();
      const football = footballs.find(f => f.id === footballId);
      const player = players.find(p => p.id === playerId);
      
      if (football && football.ref && football.ref.current && player) {
        football.ref.current.attachToPlayer(player);
        
        // Update active possession
        set({ activePossession: playerId });
      }
    },
    
    hasActivePossession: (playerId) => {
      // Check if the player has possession of the football
      const state = get();
      const hasBall = state.activePossession === playerId;
      return hasBall;
    },
    
    getFootballByOwner: (ownerId) => {
      const { footballs } = get();
      const football = footballs.find(f => f.ownerId === ownerId);
      return football;
    }
  }
}));