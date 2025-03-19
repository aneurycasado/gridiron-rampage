import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import offensivePlays from './OffensivePlays';
import defensivePlays from './DefensivePlays';
import { suggestPlays } from './PlayBook';

// Play selection menu component
export const PlaySelectionMenu = ({ onPlaySelected, onClose }) => {
  const { downs, playActive } = useStore();
  const [selectedPlayType, setSelectedPlayType] = useState('all');
  const [filteredPlays, setFilteredPlays] = useState([]);
  const [suggestedPlays, setSuggestedPlays] = useState([]);
  const [selectedPlay, setSelectedPlay] = useState(null);
  
  // Filter plays based on selected type
  useEffect(() => {
    // Use offensive or defensive plays based on possession
    const availablePlays = downs.possession === 'offense' 
      ? offensivePlays 
      : defensivePlays;
    
    // Generate situation-based play suggestions
    const gameState = { downs };
    const suggested = suggestPlays(gameState, availablePlays, 3);
    setSuggestedPlays(suggested);
    
    // Filter plays by type if needed
    if (selectedPlayType === 'all') {
      setFilteredPlays(availablePlays);
    } else {
      setFilteredPlays(availablePlays.filter(play => play.type === selectedPlayType));
    }
  }, [downs, selectedPlayType]);
  
  // Don't show menu if play is active
  if (playActive) return null;
  
  // Handle play selection
  const handlePlaySelect = (play) => {
    setSelectedPlay(play);
  };
  
  // Handle play confirmation
  const handlePlayConfirm = () => {
    if (selectedPlay) {
      onPlaySelected(selectedPlay);
      onClose();
    }
  };
  
  return (
    <div className="play-selection-menu">
      <div className="play-menu-header">
        <h2>{downs.possession === 'offense' ? 'Offensive' : 'Defensive'} Play Selection</h2>
        <div className="game-situation">
          <span>{downs.current}<sup>{getOrdinalSuffix(downs.current)}</sup> & {downs.toGo}</span>
          <span>Ball on {downs.position} yard line</span>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="play-filter-tabs">
        <button 
          className={selectedPlayType === 'all' ? 'active' : ''}
          onClick={() => setSelectedPlayType('all')}
        >
          All Plays
        </button>
        
        {downs.possession === 'offense' ? (
          <>
            <button 
              className={selectedPlayType === 'run' ? 'active' : ''}
              onClick={() => setSelectedPlayType('run')}
            >
              Run
            </button>
            <button 
              className={selectedPlayType === 'pass' ? 'active' : ''}
              onClick={() => setSelectedPlayType('pass')}
            >
              Pass
            </button>
          </>
        ) : (
          <>
            <button 
              className={selectedPlayType === 'zone' ? 'active' : ''}
              onClick={() => setSelectedPlayType('zone')}
            >
              Zone
            </button>
            <button 
              className={selectedPlayType === 'man' ? 'active' : ''}
              onClick={() => setSelectedPlayType('man')}
            >
              Man
            </button>
            <button 
              className={selectedPlayType === 'blitz' ? 'active' : ''}
              onClick={() => setSelectedPlayType('blitz')}
            >
              Blitz
            </button>
          </>
        )}
      </div>
      
      <div className="suggested-plays">
        <h3>Suggested Plays</h3>
        <div className="play-grid">
          {suggestedPlays.map(play => (
            <PlayCard 
              key={play.id}
              play={play}
              isSelected={selectedPlay?.id === play.id}
              onClick={() => handlePlaySelect(play)}
              isSuggested={true}
            />
          ))}
        </div>
      </div>
      
      <div className="available-plays">
        <h3>All Plays</h3>
        <div className="play-grid">
          {filteredPlays.map(play => (
            <PlayCard 
              key={play.id}
              play={play}
              isSelected={selectedPlay?.id === play.id}
              onClick={() => handlePlaySelect(play)}
            />
          ))}
        </div>
      </div>
      
      <div className="play-selection-footer">
        <button 
          className="confirm-button"
          disabled={!selectedPlay}
          onClick={handlePlayConfirm}
        >
          {selectedPlay ? `Run "${selectedPlay.name}"` : 'Select a Play'}
        </button>
      </div>
    </div>
  );
};

// Individual play card component
const PlayCard = ({ play, isSelected, onClick, isSuggested = false }) => {
  return (
    <div 
      className={`play-card ${isSelected ? 'selected' : ''} ${isSuggested ? 'suggested' : ''}`}
      onClick={onClick}
    >
      <div className="play-card-header">
        <h4>{play.name}</h4>
        <span className="play-type">{play.type}</span>
      </div>
      
      <div className="play-card-formation">
        {play.formation.name}
      </div>
      
      <div className="play-card-difficulty">
        <span>Difficulty: </span>
        {Array.from({ length: play.difficultyLevel }).map((_, i) => (
          <span key={i} className="star">★</span>
        ))}
      </div>
      
      <p className="play-description">{play.description}</p>
      
      {isSuggested && (
        <div className="suggested-badge">Coach's Pick</div>
      )}
    </div>
  );
};

// Helper for ordinal suffix
const getOrdinalSuffix = (num) => {
  const j = num % 10,
        k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

export default PlaySelectionMenu;