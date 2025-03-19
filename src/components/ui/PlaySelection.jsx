import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { playSound } from '../store';

export const PlaySelection = ({ 
  offensivePlays, 
  defensivePlays,
  currentDown, 
  yardsToGo, 
  fieldPosition,
  quarter,
  timeRemaining,
  score,
  possession,
  onPlaySelected 
}) => {
  const [selectedOffensivePlay, setSelectedOffensivePlay] = useState(null);
  const [selectedDefensivePlay, setSelectedDefensivePlay] = useState(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(30); // 30 seconds to make a play selection
  
  const isUserOffense = possession === 'home';
  
  // Countdown timer for play selection
  useEffect(() => {
    let timer;
    
    if (countdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Time's up - auto-select plays
      makePlaySelection();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdownActive, countdown]);
  
  // Start countdown when component mounts
  useEffect(() => {
    setCountdownActive(true);
    
    return () => {
      setCountdownActive(false);
    };
  }, []);
  
  // Play selection function - handles both user and AI selections
  const makePlaySelection = () => {
    let offensivePlay = selectedOffensivePlay;
    let defensivePlay = selectedDefensivePlay;
    
    // Auto-select offensive play if user is on defense or time expired
    if (!isUserOffense || !offensivePlay) {
      // Get AI offensive play selection
      offensivePlay = getAIPlaySelection(
        true, 
        fieldPosition, 
        currentDown, 
        yardsToGo, 
        quarter,
        timeRemaining
      );
    }
    
    // Auto-select defensive play if user is on offense or time expired
    if (isUserOffense || !defensivePlay) {
      // Get AI defensive play selection
      defensivePlay = getAIPlaySelection(
        false, 
        fieldPosition, 
        currentDown, 
        yardsToGo, 
        quarter,
        timeRemaining
      );
    }
    
    // Call the play selection handler with both plays
    onPlaySelected(offensivePlay, defensivePlay);
    
    // Play sound effect
    playSound('play_selected.mp3', 0.5);
  };
  
  // Helper for AI play selection (simplified version)
  const getAIPlaySelection = (isOffense, fieldPosition, down, yardsToGo) => {
    const plays = isOffense ? offensivePlays : defensivePlays;
    
    // Simple logic for demonstration - would be expanded in real implementation
    if (isOffense) {
      if (down >= 3 && yardsToGo > 5) {
        // Pass on 3rd and long
        return plays.find(p => p.id.includes('pass') && !p.id.includes('short'));
      } else if (yardsToGo <= 3) {
        // Run on short yardage
        return plays.find(p => p.id.includes('run'));
      }
    } else {
      if (down >= 3 && yardsToGo > 5) {
        // Pass defense on 3rd and long
        return plays.find(p => p.id.includes('coverage'));
      } else if (yardsToGo <= 3) {
        // Run defense on short yardage
        return plays.find(p => p.id.includes('goal_line') || p.id.includes('contain'));
      }
    }
    
    // Default - random play
    return plays[Math.floor(Math.random() * plays.length)];
  };
  
  return (
    <div className="play-selection-screen">
      <div className="game-situation">
        <div className="scoreboard">
          <span className="team">HOME: {score.home}</span>
          <span className="team">AWAY: {score.away}</span>
        </div>
        
        <div className="game-clock">
          <span>Quarter: {quarter}</span>
          <span>Time: {timeRemaining}</span>
        </div>
        
        <div className="down-and-distance">
          <span>{currentDown}{getOrdinalSuffix(currentDown)} & {yardsToGo}</span>
          <span>Ball on: {fieldPosition} yard line</span>
          <span>Possession: {possession.toUpperCase()}</span>
        </div>
        
        <div className="play-countdown">
          <span>Play Clock: {countdown}</span>
        </div>
      </div>
      
      {isUserOffense ? (
        <div className="offensive-plays">
          <h2>SELECT YOUR PLAY</h2>
          <div className="play-categories">
            <div className="category">
              <h3>Run Plays</h3>
              <div className="play-list">
                {offensivePlays.filter(p => p.id.includes('run')).map(play => (
                  <div 
                    key={play.id}
                    className={`play-option ${selectedOffensivePlay?.id === play.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOffensivePlay(play)}
                  >
                    <h4>{play.name}</h4>
                    <p>{play.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="category">
              <h3>Pass Plays</h3>
              <div className="play-list">
                {offensivePlays.filter(p => p.id.includes('pass')).map(play => (
                  <div 
                    key={play.id}
                    className={`play-option ${selectedOffensivePlay?.id === play.id ? 'selected' : ''}`}
                    onClick={() => setSelectedOffensivePlay(play)}
                  >
                    <h4>{play.name}</h4>
                    <p>{play.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            className="call-play-button"
            disabled={!selectedOffensivePlay}
            onClick={makePlaySelection}
          >
            CALL PLAY
          </button>
        </div>
      ) : (
        <div className="defensive-plays">
          <h2>SELECT YOUR DEFENSE</h2>
          <div className="play-categories">
            <div className="category">
              <h3>Run Defense</h3>
              <div className="play-list">
                {defensivePlays.filter(p => !p.id.includes('coverage')).map(play => (
                  <div 
                    key={play.id}
                    className={`play-option ${selectedDefensivePlay?.id === play.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDefensivePlay(play)}
                  >
                    <h4>{play.name}</h4>
                    <p>{play.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="category">
              <h3>Pass Defense</h3>
              <div className="play-list">
                {defensivePlays.filter(p => p.id.includes('coverage')).map(play => (
                  <div 
                    key={play.id}
                    className={`play-option ${selectedDefensivePlay?.id === play.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDefensivePlay(play)}
                  >
                    <h4>{play.name}</h4>
                    <p>{play.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            className="call-play-button"
            disabled={!selectedDefensivePlay}
            onClick={makePlaySelection}
          >
            CALL DEFENSE
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th)
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};