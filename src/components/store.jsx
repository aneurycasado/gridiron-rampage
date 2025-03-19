import { create } from "zustand";

// Helper function to play sound
export const playSound = (path, volume = 1.0) => {
  try {
    const audio = new Audio(`/sounds/${path}`);
    audio.volume = volume;
    audio.play().catch(e => console.log("Audio play error:", e));
    return audio;
  } catch (e) {
    console.error("Error playing sound:", e);
    return null;
  }
};

// Helper function to constrain a value between min and max
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Helper functions to convert between yard lines and 3D space Z positions
const yardLineToZPosition = (yardLine) => {
  return clamp(-((yardLine / 100) * 200) + 100, -95, 95);
};

const zPositionToYardLine = (zPosition) => {
  return clamp(100 - ((zPosition + 100) / 200) * 100, 0, 100);
};

export const useStore = create((set, get) => ({
  gameStarted: false, // Game state - whether the game has started
  gamePaused: false, // Game state - whether the game is paused
  playActive: false, // Whether the current football play is active
  playEnded: false, // Whether the current play has ended
  fieldVisible: true, // Whether the field is visible
  controls: "keyboard", // Default control type
  players: [], // Player references
  player: null, // Main player
  ragePoints: 0, // Current rage meter points
  rageMode: false, // Whether rage mode is active
  footballs: [], // Football objects in the game
  activePossession: "player-offense", // ID of player who has the ball
  tacklePosition: { x: 0, y: 1, z: 0 }, // Position where the tackle occurred
  score: {
    player: 0,
    opponent: 0
  },
  downs: {
    current: 1,           // Current down (1-4)
    toGo: 10,             // Yards needed for first down
    position: 20,         // Current yard line (0-100)
    lineOfScrimmage: 20,  // Starting yard line of the current play
    firstDownLine: 30,    // Yard line needed for first down
    possession: "offense" // "offense" or "defense" to track who has the ball
  },
  actions: {
    setGameStarted: (gameStarted) => {
      console.log(`Setting game started to: ${gameStarted}`);
      set({ gameStarted, fieldVisible: true });
    },
    togglePause: () => {
      const { gamePaused } = get();
      console.log(`Toggling game paused from ${gamePaused} to ${!gamePaused}`);
      set({ gamePaused: !gamePaused });
    },
    setPaused: (paused) => {
      console.log(`Setting game paused to: ${paused}`);
      set({ gamePaused: paused });
    },
    setControls: (controls) => {
      set({ controls });
    },
    startPlay: () => {
      console.log("Starting the play");
      const { downs } = get();
      
      // Record line of scrimmage at the start of the play
      set({ 
        playActive: true,
        playEnded: false,
        fieldVisible: true, // Ensure field is visible when play starts
        downs: {
          ...downs,
          lineOfScrimmage: downs.position
        }
      });
      
      // For defensive player positioning, we'll rely on the PlayerController's own useEffect
      // that triggers when playActive changes. This ensures all positioning happens in one place.
      // The PlayerController implements a more robust defensive player AI system.
      
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
    endPlay: () => {
      console.log("Ending the play");
      const { downs, footballs, players } = get();
      
      // Get football position to calculate yards gained
      let ballPositionZ = downs.position;
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
      const yardsGained = ballPositionZ - downs.lineOfScrimmage;
      console.log(`Play ended. Yards gained: ${yardsGained}`);
      
      // Update state first
      set({ 
        playActive: false,
        playEnded: true,
        fieldVisible: true, // Ensure field stays visible when play ends
        tacklePosition: tacklePos // Save the tackle position for the next play
      });
      
      // Process down advancement after state is updated
      setTimeout(() => {
        const state = get();
        state.actions.advanceDown(yardsGained);
      }, 100);
    },
    resetPlay: () => {
      console.log("Resetting the play");
      
      // Get the current downs state
      const { downs, players, tacklePosition } = get();
      
      // Set play state
      set({ 
        playActive: false,
        playEnded: false,
        fieldVisible: true // Ensure field is visible when play resets
      });
      
      // Calculate line of scrimmage position in 3D space using our helper function
      const lineOfScrimmageZ = yardLineToZPosition(downs.position);
      
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
      
      console.log(`Reset play at yard line: ${downs.position}, tackle position: [${safeOffensiveX}, 1, ${safeOffensiveZ}]`);
    },
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
    addScore: (team, points) => {
      set((state) => ({
        score: {
          ...state.score,
          [team]: state.score[team] + points
        }
      }));
    },
    advanceDown: (yardsGained) => {
      const { downs, score } = get();
      
      // Update position based on yards gained
      const newPosition = Math.min(Math.max(downs.position + yardsGained, 0), 100);
      
      // TOUCHDOWN: Check if reached or passed goal line (100)
      if (newPosition >= 100) {
        console.log("TOUCHDOWN!");
        try {
          playSound("touchdown.mp3", 0.7);
        } catch (e) {
          console.warn("Could not play touchdown sound", e);
        }
        
        // Reset tackle position to the center of the field after a touchdown
        const touchdownTacklePos = { x: 0, y: 1, z: 0 };
        
        // Add points and reset to the 20-yard line with 1st & 10
        set({
          downs: {
            ...downs,
            current: 1,
            toGo: 10,
            position: 20,
            lineOfScrimmage: 20,
            firstDownLine: 30
          },
          score: {
            ...score,
            player: score.player + 7     // Add 7 points for touchdown
          },
          tacklePosition: touchdownTacklePos, // Reset tackle position
          fieldVisible: true // Ensure field is visible after touchdown
        });
        
        console.log("Touchdown! Reset to the 20-yard line");
        return;
      }
      
      // FIRST DOWN: Check if reached or passed the first down line
      if (newPosition >= downs.firstDownLine) {
        console.log("FIRST DOWN! Reached the first down line.");
        try {
          playSound("firstdown.mp3", 0.7);
        } catch (e) {
          console.warn("Could not play first down sound", e);
        }
        
        // Set new first down line (10 yards from current position, capped at 100)
        const newFirstDownLine = Math.min(newPosition + 10, 100); 
        
        // Calculate new scrimmage position in 3D space
        const newScrimmagePos = yardLineToZPosition(newPosition);
        
        // Create a new tackle position centered on X with proper Z position
        // This is crucial to properly position players on the next play
        const firstDownTacklePos = { 
          x: 0, // Center on X-axis for new first down
          y: 1, 
          z: clamp(newScrimmagePos + 3, -95, 95) // Position properly relative to new line of scrimmage
        };
        
        set({
          downs: {
            ...downs,
            current: 1,                   // Reset to first down
            toGo: Math.min(10, 100 - newPosition), // Standard 10 yards to go (or less if near goal line)
            position: newPosition,        // Update current position
            lineOfScrimmage: newPosition, // Update line of scrimmage
            firstDownLine: newFirstDownLine // Set new first down line
          },
          tacklePosition: firstDownTacklePos, // Set proper tackle position for next play
          fieldVisible: true // Ensure field is visible after first down
        });
        
        console.log(`New first down at the ${newPosition} yard line`);
        return;
      }
      
      // TURNOVER ON DOWNS: If it's 4th down and didn't get a first down
      if (downs.current === 4) {
        console.log("TURNOVER ON DOWNS!");
        try {
          playSound("turnover.mp3", 0.7);
        } catch (e) {
          console.warn("Could not play turnover sound", e);
        }
        
        // "Flip" field position for display purposes
        const flippedPosition = Math.min(Math.max(100 - newPosition, 1), 99); 
        const newFirstDownLine = Math.min(flippedPosition + 10, 100); 
        
        // Reset tackle position to the center of the field for turnover
        const turnoverTacklePos = { x: 0, y: 1, z: 0 };
        
        set({
          downs: {
            ...downs,
            current: 1,                    // Reset to first down
            toGo: 10,                      // Standard 10 yards to go
            position: flippedPosition,     // Update position (flipped)
            lineOfScrimmage: flippedPosition, // Update line of scrimmage
            firstDownLine: newFirstDownLine, // Set new first down line
            possession: downs.possession === "offense" ? "defense" : "offense" // Switch possession
          },
          tacklePosition: turnoverTacklePos, // Reset tackle position
          fieldVisible: true // Ensure field is visible after turnover
        });
        
        console.log(`Possession changed after turnover on downs. New position: ${flippedPosition}`);
        return;
      }
      
      // ADVANCE TO NEXT DOWN: Didn't get first down but still have downs left
      // Calculate new yards to go by subtracting yards gained from previous yards to go
      const yardsToGo = Math.max(1, downs.firstDownLine - newPosition);
      console.log(`${downs.current + 1} DOWN AND ${yardsToGo} TO GO!`);
      
      set({
        downs: {
          ...downs,
          current: downs.current + 1,     // Increment the down
          toGo: yardsToGo,                // Update yards needed for first down
          position: newPosition,          // Update position
          lineOfScrimmage: newPosition    // Update line of scrimmage
        },
        fieldVisible: true // Ensure field is visible after advancing down
      });
    },
    // Football related actions
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
      console.log(`Checking possession for ${playerId}: ${hasBall ? 'Has ball' : 'No ball'}`);
      return hasBall;
    },
    getFootballByOwner: (ownerId) => {
      const { footballs } = get();
      const football = footballs.find(f => f.ownerId === ownerId);
      console.log(`Getting football for owner ${ownerId}:`, football);
      return football;
    }
  }
}));