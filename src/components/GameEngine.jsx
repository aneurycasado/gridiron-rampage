import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import { PlaySelection } from './ui/PlaySelection';
import { PlayOutcome } from './ui/PlayOutcome';
import { CoinToss } from './ui/CoinToss';
import { GameOver } from './ui/GameOver';
import { PlayInstructions } from './ui/PlayInstructions';
import { playSound } from './store';

// Play type definitions
const OFFENSIVE_PLAYS = {
  RUN: {
    INSIDE: {
      id: 'inside_run',
      name: 'Inside Run',
      description: 'High success rate, low yardage',
      baseSuccessRate: 0.75,
      baseYards: { min: 1, max: 5 },
      instruction: 'Run straight ahead through the middle of the line. Use WASD to control movement.',
      playDuration: 15 // seconds to complete the play
    },
    OUTSIDE: {
      id: 'outside_run',
      name: 'Outside Run',
      description: 'Medium success rate, medium yardage',
      baseSuccessRate: 0.65,
      baseYards: { min: 3, max: 8 },
      instruction: 'Run to the outside of the field. Use WASD to control movement, and E to spin.',
      playDuration: 15
    },
    TRICK: {
      id: 'trick_run',
      name: 'Trick Run',
      description: 'Low success rate, high yardage potential',
      baseSuccessRate: 0.4,
      baseYards: { min: 0, max: 15 },
      instruction: 'Execute a deceptive run play. Use WASD to move, Q to juke, and E to spin.',
      playDuration: 20
    }
  },
  PASS: {
    SHORT: {
      id: 'short_pass',
      name: 'Short Pass',
      description: 'High completion rate, low yardage',
      baseSuccessRate: 0.8,
      baseYards: { min: 2, max: 7 },
      instruction: 'Throw a short pass and control the receiver. Press F to throw/catch, then WASD to run.',
      playDuration: 15
    },
    MEDIUM: {
      id: 'medium_pass',
      name: 'Medium Pass',
      description: 'Medium completion rate, medium yardage',
      baseSuccessRate: 0.6,
      baseYards: { min: 5, max: 15 },
      instruction: 'Throw a medium pass and control the receiver. Press F to throw/catch, then WASD to run.',
      playDuration: 20
    },
    LONG: {
      id: 'long_pass',
      name: 'Long Pass',
      description: 'Low completion rate, high yardage potential',
      baseSuccessRate: 0.35,
      baseYards: { min: 0, max: 30 },
      instruction: 'Throw a deep pass and control the receiver. Press F to throw/catch, then WASD to run.',
      playDuration: 25
    }
  }
};

const DEFENSIVE_PLAYS = {
  RUN_DEFENSE: {
    GOAL_LINE: {
      id: 'goal_line_defense',
      name: 'Goal Line Defense',
      description: 'Strong against inside runs',
      modifiers: {
        'inside_run': 0.6,
        'outside_run': 1.0,
        'trick_run': 1.1,
        'short_pass': 1.1,
        'medium_pass': 1.2,
        'long_pass': 1.3
      }
    },
    CONTAIN: {
      id: 'contain_defense',
      name: 'Contain Defense',
      description: 'Strong against outside runs',
      modifiers: {
        'inside_run': 1.1,
        'outside_run': 0.6,
        'trick_run': 0.9,
        'short_pass': 1.0,
        'medium_pass': 1.1,
        'long_pass': 1.2
      }
    },
    BLITZ: {
      id: 'blitz',
      name: 'Blitz',
      description: 'High risk, high reward against all runs',
      modifiers: {
        'inside_run': 0.5,
        'outside_run': 0.5,
        'trick_run': 0.6,
        'short_pass': 0.7,
        'medium_pass': 1.3,
        'long_pass': 1.5
      }
    }
  },
  PASS_DEFENSE: {
    ZONE: {
      id: 'zone_coverage',
      name: 'Zone Coverage',
      description: 'Strong against short passes',
      modifiers: {
        'inside_run': 1.2,
        'outside_run': 1.1,
        'trick_run': 1.0,
        'short_pass': 0.6,
        'medium_pass': 0.9,
        'long_pass': 1.1
      }
    },
    MAN: {
      id: 'man_coverage',
      name: 'Man Coverage',
      description: 'Strong against medium passes',
      modifiers: {
        'inside_run': 1.1,
        'outside_run': 1.0,
        'trick_run': 1.1,
        'short_pass': 0.9,
        'medium_pass': 0.6,
        'long_pass': 1.0
      }
    },
    PREVENT: {
      id: 'prevent_defense',
      name: 'Prevent Defense',
      description: 'Strong against long passes',
      modifiers: {
        'inside_run': 1.3,
        'outside_run': 1.2,
        'trick_run': 1.1,
        'short_pass': 1.0,
        'medium_pass': 0.8,
        'long_pass': 0.5
      }
    }
  }
};

// Helper function to get all offensive plays as a flat array
const getAllOffensivePlays = () => {
  const plays = [];
  Object.values(OFFENSIVE_PLAYS).forEach(category => {
    Object.values(category).forEach(play => {
      plays.push(play);
    });
  });
  return plays;
};

// Helper function to get all defensive plays as a flat array
const getAllDefensivePlays = () => {
  const plays = [];
  Object.values(DEFENSIVE_PLAYS).forEach(category => {
    Object.values(category).forEach(play => {
      plays.push(play);
    });
  });
  return plays;
};

// Random number between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Determine play outcome based on offensive and defensive play selection
const determinePlayOutcome = (offensivePlay, defensivePlay, playerPerformance = 1.0) => {
  // Get base success rate for the offensive play
  const baseSuccessRate = offensivePlay.baseSuccessRate;
  
  // Get defensive modifier for the play matchup
  const defensiveModifier = defensivePlay.modifiers[offensivePlay.id] || 1.0;
  
  // Calculate final success chance, incorporating player performance
  const finalSuccessChance = baseSuccessRate * defensiveModifier * playerPerformance;
  
  // Random roll to determine success
  const randomRoll = Math.random();
  const success = randomRoll <= finalSuccessChance;
  
  // Calculate yards gained based on success or failure and player performance
  let yardsGained = 0;
  
  if (success) {
    // Successful play - get random yards between min and max, modified by player performance
    const baseYards = getRandomInt(
      offensivePlay.baseYards.min,
      offensivePlay.baseYards.max
    );
    
    // Player performance affects yards gained
    yardsGained = Math.floor(baseYards * playerPerformance);
    
    // Add some variability based on the defensive matchup
    // If defense is weak against this play (mod > 1), gain fewer yards
    // If defense is strong against this play (mod < 1), gain more yards if successful
    if (defensiveModifier > 1) {
      yardsGained = Math.max(1, Math.floor(yardsGained * 0.8));
    } else if (defensiveModifier < 1) {
      yardsGained = Math.floor(yardsGained * 1.3);
    }
  } else {
    // Failed play - usually 0 or negative yards
    if (offensivePlay.id.includes('pass')) {
      // Incomplete pass - 0 yards
      yardsGained = 0;
    } else {
      // Failed run - potential for loss
      yardsGained = getRandomInt(-2, 1);
    }
  }
  
  // Special case for trick plays - they can spectacularly fail
  if (offensivePlay.id === 'trick_run' && !success) {
    yardsGained = getRandomInt(-5, 0);
  }
  
  // Special cases for blitz - can lead to big losses or big gains
  if (defensivePlay.id === 'blitz') {
    if (!success) {
      yardsGained -= getRandomInt(0, 3); // Extra negative yards on failed plays against blitz
    } else if (offensivePlay.id.includes('pass')) {
      yardsGained += getRandomInt(5, 10); // Big gains if passing play beats blitz
    }
  }
  
  // Return the play outcome
  return {
    success,
    yardsGained,
    playCalled: offensivePlay.name,
    defenseUsed: defensivePlay.name,
    playType: offensivePlay.id.includes('pass') ? 'pass' : 'run',
    narrative: generatePlayNarrative(success, yardsGained, offensivePlay, defensivePlay, playerPerformance)
  };
};

// Generate a narrative description of the play outcome
const generatePlayNarrative = (success, yardsGained, offensivePlay, defensivePlay, playerPerformance) => {
  const isPass = offensivePlay.id.includes('pass');
  const team = "Home"; // TODO: Replace with actual team name
  
  let narrative = '';
  
  // Add player performance flavor
  let performanceText = '';
  if (playerPerformance > 1.3) {
    performanceText = 'an outstanding';
  } else if (playerPerformance > 1.1) {
    performanceText = 'a great';
  } else if (playerPerformance < 0.7) {
    performanceText = 'a poor';
  } else if (playerPerformance < 0.9) {
    performanceText = 'a mediocre';
  } else {
    performanceText = 'a solid';
  }
  
  if (isPass) {
    if (success) {
      if (yardsGained > 20) {
        narrative = `${team} completes a HUGE ${offensivePlay.name.toLowerCase()} for ${yardsGained} yards with ${performanceText} execution!`;
      } else if (yardsGained > 10) {
        narrative = `${team} connects on a ${offensivePlay.name.toLowerCase()} for a solid gain of ${yardsGained} yards with ${performanceText} throw and catch.`;
      } else {
        narrative = `${team}'s ${offensivePlay.name.toLowerCase()} is complete for ${yardsGained} yards after ${performanceText} execution.`;
      }
    } else {
      narrative = `${team}'s ${offensivePlay.name.toLowerCase()} falls incomplete after ${performanceText} attempt.`;
    }
  } else {
    // Run play
    if (success) {
      if (yardsGained > 10) {
        narrative = `${team} breaks loose on a ${offensivePlay.name.toLowerCase()} for ${yardsGained} yards with ${performanceText} run!`;
      } else if (yardsGained > 5) {
        narrative = `${team} gains ${yardsGained} yards on a solid ${offensivePlay.name.toLowerCase()} with ${performanceText} effort.`;
      } else {
        narrative = `${team} picks up ${yardsGained} yards on the ${offensivePlay.name.toLowerCase()} with ${performanceText} execution.`;
      }
    } else {
      if (yardsGained < 0) {
        narrative = `${team}'s ${offensivePlay.name.toLowerCase()} is stopped for a loss of ${Math.abs(yardsGained)} yards despite ${performanceText} effort.`;
      } else if (yardsGained === 0) {
        narrative = `${team}'s ${offensivePlay.name.toLowerCase()} is stopped at the line of scrimmage after ${performanceText} attempt.`;
      } else {
        narrative = `${team} is held to just ${yardsGained} yard on the ${offensivePlay.name.toLowerCase()} with ${performanceText} execution.`;
      }
    }
  }
  
  // Add some flavor about the defense
  if (defensivePlay.id === 'blitz' && !success) {
    narrative += ` The ${defensivePlay.name.toLowerCase()} disrupted the play!`;
  } else if (defensivePlay.id === 'blitz' && success && isPass) {
    narrative += ` They beat the ${defensivePlay.name.toLowerCase()} for a big gain!`;
  }
  
  return narrative;
};

// AI play selection for CPU
const getAIPlaySelection = (isOffense, fieldPosition, down, yardsToGo, timeRemaining, scoreDifference) => {
  // Simple AI that makes more or less aggressive choices based on the game situation
  // This can be expanded for more sophisticated behavior
  
  const allPlays = isOffense ? getAllOffensivePlays() : getAllDefensivePlays();
  
  // Red zone (inside 20 yard line) - different strategy
  const inRedZone = fieldPosition >= 80;
  
  // Late game situations
  const lateFourthQuarter = timeRemaining < 120 && scoreDifference !== 0;
  
  // Desperation situations
  const needBigPlays = (lateFourthQuarter && scoreDifference < 0) || (down >= 3 && yardsToGo >= 8);
  
  // Short yardage situations
  const shortYardage = yardsToGo <= 3;
  
  // Filter plays based on situation
  let filteredPlays = [...allPlays];
  
  if (isOffense) {
    if (inRedZone && shortYardage) {
      // Favor inside runs in red zone with short yardage
      filteredPlays = filteredPlays.filter(play => 
        play.id === 'inside_run' || play.id === 'short_pass'
      );
    } else if (inRedZone) {
      // General red zone strategy - no long passes
      filteredPlays = filteredPlays.filter(play => play.id !== 'long_pass');
    } else if (needBigPlays) {
      // Need chunk plays - favor medium/long passes
      filteredPlays = filteredPlays.filter(play => 
        play.id === 'medium_pass' || play.id === 'long_pass' || play.id === 'trick_run'
      );
    } else if (shortYardage) {
      // Short yardage - favor high percentage plays
      filteredPlays = filteredPlays.filter(play => 
        play.id === 'inside_run' || play.id === 'short_pass'
      );
    }
  } else {
    // Defensive play selection
    if (inRedZone) {
      // In red zone, favor goal line defense
      filteredPlays = filteredPlays.filter(play => 
        play.id === 'goal_line_defense' || play.id === 'man_coverage'
      );
    } else if (down >= 3 && yardsToGo >= 7) {
      // Long yardage situations - expect pass
      filteredPlays = filteredPlays.filter(play => 
        play.id.includes('coverage')
      );
    } else if (shortYardage) {
      // Short yardage - expect run
      filteredPlays = filteredPlays.filter(play => 
        play.id === 'goal_line_defense' || play.id === 'contain_defense' || play.id === 'blitz'
      );
    }
  }
  
  // If we filtered too much, revert to all plays
  if (filteredPlays.length === 0) {
    filteredPlays = allPlays;
  }
  
  // Randomly select from filtered plays
  const randomIndex = Math.floor(Math.random() * filteredPlays.length);
  return filteredPlays[randomIndex];
};

// Main GameEngine component
export const GameEngine = () => {
  const { 
    gamePhase, 
    downs, 
    gameTime, 
    score, 
    currentTeamPossession,
    selectedOffensivePlay,
    selectedDefensivePlay,
    playResult,
    actions
  } = useStore();
  
  const [playTimer, setPlayTimer] = useState(0);
  const [playerStartingYardLine, setPlayerStartingYardLine] = useState(0);
  const [playerPerformance, setPlayerPerformance] = useState(1.0);
  
  // Game clock ticker
  useEffect(() => {
    let clockInterval;
    
    if (gameTime.clockRunning) {
      clockInterval = setInterval(() => {
        actions.updateClock(1); // Update by 1 second
      }, 1000);
    }
    
    return () => {
      if (clockInterval) clearInterval(clockInterval);
    };
  }, [gameTime.clockRunning, actions]);
  
  // Manage game phases
  useEffect(() => {
    // Initialize game on first render
    if (gamePhase === "pregame") {
      // After 1 second, move to coin toss
      const timer = setTimeout(() => {
        actions.setGamePhase("coinToss");
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gamePhase, actions]);

  // Play execution timer - handles the interactive play phase
  useEffect(() => {
    let playInterval;
    
    if (gamePhase === "playExecution" && playTimer > 0) {
      playInterval = setInterval(() => {
        setPlayTimer(prevTimer => {
          const newTimer = prevTimer - 1;
          
          // When play timer expires, calculate outcome and move to outcome phase
          if (newTimer <= 0) {
            handlePlayCompletion();
            return 0;
          }
          
          return newTimer;
        });
      }, 1000);
    }
    
    return () => {
      if (playInterval) clearInterval(playInterval);
    };
  }, [gamePhase, playTimer]);
  
  // Handle transition from play selection to interactive play
  useEffect(() => {
    if (gamePhase === "playExecution" && selectedOffensivePlay && selectedDefensivePlay) {
      // Set up the play timer based on the play type
      setPlayTimer(selectedOffensivePlay.playDuration || 15);
      
      // Record the player's starting position for later yardage calculation
      setPlayerStartingYardLine(downs.position);
      
      // Play a whistle sound to begin
      playSound('whistle.mp3', 0.5);
      
      // Allow player to execute the play by setting game phase to "playing"
      // This will show the actual 3D gameplay
      setTimeout(() => {
        actions.setGamePhase("playing");
      }, 3000);
    }
  }, [gamePhase, selectedOffensivePlay, selectedDefensivePlay, downs.position, actions]);
  
  // Calculate player performance based on yardage gained during interactive play
  const calculatePlayerPerformance = () => {
    // Get player's current yard line from store (would be updated during gameplay)
    // For now, we'll simulate this with a random value
    const currentPosition = downs.position;
    
    // Calculate actual yards gained by player
    const actualYardsGained = currentPosition - playerStartingYardLine;
    
    // Expected yards from the play type
    const expectedMinYards = selectedOffensivePlay.baseYards.min;
    const expectedMaxYards = selectedOffensivePlay.baseYards.max;
    const expectedAvgYards = (expectedMinYards + expectedMaxYards) / 2;
    
    // Performance is actual yards relative to expected yards
    // 1.0 is average performance
    let performance;
    
    if (actualYardsGained <= 0) {
      // Failed to gain yards
      performance = 0.7;
    } else if (actualYardsGained < expectedMinYards) {
      // Below minimum - below average performance
      performance = 0.8;
    } else if (actualYardsGained < expectedAvgYards) {
      // Below average, but still ok
      performance = 0.9;
    } else if (actualYardsGained < expectedMaxYards) {
      // Above average
      performance = 1.1;
    } else if (actualYardsGained === expectedMaxYards) {
      // Max expected yards - excellent performance
      performance = 1.3;
    } else {
      // Exceeded max expected yards - exceptional performance
      performance = 1.5;
    }
    
    // For now, we'll randomize this for demonstration
    // In a real implementation, this would be calculated based on player control
    return 0.7 + Math.random() * 0.8; // Random between 0.7 and 1.5
  };
  
  // Handle play completion after interactive gameplay
  const handlePlayCompletion = () => {
    // Calculate the player's performance
    const performance = calculatePlayerPerformance();
    setPlayerPerformance(performance);
    
    // Calculate play outcome based on the play selection and player performance
    const outcome = determinePlayOutcome(selectedOffensivePlay, selectedDefensivePlay, performance);
    
    // Update the game state based on outcome
    const downResult = actions.advanceDown(outcome.yardsGained);
    
    // Combine the results
    const fullResult = {
      ...outcome,
      downResult
    };
    
    // Store in state
    actions.setPlayResult(fullResult);
    
    // Run the clock based on play type
    if (outcome.playType === 'run' || (outcome.playType === 'pass' && outcome.success)) {
      // Run plays and complete passes run the clock (30-40 seconds)
      const timeElapsed = getRandomInt(30, 40);
      actions.updateClock(timeElapsed);
    } else {
      // Incomplete passes stop the clock (5-10 seconds)
      const timeElapsed = getRandomInt(5, 10);
      actions.updateClock(timeElapsed);
    }
    
    // Move to outcome phase to show the result
    actions.setGamePhase("playOutcome");
  };
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Render different components based on game phase
  switch (gamePhase) {
    case "pregame":
      return null; // Nothing to show yet
      
    case "coinToss":
      return <CoinToss />;
      
    case "playSelection":
      return <PlaySelection 
        offensivePlays={getAllOffensivePlays()}
        defensivePlays={getAllDefensivePlays()}
        currentDown={downs.current}
        yardsToGo={downs.toGo}
        fieldPosition={downs.position}
        quarter={gameTime.quarter}
        timeRemaining={formatTime(gameTime.time)}
        score={score}
        possession={currentTeamPossession}
        onPlaySelected={(offensePlay, defensePlay) => {
          actions.selectOffensivePlay(offensePlay);
          actions.selectDefensivePlay(defensePlay);
          actions.setGamePhase("playExecution"); // Go to play execution phase first
        }}
      />;
      
    case "playExecution":
      return <PlayInstructions 
        play={selectedOffensivePlay}
        timeRemaining={playTimer}
      />;
      
    case "playing":
      // During actual gameplay, we don't show any UI except the HUD
      // The 3D scene will be visible
      return null;
      
    case "playOutcome":
      return <PlayOutcome 
        result={playResult}
        onContinue={() => {
          actions.resetPlaySelection();
          actions.setGamePhase("playSelection");
        }}
      />;
      
    case "endGame":
      return <GameOver 
        score={score} 
        winner={score.home > score.away ? "home" : "away"} 
      />;
      
    default:
      return null;
  }
};