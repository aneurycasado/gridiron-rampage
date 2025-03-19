# Camera System and Game Flow Implementation

## Overview
This document details the implementation of an improved camera system, game state management, and play control mechanics for Gridiron Rampage.

## Camera System

### Fixed Perspective Camera
- Implemented a PerspectiveCamera with ideal gameplay parameters:
  - FOV: 60
  - Near: 0.1
  - Far: 1000
  - Initial position: [0, 6, 15]

### Dynamic Camera Following
- Camera intelligently follows the ball during active plays
- Uses a fixed overhead angle to maintain consistent perspective
- Implemented priority-based tracking system:
  1. Football position from store data (first priority)
  2. Football reference position (second priority)
  3. Offensive player position (fallback option)

### Camera Smoothing
- Added responsive but stable camera movement:
  - X-axis (horizontal) lerp factor: 0.8
  - Y-axis (vertical) lerp factor: 0.5 (most stable)
  - Z-axis (depth) lerp factor: 0.8
- Implemented damping to prevent oscillations and reduce camera shake
- Camera maintains consistent height above playing field

### Line of Scrimmage Focus
- Camera automatically returns to line of scrimmage between plays
- Provides clear view of field and player positions before play starts

## Play Control System

### Play State Management
- Enhanced state management for game flow:
  - `playActive`: Tracks when play is in progress
  - `playEnded`: Signals completed plays
  - `gameStarted`: Manages overall game state
  - `gamePaused`: Handles pause functionality

### Play Control UI
- Implemented PlayCTA.jsx to provide "Press Enter to Start" prompt
- Created PlayEndedMessage.jsx to show "Play Ended - Press Enter to Restart"
- UI elements appear/disappear based on current play state

### Keyboard Controls
- Enter key starts a new play when at the line of scrimmage
- Enter key restarts after a play has ended
- WASD/Arrows for player movement
- Consistent player control experience

### Reset Functionality
- Enhanced `resetPlay()` function to properly reset:
  - Player positions back to line of scrimmage
  - Football position to starting state
  - Offensive player at [0, 1, 3]
  - Defensive player at [0, 1, -3]
  - Football at [0, 0.15, 0]

## Technical Implementation
- Used React Three Fiber for 3D rendering
- Leveraged Zustand for state management between components
- Implemented Rapier physics for collision detection
- Applied trigonometric calculations for positioning
- Optimized lerp-based movement for smooth transitions