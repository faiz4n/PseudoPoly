import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined') {
  const isNative = Boolean(
    window.Capacitor?.isNativePlatform?.() ||
    window.AndroidHostServer ||
    (navigator.userAgent && navigator.userAgent.includes('wv')) ||
    /Android.*Version\/[0-9.]+\s+Chrome\/[0-9.]+\s+Mobile/i.test(navigator.userAgent || '')
  );
  if (isNative) {
    document.documentElement.classList.add('is-capacitor');
    if (document.body) document.body.classList.add('is-capacitor');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
