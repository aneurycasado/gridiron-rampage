import React from 'react';
import { useStore } from '../store';

export const GameOver = ({ score, winner }) => {
  const { actions } = useStore();
  
  const handlePlayAgain = () => {
    // Reset the game state
    actions.resetDowns();
    actions.setGamePhase('pregame');
    
    // Navigate back to start screen
    actions.setGameStarted(false);
  };
  
  return (
    <div className="game-over">
      <div className="game-over-container">
        <h1>GAME OVER</h1>
        
        <div className="final-score">
          <h2>FINAL SCORE</h2>
          <div className="score-display">
            <div className="team">
              <h3>HOME</h3>
              <span className="score">{score.home}</span>
            </div>
            <div className="divider">-</div>
            <div className="team">
              <h3>AWAY</h3>
              <span className="score">{score.away}</span>
            </div>
          </div>
        </div>
        
        <div className="result-message">
          {winner === 'home' ? (
            <h2 className="win-message">YOU WIN!</h2>
          ) : (
            <h2 className="loss-message">YOU LOSE!</h2>
          )}
          
          <p className="game-summary">
            {winner === 'home' 
              ? `Congratulations! You defeated the opponent ${score.home}-${score.away}.` 
              : `Tough luck! The opponent won ${score.away}-${score.home}.`}
          </p>
        </div>
        
        <div className="game-over-buttons">
          <button className="play-again-button" onClick={handlePlayAgain}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
};