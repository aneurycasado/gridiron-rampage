import { useStore } from "./components/store";

export const HUD = () => {
  const { gameStarted, ragePoints, rageMode, score, downs, actions } = useStore();
  
  const handleRageActivation = () => {
    actions.activateRageMode();
  };

  if (!gameStarted) return null;

  // Calculate field position text (yards to goal)
  const yardsToGoal = 100 - downs.position;
  const fieldPositionText = downs.position < 50 
    ? `Own ${downs.position} (${yardsToGoal} yds to goal)` 
    : downs.position > 50 
      ? `Opponent ${100 - downs.position} (${yardsToGoal} yds to goal)` 
      : `50 Yard Line (${yardsToGoal} yds to goal)`;

  // Determine possession display
  const possessionDisplay = downs.possession === "offense" ? "Offense" : "Defense";
  
  // Determine possession color
  const possessionColor = downs.possession === "offense" ? "#3498db" : "#e74c3c";
  
  // Ordinal suffix for down display
  const getOrdinalSuffix = (num) => {
    const j = num % 10,
          k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  // Calculate yards to first down
  const yardsToFirstDown = downs.firstDownLine - downs.position;

  return (
    <div className="hud">
      <div>
        {/* Score display with UI panel background */}
        <div className="hud-panel" style={{backgroundColor: "rgba(0, 0, 0, 0.6)"}}>
          <div className="hud-score">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{score.player} - {score.opponent}</span>
          </div>
          
          <div className="possession-indicator" style={{backgroundColor: possessionColor}}>
            <span>{possessionDisplay}</span>
          </div>
        </div>
        
        {/* Down and distance display */}
        <div className="hud-panel" style={{backgroundColor: "rgba(0, 0, 0, 0.6)"}}>
          <div className="down-indicator">
            <span className="hud-label">{getOrdinalSuffix(downs.current)} DOWN</span>
            <span className="hud-value">{downs.toGo} TO GO</span>
          </div>
          
          <div className="field-position">
            <span>{fieldPositionText}</span>
          </div>
          
          {/* First down line indicator */}
          <div className="first-down-indicator">
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.85rem',
                marginTop: '4px',
                color: '#2ecc71'
              }}
            >
              <span style={{marginRight: '5px'}}>1st Down Line:</span>
              <span style={{fontWeight: 'bold'}}>{downs.firstDownLine} yd line ({Math.max(0, Math.round(yardsToFirstDown))} to go)</span>
            </div>
          </div>
        </div>
        
        {/* Rage meter */}
        <div className="hud-panel" style={{backgroundColor: "rgba(0, 0, 0, 0.6)"}}>
          <div className="rage-meter-label">
            <span>RAGE METER</span>
          </div>
          <div className="rage-meter-container">
            <div 
              className="rage-meter"
              style={{ 
                width: `${ragePoints}%`,
                backgroundColor: rageMode ? "rgba(255,215,0,0.8)" : "rgba(255,0,0,0.7)"
              }}
            />
          </div>
          {ragePoints >= 100 && !rageMode && (
            <button 
              className="rage-button"
              onClick={handleRageActivation}
              style={{backgroundColor: "#27ae60"}}
            >
              ACTIVATE RAGE MODE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};