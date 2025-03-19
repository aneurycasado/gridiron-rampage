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

export const useStore = create((set, get) => ({
  // Game state
  gameStarted: false,
  gamePaused: false,
  gamePhase: "pregame", // pregame, coinToss, playSelection, playExecution, playing, playOutcome, endGame
  controls: "keyboard",
  
  // Teams and players
  players: [],
  player: null,
  teams: {
    home: {
      name: "Home Team",
      players: [],
      coach: "Coach Home"
    },
    away: {
      name: "Away Team",
      players: [],
      coach: "Coach Away"
    }
  },
  
  // Game mechanics
  ragePoints: 0,
  rageMode: false,
  footballs: [],
  activePossession: null,
  
  // Football rules state
  score: {
    home: 0,
    away: 0
  },
  downs: {
    current: 1,
    toGo: 10,
    position: 20
  },
  
  // Game clock
  gameTime: {
    quarter: 1, 
    time: 720, // 12 minutes in seconds
    clockRunning: false
  },
  
  // Play selection
  currentTeamPossession: "home",
  selectedOffensivePlay: null,
  selectedDefensivePlay: null,
  playResult: null,
  
  // Player tracking for interactive gameplay
  playerStats: {
    startingYardLine: 0,
    yardsGained: 0,
    playPerformance: 1.0,
    successfulMoves: 0
  },
  
  actions: {
    // Game state management
    setGameStarted: (gameStarted) => {
      console.log(`Setting game started to: ${gameStarted}`);
      set({ gameStarted });
    },
    setGamePhase: (gamePhase) => {
      console.log(`Setting game phase to: ${gamePhase}`);
      set({ gamePhase });
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
    
    // Player management
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
      set((state) => ({
        players: state.players.map(p => 
          p.id === playerId 
            ? { ...p, position, rotation }
            : p
        ),
      }));
    },
    setPlayer: (player) => {
      set({ player });
    },
    
    // Game clock management
    startClock: () => {
      set(state => ({
        gameTime: {
          ...state.gameTime,
          clockRunning: true
        }
      }));
    },
    stopClock: () => {
      set(state => ({
        gameTime: {
          ...state.gameTime,
          clockRunning: false
        }
      }));
    },
    updateClock: (seconds) => {
      set(state => {
        // Calculate new time
        let newTime = state.gameTime.time - seconds;
        let newQuarter = state.gameTime.quarter;
        
        // Handle quarter changes
        if (newTime <= 0) {
          newQuarter += 1;
          newTime = 720; // Reset to 12 minutes for new quarter
          
          // If game is over (4 quarters completed)
          if (newQuarter > 4) {
            return {
              gamePhase: "endGame",
              gameTime: {
                ...state.gameTime,
                quarter: 4,
                time: 0,
                clockRunning: false
              }
            };
          }
          
          // Pause clock between quarters
          return {
            gameTime: {
              quarter: newQuarter,
              time: newTime,
              clockRunning: false
            }
          };
        }
        
        // Regular time update
        return {
          gameTime: {
            ...state.gameTime,
            time: newTime
          }
        };
      });
    },
    
    // Team and possession management
    setTeamPossession: (team) => {
      set({ currentTeamPossession: team });
    },
    flipTeamPossession: () => {
      const { currentTeamPossession } = get();
      const newTeam = currentTeamPossession === "home" ? "away" : "home";
      set({ currentTeamPossession: newTeam });
    },
    
    // Score and downs management
    addScore: (team, points) => {
      set((state) => ({
        score: {
          ...state.score,
          [team]: state.score[team] + points
        }
      }));
    },
    resetDowns: () => {
      set({
        downs: {
          current: 1,
          toGo: 10,
          position: 20 // Starting at the 20 yard line
        }
      });
    },
    advanceDown: (yardsGained) => {
      const { downs, currentTeamPossession } = get();
      
      // Update position
      const newPosition = downs.position + yardsGained;
      
      // Check if touchdown (reached opponent's end zone at 100 yards)
      if (newPosition >= 100) {
        // Score touchdown
        get().actions.addScore(currentTeamPossession, 7);
        
        // Reset position to the 20 yard line, change possession, reset downs
        set({
          downs: {
            current: 1,
            toGo: 10,
            position: 20
          }
        });
        
        // Change possession
        get().actions.flipTeamPossession();
        
        return { result: "touchdown", yards: yardsGained };
      }
      
      // Check if first down was achieved
      if (yardsGained >= downs.toGo) {
        set({
          downs: {
            current: 1,
            toGo: 10,
            position: newPosition
          }
        });
        
        return { result: "firstDown", yards: yardsGained };
      } else if (downs.current === 4) {
        // Turnover on downs
        set({
          downs: {
            current: 1,
            toGo: 10,
            position: 100 - newPosition // Flip field position
          }
        });
        
        // Change possession
        get().actions.flipTeamPossession();
        
        return { result: "turnover", yards: yardsGained };
      } else {
        // Increment down
        set({
          downs: {
            current: downs.current + 1,
            toGo: downs.toGo - yardsGained,
            position: newPosition
          }
        });
        
        return { result: "downAdvanced", yards: yardsGained };
      }
    },
    
    // Play selection management
    selectOffensivePlay: (play) => {
      set({ selectedOffensivePlay: play });
    },
    selectDefensivePlay: (play) => {
      set({ selectedDefensivePlay: play });
    },
    setPlayResult: (result) => {
      set({ playResult: result });
    },
    resetPlaySelection: () => {
      set({
        selectedOffensivePlay: null,
        selectedDefensivePlay: null,
        playResult: null
      });
    },
    
    // Player performance tracking
    setPlayerStartingYardLine: (yardLine) => {
      set(state => ({
        playerStats: {
          ...state.playerStats,
          startingYardLine: yardLine
        }
      }));
    },
    updatePlayerYardsGained: (yards) => {
      set(state => ({
        playerStats: {
          ...state.playerStats,
          yardsGained: yards
        }
      }));
    },
    setPlayerPerformance: (performance) => {
      set(state => ({
        playerStats: {
          ...state.playerStats,
          playPerformance: performance
        }
      }));
    },
    incrementSuccessfulMoves: () => {
      set(state => ({
        playerStats: {
          ...state.playerStats,
          successfulMoves: state.playerStats.successfulMoves + 1
        }
      }));
    },
    resetPlayerStats: () => {
      set({
        playerStats: {
          startingYardLine: 0,
          yardsGained: 0,
          playPerformance: 1.0,
          successfulMoves: 0
        }
      });
    },
    
    // Rage mode (for special abilities)
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
      set((state) => ({
        footballs: state.footballs.filter((f) => f.id !== footballId),
      }));
    },
    getFootball: (footballId) => {
      const { footballs } = get();
      return footballs.find((f) => f.id === footballId);
    },
    updateFootballPosition: ({ id, position }) => {
      set((state) => ({
        footballs: state.footballs.map((f) => 
          f.id === id ? { ...f, position } : f
        ),
      }));
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