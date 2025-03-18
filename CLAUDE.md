# Development Commands for Gridiron Rampage

## Build & Development
- `npm run dev` - Start development server with host flag
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Code Style Guidelines
- **Imports**: Group imports by type (React, Three.js, local components)
- **Components**: Use functional components with hooks
- **State Management**: Use Zustand for store and state (see store.jsx)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Types**: TypeScript integration with allowJs, use proper R3F types
- **Error Handling**: Always use try/catch for interactions, audio, physics
- **Formatting**: 2-space indentation, semi-colons, single quotes preferred
- **File Organization**: Keep related components in domain folders
- **Logging**: Use console.log for development, remove for production
- **Comments**: Comment complex 3D math and game logic
- **Game Structure**: Keep physics, rendering, and game logic separate

## Three.js/React Patterns
- Use refs for direct Three.js object manipulation
- Avoid direct state updates in animation loops
- Use useFrame for animation and physics updates