import React, { useEffect, useState } from 'react';
import { GameController, PlayController } from '../controllers';

export const PlayCTA = () => {
  const { gameStarted } = GameController.getState();
  const { playActive, playEnded, actions } = PlayController.getState();
  const [visible, setVisible] = useState(false);
  
  // Handle play start with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!playActive && !playEnded) {
        actions.startPlay();
      } else if (playEnded) {
        actions.resetPlay();
      }
    }
  };
  
  useEffect(() => {
    // Get latest state on each render
    const gameState = GameController.getState();
    const playState = PlayController.getState();
    
    // Only show prompt when game is started but play is not active
    if (gameState.gameStarted && !playState.playActive && !playState.playEnded) {
      setVisible(true);
    } else {
      setVisible(false);
    }
    
    // Subscribe to state changes
    const unsubGame = GameController.subscribe(
      state => {
        const playState = PlayController.getState();
        if (state.gameStarted && !playState.playActive && !playState.playEnded) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    );
    
    const unsubPlay = PlayController.subscribe(
      state => {
        const gameState = GameController.getState();
        if (gameState.gameStarted && !state.playActive && !state.playEnded) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    );
    
    // Add key listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unsubGame();
      unsubPlay();
    };
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="play-cta">
      <div className="message">Press ENTER to HIKE the ball</div>
    </div>
  );
};