1. High-Level Concept
Game Title: Gridiron Rampage 3D
Elevator Pitch: “A fast-paced, 7-on-7 street football showdown set in a walled urban arena. Leap off walls, chain wild laterals, build up a ‘Rage Meter,’ and unleash unstoppable moves to humiliate your opponents—all in a stylish, arcade experience on the web.”

Genre & Style: Arcade sports (American football) with exaggerated physics and showboat moves.
Platform & Target Audience:
Platform: Web (desktop browsers) using Three.js.
Audience: Casual to mid-core players who enjoy quick, over-the-top sports games with flashy visuals and minimal realism. Age 10+.
2. Core Mechanics
2.1 Gameplay Loop
Kickoff Possession (Simplified Start): Offense begins at their own “start line.”
Drive to Score: Use limited downs (4 downs) to cross midfield (first down) or reach the end zone.
Style Moves & Lateral Chains: Earn “Rage Points” for flashy plays (jukes, wall runs, big hits).
Rage Meter & Rage Mode: Accumulate enough points to trigger a short burst of super-powered play.
Score Touchdowns: Must attempt a 2-point conversion (no field goals). First team to 24 (example) wins.
2.2 No Penalties, No Punts
No penalty system.
No punt/field goal mechanics; must “go for it” on every down.
After scoring, possession flips and the new offense starts from their own side again.
2.3 Wall Interactions
Wall Runs/Jumps: Ball-carriers and receivers can press a button to run up or leap off walls.
Wall Hurdles: Jump over tackling defenders by launching off the wall.
Wall Catch: Receivers can jump off a wall to grab high passes.
Hot Spots (MVP scope permitting): Certain marked areas on walls grant bonus Rage Points when performing moves.
2.4 Rage Meter (Equivalent to “Gamebreaker”)
Earning Points: Style moves (jukes, spins, dives, stiff arms), big hits, showboating.
Risk vs. Reward: Showboating while carrying the ball increases chance of a fumble if tackled.
Rage Mode Activation: Once the meter is full, the player can activate Rage Mode pre-snap.
Effect: Short duration of boosted speed, unstoppable tackles, or guaranteed stiff-arm.
For a 1-week MVP, skip elaborate cinematics; just apply a glow effect and buff stats.
3. Controls & Input (Web/Three.js)
Since it’s a browser game, assume keyboard + mouse or controller support. For the 1-week MVP, we’ll focus on keyboard.

Offense (Keyboard):

W/A/S/D or Arrow Keys = Move player.
Shift = Turbo/Sprint (drains a short “stamina” bar).
Space = Jump / Dive (tap for jump, hold for dive).
Q/E = Juke left/right (or spin move with a quick double-tap).
Left Click = Pass (if quarterback); aim with mouse.
R = Lateral/pitch backward.
F = Stiff Arm / Power shove.
Hold Ctrl = Showboat (increases Rage Points but higher fumble risk).
Defense (Keyboard):

W/A/S/D or Arrow Keys = Move defender.
Shift = Sprint.
Space = Dive tackle.
F = Power tackle / big hit.
R = Attempt strip (risky, might miss tackle).
Ctrl = “Style Tackle” (super hard hit if Rage Mode is active).
Wall Moves:

If near a wall and pressing Space + direction toward wall, the player runs up or leaps off the wall.
For a 1-week build, keep it simple: a single key + direction triggers the wall move animation.
4. Art & Audio Direction
4.1 Art Style
Low-Poly / Stylized Characters: Vibrant colors, exaggerated proportions (like big shoulders, big helmets, etc.).
Urban Environment: One main “back alley” or “rooftop” arena enclosed by chain-link fences or walls.
UI & FX: Bold neon outlines or “comic-book” style speed lines when sprinting. Rage Mode applies a glowing aura.
4.2 Audio
Music: Upbeat, hip-hop/electronic loops to match the street vibe.
SFX: Loud “impact” sounds for big tackles, whoosh effect for turbo, and short DJ scratch or horn sounds on scoring.
Given time constraints, consider using royalty-free or pre-made audio loops.

5. Technical Overview
5.1 Engine & Tools
Three.js for 3D rendering in the browser.
Possible Physics Handling: A minimal custom collision detection for tackling (or use a small physics library like Cannon.js, though it might be overkill).
Animation: Simple keyframe or skeletal animations for run, juke, tackle. Reuse minimal sets.
5.2 Core Architecture
Game States: Title Screen → Team Select (optional) → Game Loop → End Screen.
Networking (Optional): If time allows, add local multiplayer with gamepad support. Real-time netplay may be too large a scope for 1 week, so possibly local co-op or 2-player on same keyboard/controller.
5.3 Performance Targets
60 FPS on modern browsers with a simplified stadium environment.
Lightweight character models (under 2–3k polygons each).
Use sprite-based crowds or minimal environment objects.
6. Gameplay Systems
6.1 Scoring & Win Conditions
Touchdown = 6 points
Mandatory 2-Point Conversion: If successful, add +2.
First to 24 points (or 36 if time/balance allows) wins.
6.2 Downs & Field Progress
4 downs to cross midfield or score. If offense fails, turnover on downs.
Field is short for faster gameplay. Example: ~50-yard total length.
6.3 “Rage Mode” Detailed
Rage Meter Fill Rate: ~100 points needed.
Actions awarding points:
Tackle for loss: +10
Big hit tackle: +15
Juke/spin/wall move: +5 each
Showboat run +2 per second
TD +20
Duration of Rage Mode: 1 short drive or ~15 seconds of in-play time.
6.4 AI Behavior (MVP Scope)
Basic Offensive AI: Random mix of short pass, run, or deep pass. Attempts a juke if near a defender.
Basic Defensive AI: One rusher, one short coverage, one deep coverage. If the QB scrambles, pursuit engages.
Fine-tuning AI beyond basic coverage or pathfinding may be limited in 1-week scope.
7. Level / Arena Design
Single Arena: A fenced “street” or “warehouse rooftop” with graffiti.
Walls on Sidelines: Allows for the signature wall-run moves.
Visual Markers: 50-yard line for first down, end zones on opposite sides.
Hot Spots (Optional): Some bright graffiti spots on walls awarding extra Rage Points when used.
8. Production Plan (One-Week Sprint)
Day	Tasks
Day 1	- Set up Three.js project
- Basic field & environment model
- Import placeholder player models + basic animations (run, tackle, etc.)
- Simple input handling (move, pass)
Day 2	- Implement collision detection & tackling logic
- Basic AI (dummy logic)
- Basic scoreboard & downs system
Day 3	- Add style moves (jukes, stiff arms, wall jump)
- Implement Rage Meter mechanics
- Simple showboat animations/effects
Day 4	- Polishing visuals (UI overlay, scoreboard art)
- Sound effects & minimal background music
- Basic camera improvements (tracking ball-carrier)
Day 5	- Additional tuning: fumble logic, difficulty adjustments
- Single-level environment polish (textures, graffiti, lighting)
Day 6	- Final pass on AI improvements (better route running, coverage)
- Test all major bugs & fix critical ones
Day 7	- Add finishing touches to UI & main menu screen
- Performance optimization (reduce draw calls, compress textures)
- Final QA & build
Team Roles (for a 2–3 person team):

Developer 1: Core Three.js setup, game state logic, collision/tackling system.
Developer 2: Player controls, AI logic, UI.
Artist/Designer (or shared): Quick environment modeling, texture creation, simple animations, audio integration.
9. Monetization & Release
Distribution: Free web release (itch.io or personal website).
Monetization (If Any): Possibly ad-supported or donation-based. Realistically, in one week, it’s primarily a prototype/demo.
Future Potential: If well-received, expand to multiple levels, online multiplayer, more teams, deeper AI, etc.
10. Appendices / References
Inspirations:
NFL Street 2 (EA Sports Big) for wall moves, style meter, and 7-on-7 format.
NBA Street series for the concept of “Gamebreaker” or “Rage” sequences.
Rocket League (for quick, arcade-style match flow).
Art & Sound Sources:
Placeholder or free low-poly models from sites like Sketchfab / Poly Pizza.
Royalty-free SFX from freesound.org or similar.
Possible Future Additions (Post-Week Scope):
Multiple arenas with unique hazards (alley trash cans, rooftop edges).
Deeper stat system (e.g., speed, tackling, run power).
Online multiplayer with real-time netcode.
Final Notes
This GDD aims to outline the minimum viable feature set and workflow to replicate the spirit of a “street” football game in one week using Three.js. Focus on core fun—the flashy moves, quick scoring, and intense collisions—rather than full NFL realism. Keep the scope tight, iterate daily, and ensure the basic arcade loop (grab ball → juke defenders → score with style) feels satisfying before adding any extras. Good luck with Gridiron Rampage 3D!