import React, { useEffect, useState } from 'react';
import { 
  GameController, 
  PossessionController, 
  PlayController,
  QuarterController
} from '../controllers';

export const HUD = () => {
  // Game state from controllers
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [downs, setDowns] = useState({
    current: 1,
    toGo: 10,
    position: 20,
    firstDownLine: 30
  });
  const [gameTime, setGameTime] = useState(900);
  const [quarter, setQuarter] = useState(1);
  const [rage, setRage] = useState(0);
  const [rageMode, setRageMode] = useState(false);
  const [playActive, setPlayActive] = useState(false);

  // Update HUD when game state changes
  useEffect(() => {
    const gameInterval = setInterval(() => {
      // Get data from controllers
      const gameState = GameController.getState();
      const possessionState = PossessionController.getState();
      const playState = PlayController.getState();
      const quarterState = QuarterController.getState();
      
      // Update component state
      setScore(gameState.score);
      setQuarter(gameState.quarter);
      setGameTime(quarterState.quarterTime);
      setRage(playState.ragePoints);
      setRageMode(playState.rageMode);
      setPlayActive(playState.playActive);
      
      setDowns({
        current: possessionState.current,
        toGo: possessionState.toGo,
        position: possessionState.position,
        firstDownLine: possessionState.firstDownLine
      });
    }, 100);
    
    return () => clearInterval(gameInterval);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get position description (e.g., "OWN 20", "OPP 30")
  const getPositionDescription = () => {
    if (downs.position < 50) {
      return `OWN ${downs.position}`;
    } else {
      return `OPP ${100 - downs.position}`;
    }
  };

  return (
    <div className="hud-container" style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0,
      padding: '10px', 
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Score Bar */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '5px',
        padding: '5px 15px'
      }}>
        <div>Q{quarter} - {formatTime(gameTime)}</div>
        <div style={{ fontWeight: 'bold' }}>
          HOME {score.player} - {score.opponent} AWAY
        </div>
        <div>
          {downs.current}
          <sup>
            {downs.current === 1 ? 'ST' : downs.current === 2 ? 'ND' : downs.current === 3 ? 'RD' : 'TH'}
          </sup>
          &nbsp;&amp; {downs.toGo} @ {getPositionDescription()}
        </div>
      </div>
      
      {/* Rage Meter */}
      <div style={{ 
        width: '200px',
        height: '10px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '5px',
        margin: '10px 0',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${rage}%`,
          height: '100%',
          background: rageMode ? '#ff0000' : '#ffcc00',
          transition: 'width 0.2s ease'
        }}></div>
      </div>
      
      {/* Display "RAGE MODE" when active */}
      {rageMode && (
        <div style={{
          color: '#ff0000',
          fontWeight: 'bold',
          fontSize: '18px',
          animation: 'pulse 1s infinite'
        }}>
          RAGE MODE
        </div>
      )}
    </div>
  );
};