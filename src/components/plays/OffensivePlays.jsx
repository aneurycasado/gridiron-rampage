import { createPlay } from './PlayBook';
import { OFFENSIVE_FORMATIONS } from './Formations';
import { ROUTE_PATTERNS } from './Routes';

// Collection of offensive plays organized by formation and type
const offensivePlays = [
  // I-FORMATION PLAYS
  
  // I-Form: HB Dive (Basic run up the middle)
  createPlay({
    id: 'i-form-hb-dive',
    name: 'HB Dive',
    type: 'run',
    formation: OFFENSIVE_FORMATIONS.I_FORM,
    difficultyLevel: 1,
    description: 'Straightforward run up the middle behind the fullback',
    routes: {
      'QB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'FB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'RB': { 
        pattern: 'GO', 
        options: { depthAdjust: -15 }, // Short burst forward
        color: '#ff0000' 
      },
      'TE': { pattern: 'BLOCK_PASS', color: '#888888' },
      'WR1': { pattern: 'GO', color: '#888888' },
      'WR2': { pattern: 'GO', color: '#888888' },
    },
    ballCarrier: 'RB',
    strengths: ['shortYardage', 'goalLine'],
    weaknesses: ['stackedBox'],
    aiInstructions: {
      'RB': 'Follow fullback block, then find gap between center and guard',
      'FB': 'Lead block directly ahead for running back'
    }
  }),
  
  // I-Form: HB Toss (Outside run)
  createPlay({
    id: 'i-form-hb-toss',
    name: 'HB Toss',
    type: 'run',
    formation: OFFENSIVE_FORMATIONS.I_FORM,
    difficultyLevel: 2,
    description: 'Toss to the running back for outside run',
    routes: {
      'QB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'FB': { 
        pattern: 'GO', 
        options: { startPos: { x: 0, z: 0 }, widthAdjust: 5, depthAdjust: -5 },
        color: '#888888' 
      },
      'RB': { 
        pattern: 'GO', 
        options: { startPos: { x: 0, z: 0 }, widthAdjust: 8, depthAdjust: -10 },
        color: '#ff0000' 
      },
      'TE': { pattern: 'BLOCK_PASS', color: '#888888' },
      'WR1': { pattern: 'BLOCK_PASS', color: '#888888' },
      'WR2': { pattern: 'GO', color: '#888888' },
    },
    ballCarrier: 'RB',
    strengths: ['outsideRun', 'speed'],
    weaknesses: ['containDefense'],
    aiInstructions: {
      'RB': 'Take toss, follow blocks to outside, look for cutback lane',
      'FB': 'Lead block to outside, sealing edge defender'
    }
  }),
  
  // I-Form: PA Post (Play Action Pass)
  createPlay({
    id: 'i-form-pa-post',
    name: 'PA Post',
    type: 'pass',
    formation: OFFENSIVE_FORMATIONS.I_FORM,
    difficultyLevel: 3,
    description: 'Play action fake to running back, deep post route to primary receiver',
    routes: {
      'QB': { 
        pattern: 'BLOCK_PASS', 
        options: { depthAdjust: 2 },
        color: '#ffff00' 
      },
      'FB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'RB': { pattern: 'FLAT', color: '#00ff00' },
      'TE': { pattern: 'IN', color: '#00ff00' },
      'WR1': { 
        pattern: 'POST', 
        options: { depthAdjust: -5 },
        color: '#ff0000' 
      },
      'WR2': { pattern: 'GO', color: '#00ff00' },
    },
    ballCarrier: 'QB',
    strengths: ['playAction', 'deepPass'],
    weaknesses: ['goodSecondary', 'heavyBlitz'],
    aiInstructions: {
      'QB': 'Fake handoff to RB, set up in pocket, look for WR1 on post',
      'WR1': 'Run deep post route, break at 10-12 yards',
      'RB': 'Sell run fake, then release to flat as checkdown option'
    }
  }),
  
  // SHOTGUN PLAYS
  
  // Shotgun: HB Draw (Delayed run)
  createPlay({
    id: 'shotgun-hb-draw',
    name: 'HB Draw',
    type: 'run',
    formation: OFFENSIVE_FORMATIONS.SHOTGUN,
    difficultyLevel: 2,
    description: 'Delayed handoff disguised as a pass play',
    routes: {
      'QB': { 
        pattern: 'BLOCK_PASS', 
        options: { depthAdjust: -2 },
        color: '#888888' 
      },
      'RB': { 
        pattern: 'GO', 
        options: { depthAdjust: -10 },
        color: '#ff0000' 
      },
      'SLOT': { pattern: 'GO', color: '#888888' },
      'TE': { pattern: 'BLOCK_PASS', color: '#888888' },
      'WR1': { pattern: 'GO', color: '#888888' },
      'WR2': { pattern: 'GO', color: '#888888' },
    },
    ballCarrier: 'RB',
    strengths: ['passDefense', 'spreadDefense'],
    weaknesses: ['disciplinedDefense'],
    aiInstructions: {
      'QB': 'Drop back briefly to sell pass, then hand off to RB',
      'RB': 'Delay briefly, then take handoff up the middle'
    }
  }),
  
  // Shotgun: Quick Slants (Quick passing play)
  createPlay({
    id: 'shotgun-quick-slants',
    name: 'Quick Slants',
    type: 'pass',
    formation: OFFENSIVE_FORMATIONS.SHOTGUN,
    difficultyLevel: 2,
    description: 'Quick timing pass with slant routes',
    routes: {
      'QB': { 
        pattern: 'BLOCK_PASS', 
        options: { depthAdjust: 2 },
        color: '#ffff00' 
      },
      'RB': { pattern: 'FLAT', color: '#00ff00' },
      'SLOT': { 
        pattern: 'SLANT', 
        options: { sideFlip: true },
        color: '#ff0000' 
      },
      'TE': { pattern: 'IN', color: '#00ff00' },
      'WR1': { 
        pattern: 'SLANT',
        color: '#ff0000' 
      },
      'WR2': { 
        pattern: 'SLANT', 
        options: { sideFlip: true },
        color: '#00ff00' 
      },
    },
    ballCarrier: 'QB',
    strengths: ['blitzDefense', 'manCoverage'],
    weaknesses: ['zoneCoverage'],
    aiInstructions: {
      'QB': 'Quick three-step drop, read middle linebacker, throw to open slant',
      'SLOT': 'Primary read - break sharply inside at 3 steps',
      'WR1': 'Secondary read - break inside after 3 steps'
    }
  }),
  
  // Shotgun: Screen Pass (Misdirection play)
  createPlay({
    id: 'shotgun-screen',
    name: 'HB Screen',
    type: 'pass',
    formation: OFFENSIVE_FORMATIONS.SHOTGUN,
    difficultyLevel: 3,
    description: 'Misdirection screen pass to running back',
    routes: {
      'QB': { 
        pattern: 'BLOCK_PASS', 
        options: { depthAdjust: 2 },
        color: '#ffff00' 
      },
      'RB': { 
        pattern: 'SWING', 
        options: { sideFlip: true },
        color: '#ff0000' 
      },
      'SLOT': { pattern: 'GO', color: '#888888' },
      'TE': { pattern: 'GO', color: '#888888' },
      'WR1': { pattern: 'GO', color: '#888888' },
      'WR2': { pattern: 'GO', color: '#888888' },
    },
    ballCarrier: 'QB',
    strengths: ['aggressiveDefense', 'heavyBlitz'],
    weaknesses: ['disciplinedDefense', 'containDefense'],
    aiInstructions: {
      'QB': 'Drop back deep, fake deep pass, then throw screen to RB',
      'RB': 'Block briefly, then release to left flat for screen',
      'OL': 'Allow defenders through, then release downfield to block'
    }
  }),
  
  // SPREAD FORMATION PLAYS
  
  // Spread: Four Verticals (Deep passing attack)
  createPlay({
    id: 'spread-four-verticals',
    name: 'Four Verticals',
    type: 'pass',
    formation: OFFENSIVE_FORMATIONS.SPREAD,
    difficultyLevel: 4,
    description: 'Four receivers run deep vertical routes to stretch defense',
    routes: {
      'QB': { 
        pattern: 'BLOCK_PASS', 
        options: { depthAdjust: 2 },
        color: '#ffff00' 
      },
      'SLOT1': { 
        pattern: 'GO',
        options: { sideFlip: true },
        color: '#ff0000' 
      },
      'SLOT2': { 
        pattern: 'GO',
        color: '#ff0000' 
      },
      'WR1': { 
        pattern: 'GO',
        options: { sideFlip: true },
        color: '#00ff00' 
      },
      'WR2': { 
        pattern: 'GO',
        color: '#00ff00' 
      },
      'WR3': { 
        pattern: 'GO',
        color: '#00ff00' 
      },
    },
    ballCarrier: 'QB',
    strengths: ['deepPass', 'coveragePass'],
    weaknesses: ['heavyBlitz', 'goodSecondary'],
    aiInstructions: {
      'QB': 'Take deep drop, look for one-on-one matchup or safety cheat',
      'SLOT1': 'Primary read - find seam between safeties',
      'SLOT2': 'Secondary read - adjust route based on safety coverage'
    }
  }),
  
  // Spread: QB Draw (Quarterback run)
  createPlay({
    id: 'spread-qb-draw',
    name: 'QB Draw',
    type: 'run',
    formation: OFFENSIVE_FORMATIONS.SPREAD,
    difficultyLevel: 2,
    description: 'Designed quarterback run up the middle',
    routes: {
      'QB': { 
        pattern: 'GO', 
        options: { depthAdjust: -10 },
        color: '#ff0000' 
      },
      'SLOT1': { pattern: 'GO', color: '#888888' },
      'SLOT2': { pattern: 'GO', color: '#888888' },
      'WR1': { pattern: 'GO', color: '#888888' },
      'WR2': { pattern: 'GO', color: '#888888' },
      'WR3': { pattern: 'GO', color: '#888888' },
    },
    ballCarrier: 'QB',
    strengths: ['spreadDefense', 'manCoverage'],
    weaknesses: ['spyDefense', 'disciplinedDefense'],
    aiInstructions: {
      'QB': 'Fake pass briefly, then run through middle gap',
      'OL': 'Pass block initially, then create inside running lane'
    }
  }),
  
  // GOAL LINE PLAYS
  
  // Goal Line: FB Dive (Short yardage power run)
  createPlay({
    id: 'goal-line-fb-dive',
    name: 'FB Dive',
    type: 'run',
    formation: OFFENSIVE_FORMATIONS.GOAL_LINE,
    difficultyLevel: 1,
    description: 'Power run with fullback directly up the middle',
    routes: {
      'QB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'FB': { 
        pattern: 'GO', 
        options: { depthAdjust: -5 },
        color: '#ff0000' 
      },
      'RB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'TE1': { pattern: 'BLOCK_PASS', color: '#888888' },
      'TE2': { pattern: 'BLOCK_PASS', color: '#888888' },
      'TE3': { pattern: 'BLOCK_PASS', color: '#888888' },
    },
    ballCarrier: 'FB',
    strengths: ['shortYardage', 'goalLine'],
    weaknesses: ['stackedBox'],
    aiInstructions: {
      'FB': 'Take handoff and immediately hit hole between guard and center',
      'OL': 'Fire out low and drive defenders backward'
    }
  }),
  
  // Goal Line: Play Action TE Corner (Surprise pass play)
  createPlay({
    id: 'goal-line-pa-te-corner',
    name: 'PA TE Corner',
    type: 'pass',
    formation: OFFENSIVE_FORMATIONS.GOAL_LINE,
    difficultyLevel: 3,
    description: 'Play action fake followed by tight end corner route',
    routes: {
      'QB': { 
        pattern: 'BLOCK_PASS', 
        options: { depthAdjust: 1 },
        color: '#ffff00' 
      },
      'FB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'RB': { pattern: 'BLOCK_PASS', color: '#888888' },
      'TE1': { 
        pattern: 'CORNER', 
        options: { sideFlip: true, depthAdjust: 5 },
        color: '#00ff00' 
      },
      'TE2': { 
        pattern: 'CORNER',
        options: { depthAdjust: 5 },
        color: '#ff0000' 
      },
      'TE3': { pattern: 'BLOCK_PASS', color: '#888888' },
    },
    ballCarrier: 'QB',
    strengths: ['goalLine', 'redZone'],
    weaknesses: ['disciplinedDefense', 'goodSecondary'],
    aiInstructions: {
      'QB': 'Fake handoff to RB, roll slightly right, look for TE2 in corner',
      'TE2': 'Block briefly, then release to corner of end zone',
      'RB': 'Sell fake handoff then block edge rusher'
    }
  })
];

export default offensivePlays;