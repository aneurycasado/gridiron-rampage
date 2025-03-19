import React, { useEffect, useState } from 'react';
import { playSound } from '../store';

export const PlayOutcome = ({ result, onContinue }) => {
  const [animation, setAnimation] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    if (result) {
      // Play appropriate sound based on outcome
      if (result.downResult?.result === 'touchdown') {
        playSound('touchdown.mp3', 0.7);
      } else if (result.success && result.yardsGained > 15) {
        playSound('big_play.mp3', 0.6);
      } else if (result.success) {
        playSound('success.mp3', 0.5);
      } else {
        playSound('failure.mp3', 0.5);
      }
      
      // Set animation class based on outcome
      if (result.downResult?.result === 'touchdown') {
        setAnimation('touchdown-animation');
      } else if (result.success && result.yardsGained > 15) {
        setAnimation('big-gain-animation');
      } else if (result.success) {
        setAnimation('success-animation');
      } else {
        setAnimation('failure-animation');
      }
      
      // Show detailed results after a brief delay
      const timer = setTimeout(() => {
        setShowDetails(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [result]);
  
  if (!result) {
    return <div className="play-outcome-loading">Processing play...</div>;
  }
  
  // Get the main outcome description
  let outcomeDescription = '';
  if (result.downResult?.result === 'touchdown') {
    outcomeDescription = 'TOUCHDOWN!';
  } else if (result.downResult?.result === 'firstDown') {
    outcomeDescription = 'FIRST DOWN';
  } else if (result.downResult?.result === 'turnover') {
    outcomeDescription = 'TURNOVER ON DOWNS';
  } else {
    outcomeDescription = `Gain of ${result.yardsGained} yards`;
  }
  
  return (
    <div className={`play-outcome ${animation}`}>
      <div className="outcome-main">
        <h2 className="play-call">
          {result.playCalled} vs. {result.defenseUsed}
        </h2>
        
        <div className="outcome-result">
          <h1>{outcomeDescription}</h1>
        </div>
        
        {showDetails && (
          <div className="outcome-details">
            <p className="narrative">{result.narrative}</p>
            
            <div className="stat-line">
              <div>
                <label>Play Type:</label>
                <span>{result.playType.toUpperCase()}</span>
              </div>
              <div>
                <label>Success:</label>
                <span>{result.success ? 'YES' : 'NO'}</span>
              </div>
              <div>
                <label>Yards:</label>
                <span>{result.yardsGained}</span>
              </div>
            </div>
            
            <div className="next-down">
              {result.downResult?.result !== 'touchdown' && 
               result.downResult?.result !== 'turnover' && (
                <p>
                  Next: {getDownText(result.downResult)} &amp; {result.downResult?.toGo}
                </p>
              )}
              
              {result.downResult?.result === 'turnover' && (
                <p>Change of possession. Defense takes over.</p>
              )}
              
              {result.downResult?.result === 'touchdown' && (
                <p>Touchdown! 7 points awarded.</p>
              )}
            </div>
            
            <button className="continue-button" onClick={onContinue}>
              CONTINUE
            </button>
          </div>
        )}
      </div>
      
      {/* Visual play animation could go here */}
      <div className="play-visualization">
        {/* Football field visualization */}
      </div>
    </div>
  );
};

// Helper function to get ordinal down text
const getDownText = (downResult) => {
  if (!downResult) return '';
  
  const down = downResult.current || 1;
  
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