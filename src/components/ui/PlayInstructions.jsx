import React, { useEffect } from 'react';
import { useStore } from '../store';

export const PlayInstructions = ({ play, timeRemaining }) => {
  const { actions } = useStore();
  
  // Start gameplay when the instruction screen is dismissed
  const startPlay = () => {
    actions.setGamePhase("playing");
  };
  
  // Play "ready, set, hike" sound effect
  useEffect(() => {
    // We would play the sound here if available
    const playHikeSound = () => {
      try {
        const audio = new Audio('/sounds/hike.mp3');
        audio.volume = 0.7;
        audio.play().catch(e => console.log("Audio play error:", e));
      } catch (e) {
        console.error("Error playing hike sound:", e);
      }
    };
    
    // Play sound after a short delay
    const timer = setTimeout(() => {
      playHikeSound();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!play) {
    return <div className="loading-instructions">Loading play instructions...</div>;
  }
  
  return (
    <div className="play-instructions">
      <div className="instructions-container">
        <h1>{play.name}</h1>
        
        <div className="play-timer">
          <span>Play starts in: </span>
          <span className="countdown">{timeRemaining}</span>
          <span> seconds</span>
        </div>
        
        <div className="controls-guide">
          <h2>HOW TO EXECUTE THIS PLAY</h2>
          <p>{play.instruction}</p>
          
          <div className="key-controls">
            <div className="key-group">
              <div className="key">W</div>
              <div className="key-row">
                <div className="key">A</div>
                <div className="key">S</div>
                <div className="key">D</div>
              </div>
              <p>Movement</p>
            </div>
            
            {play.id.includes('pass') && (
              <div className="key-group">
                <div className="key">F</div>
                <p>Throw/Catch</p>
              </div>
            )}
            
            {(play.id === 'outside_run' || play.id === 'trick_run') && (
              <div className="key-group">
                <div className="key">E</div>
                <p>Spin Move</p>
              </div>
            )}
            
            {play.id === 'trick_run' && (
              <div className="key-group">
                <div className="key">Q</div>
                <p>Juke Move</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="play-objective">
          <h3>OBJECTIVE</h3>
          <p>Gain as many yards as possible within the time limit.</p>
          {play.id.includes('pass') && 
            <p>First throw the ball (F) then control the receiver to catch and run.</p>
          }
        </div>
        
        <button className="start-play-button" onClick={startPlay}>
          START PLAY NOW
        </button>
      </div>
    </div>
  );
};