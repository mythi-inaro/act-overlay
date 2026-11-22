import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { installOverlayApi } from './lib/overlaySocket'
import './index.css'
import App from './App.tsx'

installOverlayApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
