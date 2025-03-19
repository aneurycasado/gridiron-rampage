import { useStore } from "./components/store";
import { useEffect, useRef, useState } from "react";

export const Landing = () => {
  const { gameStarted, actions } = useStore();
  const [setupStatus, setSetupStatus] = useState(0);
  const [controlType, setControlType] = useState("keyboard");
  const [animationPlayed, setAnimationPlayed] = useState(false);
  
  const logo = useRef();
  const startButton = useRef();
  const fieldRef = useRef();
  
  // Start game function
  const startGame = () => {
    console.log("Starting game with controls:", controlType);
    actions.setControls(controlType);
    actions.setGameStarted(true);
  };
  
  const goToControlsScreen = () => {
    console.log("Going to controls screen");
    setSetupStatus(1);
  };
  
  // Trigger intro animation once on component mount
  useEffect(() => {
    if (!animationPlayed) {
      setTimeout(() => {
        setAnimationPlayed(true);
      }, 100);
    }
    
    // Field parallax effect
    const handleMouseMove = (e) => {
      if (fieldRef.current) {
        const x = (window.innerWidth / 2 - e.clientX) / 100;
        const y = (window.innerHeight / 2 - e.clientY) / 100;
        fieldRef.current.style.transform = `perspective(800px) rotateX(60deg) translateX(${x}px) translateY(${y}px)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [animationPlayed]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        if (setupStatus === 0) {
          goToControlsScreen();
        } else if (setupStatus === 1 && controlType) {
          startGame();
        }
      } else if (event.key === 'Escape' && setupStatus === 1) {
        // Go back to main menu when pressing Escape on controls screen
        setSetupStatus(0);
      }
    };
    
    document.body.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
    };
  }, [setupStatus, controlType]);
  
  if (gameStarted) {
    return null;
  }
  
  return (
    <>
      {setupStatus === 0 && (
        <div className={`home ${animationPlayed ? 'home-revealed' : ''}`}>
          {/* Background elements */}
          <div className="stadium-lights">
            <div className="light light-1"></div>
            <div className="light light-2"></div>
            <div className="light light-3"></div>
            <div className="light light-4"></div>
          </div>
          
          <div className="field-markings" ref={fieldRef}>
            <div className="yard-line"></div>
            <div className="yard-line"></div>
            <div className="yard-line"></div>
            <div className="yard-line"></div>
            <div className="yard-line"></div>
            <div className="center-circle"></div>
            
            {/* Yard number markers */}
            <div className="yard-number yard-number-10">10</div>
            <div className="yard-number yard-number-20">20</div>
            <div className="yard-number yard-number-30">30</div>
            <div className="yard-number yard-number-40">40</div>
            <div className="yard-number yard-number-50">50</div>
          </div>
          
          {/* Animated particles */}
          <div className="particles-container">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`particle particle-${i}`}></div>
            ))}
          </div>
          
          <div className="content-container">            
            <div className="tagline">
              <h1>GRIDIRON RAMPAGE</h1>
              <p>THE ULTIMATE STREET FOOTBALL EXPERIENCE</p>
            </div>
            
            <div className="start" ref={startButton}>
              <button 
                className="start-button"
                onClick={goToControlsScreen}
                autoFocus
              >
                <img src="/ui/icon_play_light.png" alt="" />
                <span>KICK OFF</span>
              </button>
            </div>
            
            <div className="instructions">
              <p>Press <span>ENTER</span> or click the button to start</p>
            </div>
          </div>
          
          {/* Version number */}
          <div className="version-number">v0.1.0</div>
        </div>
      )}
      
      {setupStatus === 1 && (
        <div className="home controls-screen">
          <div className="glassy">
            <div className="back-button" onClick={() => setSetupStatus(0)}>
              <img src="/ui/button_rectangle_depth_gradient.png" alt="" />
              <span>←</span>
            </div>
            
            <h1>CHOOSE YOUR CONTROL STYLE</h1>
            
            <div className="articles">
              <div 
                className={controlType === "keyboard" ? "article selected" : "article"}
                onClick={() => setControlType("keyboard")}
              >
                <div className="article-glow"></div>
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
              
              {/* Placeholder for gamepad option - currently disabled */}
              <div className="article disabled">
                <div className="coming-soon-badge">COMING SOON</div>
                <img src="/ui/icon_play_light.png" alt="gamepad" style={{ opacity: 0.5 }} />
                <div className="article_label">
                  <p>Gamepad</p>
                </div>
              </div>
            </div>
            
            <div className="submit">
              <button
                className="submit-button"
                onClick={startGame}
              >
                <span>START GAME</span>
                <img src="/ui/icon_play_light.png" alt="Start" />
              </button>
            </div>
            
            <div className="controls-instructions">
              <p>Press <span>ESC</span> to go back or <span>ENTER</span> to start game</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};