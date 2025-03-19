# Player-Football Interaction Mechanics

## Overview
This document outlines the implementation of player-football interaction mechanics in Gridiron Rampage, focusing on realistic ball handling, player movement, and game flow.

## Football Handling

### Ball Attachment System
- Implemented automatic ball attachment to offensive player when play is active
- Created reference-based attachment for consistent positioning
- Added owner tracking to determine which player has possession
- Set up appropriate physics properties for the football:
  - Mass and gravity values for realistic bounce
  - Rotation for visual feedback
  - Collision detection with ground

### Ball Positioning
- Football positioned directly in front of player based on facing direction
- Used trigonometric calculations for proper placement:
  - X offset = Math.sin(rotationY) * 0.4
  - Z offset = -Math.cos(rotationY) * 0.4 (negative for correct positioning)
- Y position set to 0.6 units for proper waist-level carrying position
- Ball rotation angled at Math.PI / 3 for realistic carrying position

### Ball Reset Logic
- Football automatically resets to line of scrimmage between plays
- Ball drops to ground when play ends
- Proper rotation (Math.PI / 2) to lay flat on ground when not in play

## Player Movement

### Collision Adjustments
- Reduced player collision box dimensions to [0.25, 0.7, 0.25]
- Created more precise interactions between players
- Improved tackling detection using distance-based calculations
- Set up proper physics properties for players:
  - Locked rotations for stability
  - Appropriate velocity for movement
  - Controlled acceleration/deceleration

### Movement Controls
- Implemented directional control with WASD/arrow keys
- Added rotation-based movement to face direction of travel
- Set up speed limitations for balanced gameplay
- Removed initial backward movement to improve control experience

### Player Reset
- Players automatically reset to starting positions between plays:
  - Offensive player: [0, 1, 3]
  - Defensive player: [0, 1, -3]
- Positions reset via enhanced resetPlay() function

## Play Control Mechanics

### Play State Management
- Implemented comprehensive play state tracking:
  - Play begins with Enter key press
  - Play ends on tackle (defensive player collision)
  - Play can be restarted with Enter key after ending

### User Interface
- Clear prompts for player actions:
  - "Press Enter to Start Play" before play begins
  - "Tackle! Play Ended - Press Enter to restart" when play ends
- UI elements appear contextually based on game state

## Technical Implementation
- Leveraged React Three Fiber for 3D rendering and physics
- Used Rapier physics for collision detection and movement
- Implemented Zustand for global state management
- Utilized refs for direct manipulation of Three.js objects
- Applied trigonometric calculations for positioning
- Created smooth transitions with lerp-based interpolation