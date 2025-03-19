import React, { useEffect, useState } from 'react';
import { useStore } from './store';

export const PlayEndedMessage = () => {
  const { gameStarted, playActive, playEnded, downs, actions } = useStore();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  
  // Handle key press to reset play
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && playEnded) {
      actions.resetPlay();
    }
  };

  // Generate appropriate message based on down situation
  useEffect(() => {
    if (playEnded) {
      let endMessage = "";
      
      // Check for touchdown
      if (downs.position >= 100) {
        endMessage = "TOUCHDOWN!";
      }
      // Check for first down
      else if (downs.current === 1 && downs.position >= downs.firstDownLine) {
        endMessage = "FIRST DOWN!";
      }
      // Check for turnover on downs (current === 1 means it just turned over from 4th down)
      else if (downs.current === 1 && downs.possession === "defense") {
        endMessage = "TURNOVER ON DOWNS!";
      }
      // Regular down message
      else {
        endMessage = `${getOrdinalSuffix(downs.current)} DOWN, ${Math.max(1, Math.round(downs.toGo))} TO GO!`;
      }
      
      setMessage(endMessage);
    }
  }, [playEnded, downs]);
  
  // Helper for ordinal suffix
  const getOrdinalSuffix = (num) => {
    const j = num % 10,
          k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };
  
  useEffect(() => {
    // Only show when play has ended
    if (gameStarted && !playActive && playEnded) {
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
  }, [gameStarted, playActive, playEnded]);
  
  if (!visible) return null;
  
  const messageColor = message.includes("TOUCHDOWN") 
    ? "#ffd700" // Gold for touchdown
    : message.includes("FIRST DOWN") 
      ? "#2ecc71" // Green for first down
      : message.includes("TURNOVER") 
        ? "#e74c3c" // Red for turnover
        : "#ffffff"; // White for regular downs
  
  return (
    <div className="play-ended-message">
      <div 
        className="message"
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          color: messageColor,
          padding: "15px 30px",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "24px",
          marginBottom: "20px"
        }}
      >
        {message}
      </div>
      <div className="sub-message">Press ENTER to continue</div>
    </div>
  );
};