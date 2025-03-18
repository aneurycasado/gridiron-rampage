# Gridiron Rampage 3D

A fast-paced, 7-on-7 street football showdown set in a walled urban arena. Leap off walls, chain wild laterals, build up a 'Rage Meter,' and unleash unstoppable moves to humiliate your opponents—all in a stylish, arcade experience on the web.

## Features

- 🏈 Fast-paced street football action with arcade-style gameplay
- 🧱 Wall-running and jumping mechanics for parkour-style moves
- 🔥 Rage Meter system for unleashing powerful special moves
- 🎮 Multiple control options (keyboard/gamepad)
- 🏃‍♂️ Player controller with movement, jumping, and special moves
- 🎯 Football physics with throwing, catching, and fumble mechanics

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gridiron-rampage.git
cd gridiron-rampage

# Install dependencies
npm install
# or with pnpm
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or with pnpm
pnpm dev
```

Visit http://localhost:5173 to see the game in your browser. The development server includes hot-reloading for quick iteration.

### Building for Production

```bash
# Build for production
npm run build
# or with pnpm
pnpm build

# Preview production build
npm run preview
# or with pnpm
pnpm preview
```

## Technology Stack

- [React](https://reactjs.org/) - UI framework
- [Three.js](https://threejs.org/) - 3D rendering
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React renderer for Three.js
- [React Three Drei](https://github.com/pmndrs/drei) - Useful helpers for React Three Fiber
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Vite](https://vitejs.dev/) - Build tool and development server

## Controls

### Keyboard
- WASD or Arrow Keys: Move player
- Shift: Sprint/turbo
- Space: Jump/dive
- Q/E: Juke left/right
- R: Lateral pass
- F: Stiff arm/power move
- Ctrl: Showboat (increases Rage Points)

### Gamepad
- Left stick: Move player
- Right trigger: Sprint/turbo
- A/X button: Jump/dive
- B/Circle: Juke
- X/Square: Lateral pass
- Y/Triangle: Stiff arm
- Right shoulder: Showboat

## Project Structure

- `/src` - Source code
  - `/components` - React components
    - `/models` - 3D models and objects
  - `/sounds` - Audio files
- `/public` - Static assets
  - `/models` - 3D model files
  - `/images` - Images and textures
  - `/sounds` - Sound effects and music

## Acknowledgments

- Football assets from [Kenney](https://kenney.nl/)
- Sound effects from [various sources]

## License

This project is licensed under the MIT License - see the LICENSE file for details.