import { useState, useEffect, useRef } from 'react';

export function FloatingCopilot() {
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // Initialize position to center of screen
    setPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    const handleMouseMove = (e) => {
      // Prevent icon from going outside viewport
      const iconSize = 48;
      const padding = 10;
      let x = e.clientX;
      let y = e.clientY;
      
      // Clamp values so the icon stays on screen
      x = Math.max(iconSize / 2 + padding, Math.min(window.innerWidth - iconSize / 2 - padding, x));
      y = Math.max(iconSize / 2 + padding, Math.min(window.innerHeight - iconSize / 2 - padding, y));
      
      setPosition({ x, y });
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
        iconRef.current?.focus();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const handleIconClick = () => {
    setShowModal(true);
    setTimeout(() => modalRef.current?.focus(), 100);
  };

  const handleIconKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowModal(true);
      setTimeout(() => modalRef.current?.focus(), 100);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    iconRef.current?.focus();
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      {/* Floating Copilot Icon */}
      <div
        ref={iconRef}
        className="floating-copilot-icon"
        style={{
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
        }}
        tabIndex="0"
        aria-label="Open Copilot Modal"
        onClick={handleIconClick}
        onKeyDown={handleIconKeyDown}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#24292F" stroke="#8B949E" strokeWidth="2"/>
          <ellipse cx="32" cy="26" rx="6" ry="8" fill="#8B949E"/>
          <ellipse cx="16" cy="26" rx="6" ry="8" fill="#8B949E"/>
          <ellipse cx="32" cy="26" rx="3" ry="4" fill="#fff"/>
          <ellipse cx="16" cy="26" rx="3" ry="4" fill="#fff"/>
          <ellipse cx="24" cy="36" rx="7" ry="2" fill="#fff" opacity="0.2"/>
        </svg>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="floating-copilot-modal"
          role="dialog"
          aria-modal="true"
          tabIndex="-1"
          ref={modalRef}
          onClick={handleModalClick}
        >
          <div className="floating-modal-content">
            <button
              className="floating-modal-close"
              aria-label="Close"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2>GitHub Copilot Assistant</h2>
            <p>
              Welcome to the GitHub Copilot Premium Request Calculator!<br/>
              This floating assistant follows your cursor around the page.
            </p>
            <p>
              Use the calculator below to estimate your premium request costs
              for different GitHub Copilot models and plans.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
