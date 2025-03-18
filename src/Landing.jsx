import { useStore } from "./components/store";
import { useEffect, useRef, useState } from "react";

export const Landing = () => {
  const { gameStarted, actions } = useStore();
  const [setupStatus, setSetupStatus] = useState(0);
  const [controlType, setControlType] = useState("keyboard"); // Default to keyboard
  
  const logo = useRef();
  const startButton = useRef();
  
  // Simple direct start game function to ensure reliability
  const startGame = () => {
    console.log("Starting game with controls:", controlType);
    actions.setControls(controlType);
    actions.setGameStarted(true);
  };
  
  const goToControlsScreen = () => {
    console.log("Going to controls screen");
    setSetupStatus(1);
  };
  
  useEffect(() => {
    // Add a listener for Enter key
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        if (setupStatus === 0) {
          goToControlsScreen();
        } else if (setupStatus === 1 && controlType) {
          startGame();
        }
      }
    };
    
    document.body.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
    };
  }, [setupStatus, controlType]);
  
  // Debug feedback on game state
  useEffect(() => {
    console.log("Game started state:", gameStarted);
  }, [gameStarted]);
  
  // This is important - return null if game has started to not show the landing page
  if (gameStarted) {
    console.log("Landing page hiding - game is started");
    return null;
  }
  
  return (
    <>
      {setupStatus === 0 && (
        <div className="home">
          {/* Background field markings */}
          <div className="field-markings">
            <div className="yard-line"></div>
            <div className="yard-line"></div>
            <div className="yard-line"></div>
            <div className="yard-line"></div>
            <div className="yard-line"></div>
          </div>
          
          <div className="logo">
            <img ref={logo} src="/logo.svg" alt="Gridiron Rampage Logo" />
          </div>
          
          <div className="tagline">
            <p>The Ultimate Street Football Experience</p>
          </div>
          
          <div className="start" ref={startButton}>
            <button 
              className="start-button"
              onClick={goToControlsScreen}
              autoFocus
            >
              KICK OFF
            </button>
          </div>
          
          <div className="instructions">
            <p>Press <span>ENTER</span> or click the button to start</p>
          </div>
        </div>
      )}
      
      {setupStatus === 1 && (
        <div className="home">
          <div className="glassy">
            <h1>CHOOSE YOUR CONTROL STYLE</h1>
            
            <div className="articles">
              <div 
                className={controlType === "keyboard" ? "article selected" : "article"}
                onClick={() => setControlType("keyboard")}
              >
                <img src="/images/keyboard.png" alt="keyboard" />
                <div className="article_label">
                  <p>Keyboard</p>
                </div>
                
                <div className="control-info">
                  <ul>
                    <li>WASD/Arrows: Move</li>
                    <li>Space: Jump</li>
                    <li>Q: Juke</li>
                    <li>E: Spin</li>
                    <li>F: Tackle/Pickup Ball</li>
                    <li>R: Lateral Pass</li>
                    <li>Ctrl: Showboat</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="submit">
              <button
                className="submit-button"
                onClick={startGame}
              >
                START GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};