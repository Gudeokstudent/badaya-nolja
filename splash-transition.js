(() => {
  const style = document.createElement('style');
  style.textContent = `
    .auth-gate:not(.splash-complete) #loginPanel { opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(18px); }
    .auth-gate.splash-complete #loginPanel { opacity: 1; visibility: visible; transform: translateY(0); transition: opacity .5s ease, transform .5s ease; }
    .splash { animation: splashExitClean 2.55s ease forwards !important; }
    .splash-logo { animation: logoGrowClean 1.3s cubic-bezier(.18,.82,.24,1) both !important; }
    @keyframes logoGrowClean { from { opacity: 0; transform: scale(.62); } 72% { opacity: 1; transform: scale(1.04); } to { opacity: 1; transform: scale(1); } }
    @keyframes splashExitClean { 0%, 74% { opacity: 1; visibility: visible; } 100% { opacity: 0; visibility: hidden; pointer-events: none; } }
    @media (prefers-reduced-motion: reduce) { .splash { display: none !important; } .auth-gate #loginPanel { opacity: 1 !important; visibility: visible !important; transform: none !important; } }
  `;
  document.head.appendChild(style);
  window.setTimeout(() => document.getElementById('authGate')?.classList.add('splash-complete'), 2600);
})();
