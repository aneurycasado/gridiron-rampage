import React, { useEffect, useState } from 'react';
import { useStore } from './store';

export const PlayCTA = () => {
  const { gameStarted, playActive, playEnded, actions } = useStore();
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
    // Only show prompt when game is started but play is not active
    if (gameStarted && !playActive && !playEnded) {
      setVisible(true);
    } else {
      setVisible(false);
    }
    
    // Add key listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, playActive, playEnded, actions]);
  
  if (!visible) return null;
  
  return (
    <div className="play-cta">
      <div className="message">Press ENTER to HIKE the ball</div>
    </div>
  );
};