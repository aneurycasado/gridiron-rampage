import { useStore } from "./components/store";

export const HUD = () => {
  const { gameStarted, ragePoints, rageMode, score, downs, actions } = useStore();
  
  const handleRageActivation = () => {
    actions.activateRageMode();
  };

  if (!gameStarted) return null;

  return (
    <div className="hud">
      <div>
        <span>Score: {score.player} - {score.opponent}</span>
        <div>Down: {downs.current} | To Go: {downs.toGo}</div>
        <div>
          Rage Meter:
          <div style={{ position: "relative", width: "100%", height: "20px", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "5px" }}>
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
              onClick={handleRageActivation}
              style={{ 
                padding: "5px", 
                marginTop: "5px",
                backgroundColor: "rgba(255,0,0,0.8)",
                border: "none",
                color: "white",
                borderRadius: "3px"
              }}
            >
              ACTIVATE RAGE MODE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};