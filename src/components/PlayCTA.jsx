import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import PlaySelectionMenu from './plays/PlaySelectionMenu';

export const PlayCTA = () => {
  const { gameStarted, downs, playActive, playEnded, plays, actions } = useStore();
  const [visible, setVisible] = useState(false);
  
  // Handle play start with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!playActive && !playEnded) {
        if (plays.selectedOffensivePlay || plays.selectedDefensivePlay) {
          // If a play is selected, start it
          console.log("HIKE! Starting play from key press");
          // Play a hike sound
          try {
            const audio = new Audio('/sounds/hike.mp3');
            audio.volume = 0.7;
            audio.play().catch(e => console.log("Audio play error:", e));
          } catch (e) {
            console.error("Error playing hike sound:", e);
          }
          actions.startPlay();
        } else {
          // Otherwise show the playbook
          actions.togglePlaybook(true);
        }
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
  }, [gameStarted, playActive, playEnded, plays.selectedOffensivePlay, plays.selectedDefensivePlay]);
  
  // Don't show when game hasn't started
  if (!gameStarted) return null;
  
  // When showPlaybook is true, show the play selection menu
  if (plays.showPlaybook) {
    return (
      <PlaySelectionMenu 
        onPlaySelected={(play) => {
          actions.selectPlay(play, downs.possession === 'offense');
          // Don't automatically start the play - wait for user to press HIKE
          actions.togglePlaybook(false);
        }}
        onClose={() => actions.togglePlaybook(false)}
      />
    );
  }
  
  // If not visible or playbook is showing, don't render the button
  if (!visible) return null;
  
  return (
    <div className="play-cta">
      {plays.selectedOffensivePlay || plays.selectedDefensivePlay ? (
        // If play is selected, show hike button
        <div 
          className="message hike-button"
          onClick={() => {
            console.log("HIKE! Starting play from button click");
            // Play a hike sound
            try {
              const audio = new Audio('/sounds/hike.mp3');
              audio.volume = 0.7;
              audio.play().catch(e => console.log("Audio play error:", e));
            } catch (e) {
              console.error("Error playing hike sound:", e);
            }
            actions.startPlay();
          }}
          style={{
            cursor: 'pointer',
            backgroundColor: 'rgba(0, 100, 0, 0.7)',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          HIKE! (Press ENTER)
        </div>
      ) : (
        // Otherwise show play selection button
        <button 
          className="play-button"
          onClick={() => actions.togglePlaybook(true)}
          style={{
            backgroundImage: "url('/ui/button_rectangle_depth_gradient.png')",
            backgroundSize: "100% 100%"
          }}
        >
          <img src="/ui/icon_play_light.png" alt="" />
          <span>Choose Play</span>
        </button>
      )}
    </div>
  );
};