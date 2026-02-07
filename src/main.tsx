import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { GlobalProgressProvider } from './context/GlobalProgressContext';
import { UserProvider } from './context/UserContext';
import './index.css';
import { _0xInitShield } from './utils/shield';

// Initialize Camouflage Shield
_0xInitShield();

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered:', registration);
    }).catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}

// _0x8f2a: OS Buffer Clear Logic
const _0x8f2a = () => { 
  if (document.hidden || document.visibilityState === 'hidden') { 
    document.body.style.display = 'none'; 
  } else { 
    document.body.style.display = 'block'; 
  } 
};
document.addEventListener('visibilitychange', _0x8f2a, true);

// _0x4b1d: DevTools Input Interceptor
const _0x4b1d = (e: KeyboardEvent) => {
  if (
    e.key === 'F12' || 
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
    (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
};
window.addEventListener('keydown', _0x4b1d, true);

// _0x9c3e: Context Menu Nullifier
const _0x9c3e = (e: Event) => {
  e.preventDefault();
};
window.addEventListener('contextmenu', _0x9c3e, { passive: false });

// _0x2d1f: Runtime Integrity Check (Honeypot)
setInterval(() => {
  debugger;
}, 50);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <GlobalProgressProvider>
        <UserProvider>
            <App />
        </UserProvider>
      </GlobalProgressProvider>
    </React.StrictMode>
  );
}
