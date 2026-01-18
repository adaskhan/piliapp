import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { WheelPage } from './pages/WheelPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/random/wheel/wheel/" replace />} />
        <Route path="/random/wheel/:slug/" element={<WheelPage />} />
        <Route path="/random/wheel" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
