import React from 'react';
import { useStore } from './store';

export const PauseButton = () => {
  const { gameStarted, gamePaused, actions } = useStore();
  
  // Only show the pause button when the game is started and not already paused
  if (!gameStarted || gamePaused) return null;
  
  return (
    <button 
      className="pause-control"
      onClick={() => actions.setPaused(true)}
      title="Pause Game"
    >
      <img src="/ui/icon_pause_light.png" alt="Pause" />
    </button>
  );
};