import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { playSound } from '../store';

export const CoinToss = () => {
  const [animation, setAnimation] = useState('');
  const [coin, setCoin] = useState('heads');
  const [userChoice, setUserChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [stage, setStage] = useState('choice'); // choice -> flipping -> result
  const { actions } = useStore();
  
  // Handle user selection
  const handleCoinChoice = (choice) => {
    setUserChoice(choice);
    
    // Play selection sound
    playSound('button_click.mp3', 0.5);
    
    // Move to flipping stage
    setStage('flipping');
    setAnimation('coin-flip');
    
    // Play coin toss sound
    playSound('coin_toss.mp3', 0.6);
    
    // Determine the result (random)
    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    
    // After animation, show result
    setTimeout(() => {
      setCoin(coinResult);
      setAnimation('coin-result');
      setStage('result');
      setResult(userChoice === coinResult ? 'win' : 'lose');
      
      // Play result sound
      playSound(userChoice === coinResult ? 'success.mp3' : 'failure.mp3', 0.5);
    }, 2000);
  };
  
  // Handle possession choice
  const handlePossessionChoice = (receiveKickoff) => {
    // Play selection sound
    playSound('button_click.mp3', 0.5);
    
    // Set possession based on player choice
    actions.setTeamPossession(receiveKickoff ? 'home' : 'away');
    
    // Reset downs to start at the 20 yard line
    actions.resetDowns();
    
    // Start game clock
    actions.startClock();
    
    // Move to play selection phase
    actions.setGamePhase('playSelection');
  };
  
  return (
    <div className="coin-toss">
      <h1>COIN TOSS</h1>
      
      {stage === 'choice' && (
        <div className="coin-choice">
          <h2>CALL IT IN THE AIR</h2>
          <div className="coin-container">
            <div className="coin heads"></div>
          </div>
          <div className="coin-buttons">
            <button onClick={() => handleCoinChoice('heads')}>HEADS</button>
            <button onClick={() => handleCoinChoice('tails')}>TAILS</button>
          </div>
        </div>
      )}
      
      {stage === 'flipping' && (
        <div className="coin-flipping">
          <div className={`coin ${animation} ${coin}`}></div>
        </div>
      )}
      
      {stage === 'result' && (
        <div className="coin-result">
          <h2>
            {result === 'win' 
              ? "YOU WON THE TOSS!" 
              : "YOU LOST THE TOSS!"}
          </h2>
          <div className={`coin ${coin}`}></div>
          
          {result === 'win' ? (
            <div className="possession-choice">
              <h3>WHAT WOULD YOU LIKE TO DO?</h3>
              <div className="possession-buttons">
                <button onClick={() => handlePossessionChoice(true)}>
                  RECEIVE KICKOFF
                </button>
                <button onClick={() => handlePossessionChoice(false)}>
                  KICK OFF
                </button>
              </div>
            </div>
          ) : (
            <div className="cpu-choice">
              <h3>OPPONENT CHOOSES TO RECEIVE</h3>
              <button onClick={() => handlePossessionChoice(false)}>
                START GAME
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};