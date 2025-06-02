import copilotIcon from './assets/copilot-icon.png';
import { useEffect } from 'react';

export function CopilotCursorIcon() {
  useEffect(() => {
    const icon = document.getElementById('copilot-icon');
    if (!icon) return;
    const move = (e) => {
      icon.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    document.addEventListener('mousemove', move);
    return () => document.removeEventListener('mousemove', move);
  }, []);
  return (
    <div id="copilot-icon" style={{position:'fixed',top:0,left:0,pointerEvents:'none',transition:'transform 0.1s ease-out',zIndex:1000}}>
      <img src={copilotIcon} alt="Copilot Icon" style={{width:48,height:48}} />
    </div>
  );
}
