import { createPlay } from './PlayBook';
import { DEFENSIVE_FORMATIONS } from './Formations';

// Collection of defensive plays organized by formation and type
const defensivePlays = [
  // 4-3 DEFENSE PLAYS
  
  // 4-3: Base Cover 2 (Standard zone coverage)
  createPlay({
    id: '4-3-cover-2',
    name: 'Cover 2',
    type: 'zone',
    formation: DEFENSIVE_FORMATIONS.DEFENSE_4_3,
    difficultyLevel: 2,
    description: 'Base zone coverage with two deep safeties',
    routes: {
      'DE1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT2': { pattern: 'PASS_RUSH', color: '#888888' },
      'DE2': { pattern: 'PASS_RUSH', color: '#888888' },
      'MLB': { 
        pattern: 'ZONE_MID', 
        options: { zoneDepth: 8 },
        color: '#00ffff' 
      },
      'OLB1': { 
        pattern: 'ZONE_FLAT', 
        options: { side: 'left' },
        color: '#00ffff' 
      },
      'OLB2': { 
        pattern: 'ZONE_FLAT', 
        options: { side: 'right' },
        color: '#00ffff' 
      },
      'CB1': { 
        pattern: 'ZONE_CURL', 
        options: { side: 'left' },
        color: '#00ffff' 
      },
      'CB2': { 
        pattern: 'ZONE_CURL', 
        options: { side: 'right' },
        color: '#00ffff' 
      },
      'FS': { 
        pattern: 'ZONE_DEEP', 
        options: { side: 'left', depth: 15 },
        color: '#ff8800' 
      },
      'SS': { 
        pattern: 'ZONE_DEEP', 
        options: { side: 'right', depth: 15 },
        color: '#ff8800' 
      },
    },
    strengths: ['shortPass', 'outsideRun'],
    weaknesses: ['deepPass', 'seams'],
    aiInstructions: {
      'DL': 'Generate pressure with four-man rush',
      'MLB': 'Cover hook zones and middle of field',
      'FS/SS': 'Split field in half, cover deep zones'
    }
  }),
  
  // 4-3: Cover 3 (Deep zone coverage)
  createPlay({
    id: '4-3-cover-3',
    name: 'Cover 3',
    type: 'zone',
    formation: DEFENSIVE_FORMATIONS.DEFENSE_4_3,
    difficultyLevel: 2,
    description: 'Three deep defenders each cover a third of the field',
    routes: {
      'DE1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT2': { pattern: 'PASS_RUSH', color: '#888888' },
      'DE2': { pattern: 'PASS_RUSH', color: '#888888' },
      'MLB': { 
        pattern: 'ZONE_HOOK', 
        options: { side: 'middle' },
        color: '#00ffff' 
      },
      'OLB1': { 
        pattern: 'ZONE_FLAT', 
        options: { side: 'left' },
        color: '#00ffff' 
      },
      'OLB2': { 
        pattern: 'ZONE_FLAT', 
        options: { side: 'right' },
        color: '#00ffff' 
      },
      'CB1': { 
        pattern: 'ZONE_DEEP', 
        options: { side: 'left', depth: 15 },
        color: '#ff8800' 
      },
      'CB2': { 
        pattern: 'ZONE_DEEP', 
        options: { side: 'right', depth: 15 },
        color: '#ff8800' 
      },
      'FS': { 
        pattern: 'ZONE_DEEP', 
        options: { side: 'middle', depth: 18 },
        color: '#ff8800' 
      },
      'SS': { 
        pattern: 'ZONE_CURL', 
        options: { side: 'right' },
        color: '#00ffff' 
      },
    },
    strengths: ['deepPass', 'outsideRun'],
    weaknesses: ['shortPass', 'flats'],
    aiInstructions: {
      'CB1/CB2': 'Drop to deep third coverage',
      'FS': 'Cover middle third of field',
      'SS': 'Cover curl/flat area, support against run'
    }
  }),
  
  // 4-3: Blitz (Heavy pressure)
  createPlay({
    id: '4-3-blitz',
    name: 'MLB Blitz',
    type: 'blitz',
    formation: DEFENSIVE_FORMATIONS.DEFENSE_4_3,
    difficultyLevel: 3,
    description: 'Middle linebacker blitzes through A-gap',
    routes: {
      'DE1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT2': { pattern: 'PASS_RUSH', color: '#888888' },
      'DE2': { pattern: 'PASS_RUSH', color: '#888888' },
      'MLB': { 
        pattern: 'BLITZ', 
        options: { gap: 'A' },
        color: '#ff0000' 
      },
      'OLB1': { 
        pattern: 'ZONE_HOOK', 
        options: { side: 'middle' },
        color: '#00ffff' 
      },
      'OLB2': { 
        pattern: 'ZONE_FLAT', 
        options: { side: 'right' },
        color: '#00ffff' 
      },
      'CB1': { 
        pattern: 'MAN', 
        options: { target: 'WR1' },
        color: '#ffff00' 
      },
      'CB2': { 
        pattern: 'MAN', 
        options: { target: 'WR2' },
        color: '#ffff00' 
      },
      'FS': { 
        pattern: 'ZONE_DEEP', 
        options: { side: 'middle', depth: 15 },
        color: '#ff8800' 
      },
      'SS': { 
        pattern: 'MAN', 
        options: { target: 'TE' },
        color: '#ffff00' 
      },
    },
    strengths: ['run', 'shortPass', 'playAction'],
    weaknesses: ['quickPass', 'screens'],
    aiInstructions: {
      'MLB': 'Blitz through A gap at snap',
      'DL': 'Occupy blockers to free MLB',
      'FS': 'Provide deep help over the top'
    }
  }),
  
  // 3-4 DEFENSE PLAYS
  
  // 3-4: Zone Blitz (Disguised pressure)
  createPlay({
    id: '3-4-zone-blitz',
    name: 'Zone Blitz',
    type: 'blitz',
    formation: DEFENSIVE_FORMATIONS.DEFENSE_3_4,
    difficultyLevel: 4,
    description: 'Outside linebackers blitz while DE drops to coverage',
    routes: {
      'DE1': { 
        pattern: 'ZONE_FLAT', 
        options: { side: 'left' },
        color: '#00ffff' 
      },
      'NT': { pattern: 'PASS_RUSH', color: '#888888' },
      'DE2': { pattern: 'PASS_RUSH', color: '#888888' },
      'ILB1': { 
        pattern: 'ZONE_HOOK', 
        options: { side: 'left' },
        color: '#00ffff' 
      },
      'ILB2': { 
        pattern: 'ZONE_HOOK', 
        options: { side: 'right' },
        color: '#00ffff' 
      },
      'OLB1': { 
        pattern: 'BLITZ', 
        options: { gap: 'C' },
        color: '#ff0000' 
      },
      'OLB2': { 
        pattern: 'BLITZ', 
        options: { gap: 'C' },
        color: '#ff0000' 
      },
      'CB1': { 
        pattern: 'MAN', 
        options: { target: 'WR1' },
        color: '#ffff00' 
      },
      'CB2': { 
        pattern: 'MAN', 
        options: { target: 'WR2' },
        color: '#ffff00' 
      },
      'FS': { 
        pattern: 'ZONE_DEEP', 
        options: { side: 'middle', depth: 15 },
        color: '#ff8800' 
      },
      'SS': { 
        pattern: 'ZONE_CURL', 
        options: { side: 'right' },
        color: '#00ffff' 
      },
    },
    strengths: ['disguise', 'confuseOffense'],
    weaknesses: ['disciplinedQB', 'quickReads'],
    aiInstructions: {
      'DE1': 'Fake rush, then drop to flat coverage',
      'OLB1/OLB2': 'Blitz from outside to collapse pocket',
      'ILB': 'Cover hook zones and be ready for short passes'
    }
  }),
  
  // NICKEL DEFENSE PLAYS
  
  // Nickel: Man Coverage (Pass defense)
  createPlay({
    id: 'nickel-man',
    name: 'Nickel Man',
    type: 'man',
    formation: DEFENSIVE_FORMATIONS.NICKEL,
    difficultyLevel: 3,
    description: 'Man coverage across the board with nickel package',
    routes: {
      'DE1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT1': { pattern: 'PASS_RUSH', color: '#888888' },
      'DT2': { pattern: 'PASS_RUSH', color: '#888888' },
      'DE2': { pattern: 'PASS_RUSH', color: '#888888' },
      'MLB': { 
        pattern: 'MAN', 
        options: { target: 'RB' },
        color: '#ffff00' 
      },
      'OLB': { 
        pattern: 'MAN', 
        options: { target: 'TE' },
        color: '#ffff00' 
      },
      'CB1': { 
        pattern: 'MAN', 
        options: { target: 'WR1' },
        color: '#ffff00' 
      },
      'CB2': { 
        pattern: 'MAN', 
        options: { target: 'WR2' },
        color: '#ffff00' 
      },
      'NCB': { 
        pattern: 'MAN', 
        options: { target: 'SLOT' },
        color: '#ffff00' 
      },
      'FS': { 
        pattern: 'ZONE_DEEP',
        options: { side: 'middle', depth: 15 },
        color: '#ff8800' 
      },
      'SS': { 
        pattern: 'ROBBER', 
        options: { depth: 8 },
        color: '#ff8800' 
      },
    },
    strengths: ['shortPass', 'slots', 'spread'],
    weaknesses: ['crossing', 'picks', 'mismatches'],
    aiInstructions: {
      'CB/NCB': 'Press coverage on receivers',
      'MLB': 'Cover RB out of backfield',
      'SS': 'Read QB eyes, jump routes in middle'
    }
  }),
  
  // GOAL LINE DEFENSE
  
  // Goal Line: Stack the Box (Run defense)
  createPlay({
    id: 'goal-line-stack',
    name: 'Goal Line Stack',
    type: 'run',
    formation: DEFENSIVE_FORMATIONS.GOAL_LINE_D,
    difficultyLevel: 1,
    description: 'Heavy front to stop short-yardage runs',
    routes: {
      'DE1': { pattern: 'CRASH', options: { direction: 'in' }, color: '#888888' },
      'DT1': { pattern: 'CRASH', options: { direction: 'in' }, color: '#888888' },
      'NT': { pattern: 'CRASH', options: { direction: 'in' }, color: '#888888' },
      'DT2': { pattern: 'CRASH', options: { direction: 'in' }, color: '#888888' },
      'DE2': { pattern: 'CRASH', options: { direction: 'in' }, color: '#888888' },
      'LB1': { pattern: 'FILL_GAP', options: { gap: 'A' }, color: '#ff0000' },
      'LB2': { pattern: 'FILL_GAP', options: { gap: 'B' }, color: '#ff0000' },
      'LB3': { pattern: 'FILL_GAP', options: { gap: 'A' }, color: '#ff0000' },
      'LB4': { pattern: 'FILL_GAP', options: { gap: 'B' }, color: '#ff0000' },
      'SS': { pattern: 'FILL_GAP', options: { gap: 'C' }, color: '#ff0000' },
      'FS': { pattern: 'ZONE_DEEP', options: { side: 'middle', depth: 10 }, color: '#00ffff' },
    },
    strengths: ['goalLine', 'shortYardage', 'insideRun'],
    weaknesses: ['playAction', 'outsideRun'],
    aiInstructions: {
      'DL': 'Fire out low, penetrate gaps',
      'LB': 'Attack line of scrimmage immediately',
      'FS': 'Watch for play action pass'
    }
  })
];

export default defensivePlays;