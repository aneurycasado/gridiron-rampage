// Formations.jsx - Defines offensive and defensive formations with player positions

// Helper function to create a formation
const createFormation = (id, name, description, positions) => ({
  id,
  name,
  description,
  positions
});

// Helper function to create a player position within a formation
const createPosition = (id, role, relativeCoordinates, rotation = 0) => ({
  id,
  role,
  relativeCoordinates, // Relative to line of scrimmage [x, y, z]
  rotation,  // Player facing direction in radians
  isEligibleReceiver: ['WR', 'TE', 'RB', 'FB', 'SLOT'].includes(role)
});

// Offensive formations
export const OFFENSIVE_FORMATIONS = {
  // I-Formation: Traditional formation with QB under center, FB and RB lined up behind
  I_FORM: createFormation(
    'i-form',
    'I Formation',
    'Traditional power formation with full backfield',
    [
      createPosition('QB', 'QB', [0, 1, 4], Math.PI), // QB under center
      createPosition('RB', 'RB', [0, 1, 8], Math.PI), // RB behind FB
      createPosition('FB', 'FB', [0, 1, 6], Math.PI), // FB behind QB
      createPosition('LT', 'OL', [-4, 1, 3], Math.PI), // Left tackle
      createPosition('LG', 'OL', [-2, 1, 3], Math.PI), // Left guard
      createPosition('C', 'OL', [0, 1, 3], Math.PI), // Center
      createPosition('RG', 'OL', [2, 1, 3], Math.PI), // Right guard
      createPosition('RT', 'OL', [4, 1, 3], Math.PI), // Right tackle
      createPosition('TE', 'TE', [6, 1, 3], Math.PI), // Tight end
      createPosition('WR1', 'WR', [-10, 1, 3], Math.PI), // Wide receiver left
      createPosition('WR2', 'WR', [10, 1, 3], Math.PI), // Wide receiver right
    ]
  ),
  
  // Shotgun formation: QB lined up 5-7 yards behind center
  SHOTGUN: createFormation(
    'shotgun',
    'Shotgun',
    'QB lines up 5 yards behind center with spread receivers',
    [
      createPosition('QB', 'QB', [0, 1, 7], Math.PI), // QB in shotgun
      createPosition('RB', 'RB', [-3, 1, 7], Math.PI), // RB beside QB
      createPosition('LT', 'OL', [-4, 1, 3], Math.PI), // Left tackle
      createPosition('LG', 'OL', [-2, 1, 3], Math.PI), // Left guard
      createPosition('C', 'OL', [0, 1, 3], Math.PI), // Center
      createPosition('RG', 'OL', [2, 1, 3], Math.PI), // Right guard
      createPosition('RT', 'OL', [4, 1, 3], Math.PI), // Right tackle
      createPosition('SLOT', 'WR', [-6, 1, 4], Math.PI), // Slot receiver
      createPosition('TE', 'TE', [6, 1, 3], Math.PI), // Tight end
      createPosition('WR1', 'WR', [-12, 1, 3], Math.PI), // Wide receiver left
      createPosition('WR2', 'WR', [12, 1, 3], Math.PI), // Wide receiver right
    ]
  ),
  
  // Spread formation: 4-5 receivers spread out, empty backfield
  SPREAD: createFormation(
    'spread',
    'Spread',
    'Empty backfield with receivers spread across the field',
    [
      createPosition('QB', 'QB', [0, 1, 5], Math.PI), // QB in shotgun
      createPosition('LT', 'OL', [-4, 1, 3], Math.PI), // Left tackle
      createPosition('LG', 'OL', [-2, 1, 3], Math.PI), // Left guard
      createPosition('C', 'OL', [0, 1, 3], Math.PI), // Center
      createPosition('RG', 'OL', [2, 1, 3], Math.PI), // Right guard
      createPosition('RT', 'OL', [4, 1, 3], Math.PI), // Right tackle
      createPosition('SLOT1', 'WR', [-6, 1, 4], Math.PI), // Left slot
      createPosition('SLOT2', 'WR', [6, 1, 4], Math.PI), // Right slot
      createPosition('WR1', 'WR', [-14, 1, 3], Math.PI), // Wide receiver far left
      createPosition('WR2', 'WR', [-10, 1, 3], Math.PI), // Wide receiver left
      createPosition('WR3', 'WR', [14, 1, 3], Math.PI), // Wide receiver far right
    ]
  ),
  
  // Goal Line / Heavy formation
  GOAL_LINE: createFormation(
    'goal-line',
    'Goal Line',
    'Heavy formation for short yardage situations',
    [
      createPosition('QB', 'QB', [0, 1, 4], Math.PI), // QB under center
      createPosition('FB', 'FB', [0, 1, 6], Math.PI), // FB directly behind QB
      createPosition('RB', 'RB', [0, 1, 8], Math.PI), // RB behind FB
      createPosition('LT', 'OL', [-4, 1, 3], Math.PI), // Left tackle
      createPosition('LG', 'OL', [-2, 1, 3], Math.PI), // Left guard
      createPosition('C', 'OL', [0, 1, 3], Math.PI), // Center
      createPosition('RG', 'OL', [2, 1, 3], Math.PI), // Right guard
      createPosition('RT', 'OL', [4, 1, 3], Math.PI), // Right tackle
      createPosition('TE1', 'TE', [-6, 1, 3], Math.PI), // Left tight end
      createPosition('TE2', 'TE', [6, 1, 3], Math.PI), // Right tight end
      createPosition('TE3', 'TE', [8, 1, 3], Math.PI), // Extra tight end
    ]
  ),
};

// Defensive formations
export const DEFENSIVE_FORMATIONS = {
  // 4-3 Defense: 4 defensive linemen, 3 linebackers
  DEFENSE_4_3: createFormation(
    '4-3',
    '4-3 Defense',
    'Standard defense with 4 linemen and 3 linebackers',
    [
      createPosition('DE1', 'DL', [-5, 1, -2], 0), // Left defensive end
      createPosition('DT1', 'DL', [-2, 1, -2], 0), // Left defensive tackle
      createPosition('DT2', 'DL', [2, 1, -2], 0), // Right defensive tackle
      createPosition('DE2', 'DL', [5, 1, -2], 0), // Right defensive end
      createPosition('MLB', 'LB', [0, 1, -5], 0), // Middle linebacker
      createPosition('OLB1', 'LB', [-4, 1, -5], 0), // Outside linebacker left
      createPosition('OLB2', 'LB', [4, 1, -5], 0), // Outside linebacker right
      createPosition('CB1', 'CB', [-10, 1, -3], 0), // Cornerback left
      createPosition('CB2', 'CB', [10, 1, -3], 0), // Cornerback right
      createPosition('FS', 'S', [0, 1, -8], 0), // Free safety
      createPosition('SS', 'S', [4, 1, -7], 0), // Strong safety
    ]
  ),
  
  // 3-4 Defense: 3 defensive linemen, 4 linebackers
  DEFENSE_3_4: createFormation(
    '3-4',
    '3-4 Defense',
    'Defense focused on linebacker coverage and blitzing',
    [
      createPosition('DE1', 'DL', [-4, 1, -2], 0), // Left defensive end
      createPosition('NT', 'DL', [0, 1, -2], 0), // Nose tackle
      createPosition('DE2', 'DL', [4, 1, -2], 0), // Right defensive end
      createPosition('ILB1', 'LB', [-2, 1, -5], 0), // Inside linebacker left
      createPosition('ILB2', 'LB', [2, 1, -5], 0), // Inside linebacker right
      createPosition('OLB1', 'LB', [-6, 1, -4], 0), // Outside linebacker left
      createPosition('OLB2', 'LB', [6, 1, -4], 0), // Outside linebacker right
      createPosition('CB1', 'CB', [-10, 1, -3], 0), // Cornerback left
      createPosition('CB2', 'CB', [10, 1, -3], 0), // Cornerback right
      createPosition('FS', 'S', [-2, 1, -9], 0), // Free safety
      createPosition('SS', 'S', [2, 1, -8], 0), // Strong safety
    ]
  ),
  
  // Nickel Defense: 5 defensive backs for passing situations
  NICKEL: createFormation(
    'nickel',
    'Nickel Defense',
    'Pass defense with extra defensive back',
    [
      createPosition('DE1', 'DL', [-5, 1, -2], 0), // Left defensive end
      createPosition('DT1', 'DL', [-2, 1, -2], 0), // Left defensive tackle
      createPosition('DT2', 'DL', [2, 1, -2], 0), // Right defensive tackle
      createPosition('DE2', 'DL', [5, 1, -2], 0), // Right defensive end
      createPosition('MLB', 'LB', [0, 1, -5], 0), // Middle linebacker
      createPosition('OLB', 'LB', [4, 1, -5], 0), // Outside linebacker
      createPosition('CB1', 'CB', [-10, 1, -3], 0), // Cornerback left
      createPosition('CB2', 'CB', [10, 1, -3], 0), // Cornerback right
      createPosition('NCB', 'CB', [-6, 1, -4], 0), // Nickel cornerback
      createPosition('FS', 'S', [-2, 1, -9], 0), // Free safety
      createPosition('SS', 'S', [2, 1, -8], 0), // Strong safety
    ]
  ),
  
  // Goal Line Defense
  GOAL_LINE_D: createFormation(
    'goal-line-d',
    'Goal Line Defense',
    'Stacked defense to prevent short yardage plays',
    [
      createPosition('DE1', 'DL', [-5, 1, -1], 0), // Left defensive end
      createPosition('DT1', 'DL', [-3, 1, -1], 0), // Defensive tackle 1
      createPosition('NT', 'DL', [0, 1, -1], 0), // Nose tackle
      createPosition('DT2', 'DL', [3, 1, -1], 0), // Defensive tackle 2
      createPosition('DE2', 'DL', [5, 1, -1], 0), // Right defensive end
      createPosition('LB1', 'LB', [-4, 1, -3], 0), // Linebacker 1
      createPosition('LB2', 'LB', [-1, 1, -3], 0), // Linebacker 2
      createPosition('LB3', 'LB', [2, 1, -3], 0), // Linebacker 3
      createPosition('LB4', 'LB', [5, 1, -3], 0), // Linebacker 4
      createPosition('SS', 'S', [0, 1, -5], 0), // Strong safety
      createPosition('FS', 'S', [0, 1, -8], 0), // Free safety deep
    ]
  ),
};

// Helper function to convert relative formation coordinates to absolute field position
export const formationToFieldPosition = (formation, lineOfScrimmage, flip = false) => {
  return formation.positions.map(position => {
    const [relX, relY, relZ] = position.relativeCoordinates;
    
    // Handle flipping the formation based on possession
    const xPos = flip ? -relX : relX;
    const zOffset = flip ? -relZ : relZ;
    
    return {
      ...position,
      // Calculate absolute field position
      coordinates: [
        xPos, // X position (width of field)
        relY,  // Y position (height)
        lineOfScrimmage + zOffset // Z position relative to line of scrimmage
      ],
      // Also flip rotation if needed
      rotation: flip ? (position.rotation + Math.PI) % (2 * Math.PI) : position.rotation
    };
  });
};

export default {
  offensive: OFFENSIVE_FORMATIONS,
  defensive: DEFENSIVE_FORMATIONS,
  formationToFieldPosition
};