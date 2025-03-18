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
  gameStarted: false, // Game state - whether the game has started
  controls: "keyboard", // Default control type
  players: [], // Player references
  player: null, // Main player
  ragePoints: 0, // Current rage meter points
  rageMode: false, // Whether rage mode is active
  footballs: [], // Football objects in the game
  activePossession: null, // ID of player who has the ball
  score: {
    player: 0,
    opponent: 0
  },
  downs: {
    current: 1,
    toGo: 10,
    position: 20
  },
  actions: {
    setGameStarted: (gameStarted) => {
      console.log(`Setting game started to: ${gameStarted}`);
      set({ gameStarted });
    },
    setControls: (controls) => {
      set({ controls });
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
    updatePlayerPosition: (playerId, position) => {
      set((state) => ({
        players: state.players.map(p => 
          p.id === playerId 
            ? { ...p, position }
            : p
        ),
      }));
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
      const { downs } = get();
      
      // Update position
      const newPosition = downs.position + yardsGained;
      
      // Check if first down was achieved
      if (yardsGained >= downs.toGo) {
        set({
          downs: {
            current: 1,
            toGo: 10,
            position: newPosition
          }
        });
      } else if (downs.current === 4) {
        // Turnover on downs
        set({
          downs: {
            current: 1,
            toGo: 10,
            position: 100 - newPosition // Flip field position
          }
        });
      } else {
        // Increment down
        set({
          downs: {
            current: downs.current + 1,
            toGo: downs.toGo - yardsGained,
            position: newPosition
          }
        });
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