# Down System Implementation

This document outlines the implementation of a football down system in Gridiron Rampage.

## Overview

The down system follows standard American football rules:
- The offense has 4 downs to advance 10 yards
- Achieving a first down resets to 1st down with 10 yards to go
- Failing to get a first down on 4th down results in a turnover
- Reaching the opponent's goal line (100 yard line) results in a touchdown

## Technical Components

### State Management (store.jsx)

1. **Enhanced Downs State**:
   ```javascript
   downs: {
     current: 1,        // Current down (1-4)
     toGo: 10,          // Yards needed for first down
     position: 20,      // Current yard line position (0-100)
     lineOfScrimmage: 20, // Position where the play started
     ballPosition: 20,    // Current ball position
     possession: "offense" // Team with possession ("offense" or "defense")
   }
   ```

2. **Play Control Functions**:
   - `startPlay()`: Records line of scrimmage at start of the play
   - `endPlay()`: Calculates yards gained and triggers down advancement
   - `advanceDown()`: Handles first down, touchdown, and turnover scenarios

3. **Yard Tracking Logic**:
   - Converts 3D Z-coordinates to yard line positions (0-100)
   - Calculates yards gained relative to line of scrimmage
   - Updates down and distance based on game rules

### Field Positioning (Experience.jsx)

1. **Dynamic Line of Scrimmage**:
   - Positions players and ball based on current line of scrimmage
   - Converts yard line (0-100) to 3D space Z-coordinate (-100 to +100)

2. **Player and Ball Placement**:
   ```javascript
   // Position for line of scrimmage based on downs state
   const lineOfScrimmage = useMemo(() => {
     const { downs } = useStore.getState();
     // Convert yard line (0-100) to 3D space Z-coordinate (-100 to +100)
     const zPos = -((downs.position / 100) * 200) + 100;
     return { x: 0, z: zPos };
   }, []);

   // Position offensive player behind line of scrimmage
   offensivePlayerPosition = [0, 1, lineOfScrimmage.z + 3];
   
   // Position defensive player in front of line of scrimmage
   defensivePlayerPosition = [0, 1, lineOfScrimmage.z - 3];
   ```

### UI Components

1. **Enhanced HUD Display**:
   - Down and distance information
   - Field position with customized text based on field location
   - Possession indicator
   
2. **Play Messaging System**:
   - `PlayCTA`: Prompts user to start play
   - `PlayEndedMessage`: Shows down and yardage results
   - `GameNotification`: Displays first down, touchdown, and turnover alerts

3. **Notification System**:
   - Popup messages for key events (first down, touchdown, turnover)
   - Styled with appropriate colors and animations

## Game Flow Logic

1. **Play Sequence**:
   - Start play (Press Enter)
   - Player movement and tackling
   - End play (triggered by tackle)
   - Update downs/field position
   - Display appropriate notification
   - Reset for next play

2. **Possession Changes**:
   - Turnover on downs (failed 4th down)
   - Touchdown (position >= 100)

3. **Yard Calculation**:
   - Uses physics positions to determine actual yards gained
   - Converts 3D world coordinates to football field yardage

## Technical Solutions

### Coordinate System

The game uses a coordinate system where:
- Z axis represents the length of the field
- Field runs from Z=-100 to Z=100 in 3D space
- This maps to 0-100 yard lines in football terms
- Formula: `yardLine = 100 - (zPosition + 100)`

### Reset Mechanics

When resetting a play, the system:
1. Calculates new line of scrimmage
2. Positions players appropriately
3. Updates ball position
4. Updates UI elements to reflect new game state

### Interactive Elements

- Enter key: Start/reset play
- On-screen prompts with contextual information
- Visual and text feedback for important down changes

## Future Enhancements

- Add yard markers on the 3D field
- Implement field goal and punting options for 4th down
- Add computer AI decision making for defense
- Implement pass plays with receiver options