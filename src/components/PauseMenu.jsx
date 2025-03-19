import React, { useEffect } from 'react';
import { useStore } from './store';

export const PauseMenu = () => {
  const { gamePaused, actions } = useStore();
  
  const resumeGame = () => {
    actions.setPaused(false);
  };
  
  const restartGame = () => {
    actions.setPaused(false);
    // Reset game state
    setTimeout(() => {
      actions.setGameStarted(false);
    }, 100);
  };
  
  // Add escape key listener to toggle pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        actions.togglePause();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
  
  if (!gamePaused) return null;
  
  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h2>GAME PAUSED</h2>
        
        <div className="pause-buttons">
          <button className="pause-button" onClick={resumeGame}>
            <img src="/ui/icon_play_light.png" alt="Resume" />
            <span>RESUME</span>
          </button>
          
          <button className="pause-button" onClick={restartGame}>
            <img src="/ui/icon_pause_light.png" alt="Restart" />
            <span>RESTART</span>
          </button>
        </div>
        
        <div className="pause-instructions">
          <p>Press <span>ESC</span> to resume game</p>
        </div>
      </div>
    </div>
  );
};