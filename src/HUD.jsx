import { useStore } from "./components/store";
import { useState, useEffect } from "react";

export const HUD = () => {
  const { 
    gameStarted, 
    gamePaused,
    gamePhase,
    ragePoints, 
    rageMode, 
    score, 
    downs, 
    gameTime,
    currentTeamPossession,
    actions 
  } = useStore();
  
  const [timeDisplay, setTimeDisplay] = useState('12:00');
  
  // Format time display
  useEffect(() => {
    if (gameTime?.time) {
      const minutes = Math.floor(gameTime.time / 60);
      const seconds = gameTime.time % 60;
      setTimeDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [gameTime?.time]);
  
  const handleRageActivation = () => {
    actions.activateRageMode();
  };
  
  // Don't show HUD on these phases
  if (!gameStarted || gamePhase === 'coinToss' || gamePhase === 'playSelection' || gamePhase === 'playOutcome' || gamePhase === 'endGame') return null;

  return (
    <div className="hud">
      <div className="hud-container">
        <div className="hud-top">
          <div className="scoreboard">
            <div className="team-score">
              <span className="team-name">HOME</span>
              <span className="score-value">{score.home}</span>
            </div>
            <div className="game-time">
              <div className="quarter">QTR {gameTime.quarter}</div>
              <div className="time">{timeDisplay}</div>
            </div>
            <div className="team-score">
              <span className="team-name">AWAY</span>
              <span className="score-value">{score.away}</span>
            </div>
          </div>
        </div>
        
        <div className="hud-bottom">
          <div className="game-situation">
            <div className="down-indicator">
              <span className="down">{getDownText(downs.current)}</span>
              <span className="distance">&amp; {downs.toGo}</span>
            </div>
            <div className="field-position">
              <span>Ball on {downs.position} YD</span>
            </div>
            <div className="possession-indicator">
              <span>Possession: {currentTeamPossession.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="rage-meter-container">
            <label>RAGE</label>
            <div className="rage-meter">
              <div 
                className={`rage-fill ${rageMode ? 'active' : ''}`}
                style={{ width: `${ragePoints}%` }}
              ></div>
            </div>
            {ragePoints >= 100 && !rageMode && (
              <button 
                className="rage-button"
                onClick={handleRageActivation}
              >
                ACTIVATE RAGE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get ordinal down text
const getDownText = (down) => {
  switch (down) {
    case 1:
      return '1st Down';
    case 2:
      return '2nd Down';
    case 3:
      return '3rd Down';
    case 4:
      return '4th Down';
    default:
      return `${down}th Down`;
  }
};