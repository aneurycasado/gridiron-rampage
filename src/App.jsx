import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { Suspense, useMemo } from 'react'
import { KeyboardControls, Loader } from '@react-three/drei'
import { useStore } from "./components/store";
import * as THREE from "three";
import { Landing } from './Landing'
import { HUD } from './HUD'
import { PauseMenu } from './components/PauseMenu'
import { PauseButton } from './components/PauseButton'
import { PlayCTA } from './components/PlayCTA'
import { PlayEndedMessage } from './components/PlayEndedMessage'
import { GameNotification } from './components/GameNotification'
import { Component } from 'react'

export const Controls = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  jump: 'jump',
  tackle: 'tackle',
  spin: 'spin',
  juke: 'juke',
  lateral: 'lateral',
  showboat: 'showboat',
  reset: 'reset',
  rageMeter: 'rageMeter'
}

// Simple error boundary component to catch React errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#111',
          color: 'white',
          padding: '20px'
        }}>
          <h2>Something went wrong</h2>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              margin: '20px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Game
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const map = useMemo(
    () => [
      { name: Controls.up, keys: ['KeyW', 'ArrowUp'] },
      { name: Controls.down, keys: ['KeyS', 'ArrowDown'] },
      { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
      { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
      { name: Controls.jump, keys: ['Space'] },
      { name: Controls.tackle, keys: ['KeyF'] },
      { name: Controls.spin, keys: ['KeyE'] },
      { name: Controls.juke, keys: ['KeyQ'] },
      { name: Controls.lateral, keys: ['KeyR'] },
      { name: Controls.showboat, keys: ['ControlLeft', 'ControlRight'] },
      { name: Controls.reset, keys: ['KeyT'] },
      { name: Controls.rageMeter, keys: ['KeyG'] }
    ],
    []
  )

  return (
    <>
      {/* UI Components */}
      <Landing />
      <HUD />
      <PauseButton />
      <PauseMenu />
      <PlayCTA />
      <PlayEndedMessage />
      <GameNotification />
      <Loader />
      
      {/* 3D Scene with Error Boundary */}
      <ErrorBoundary>
        <KeyboardControls map={map}>
          <Canvas
            shadows
            camera={{
              fov: 75,
              near: 0.1,
              far: 1000,
              position: [0, 10, 20]
            }}
            gl={{ 
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
              precision: 'highp', // Use high precision for better quality
              stencil: false,     // Disable stencil buffer if not needed
              depth: true         // Ensure depth testing is enabled
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.setClearColor(0x87ceeb, 1) // Sky blue color
            }}
          >
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </Canvas>
        </KeyboardControls>
      </ErrorBoundary>
    </>
  )
}

export default App
