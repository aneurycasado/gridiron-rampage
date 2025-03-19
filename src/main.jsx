import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HUD } from './HUD.jsx'
import { Landing } from './Landing.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <HUD />
    <Landing />
  </React.StrictMode>,
)