import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import githubIcon from './assets/GitHub_Icon.png';
import Calculator from './Calculator';
import FeatureComparison from './FeatureComparison';
import LicensingCalculator from './LicensingCalculator';

// Google Analytics page tracking component
function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page views on route changes
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-V5F67825SF', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

// Navigation icons as SVG components for better performance
const CalculatorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8-4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8-4H7V7h2v2zm4 0h-2V7h2v2zm4 0h-2V7h2v2z"/>
  </svg>
);

const LicenseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

const CompareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 3H4v6h5V3zm0 8H4v6h5v-6zm11-8h-5v10h5V3zm0 12h-5v6h5v-6z"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.copilot-nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navigationItems = [
    {
      path: '/',
      label: 'Premium Requests Calculator',
      shortLabel: 'Calculator',
      icon: <CalculatorIcon />,
      description: 'Calculate premium request costs'
    },
    {
      path: '/licensing',
      label: 'License Calculator',
      shortLabel: 'Licensing',
      icon: <LicenseIcon />,
      description: 'Compare licensing options'
    },
    {
      path: '/features',
      label: 'Feature Comparison',
      shortLabel: 'Features',
      icon: <CompareIcon />,
      description: 'Compare plan features'
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="copilot-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        {/* Desktop Navigation */}
        <div className="nav-desktop">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              aria-label={item.description}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="mobile-navigation"
          type="button"
        >
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        {/* Current Page Indicator for Mobile */}
        <div className="current-page-mobile">
          {navigationItems.find(item => item.path === location.pathname)?.shortLabel || 'Calculator'}
        </div>

        {/* Mobile Navigation */}
        <div 
          id="mobile-navigation"
          className={`nav-mobile ${isMobileMenuOpen ? 'open' : ''}`}
          role="menu"
          aria-hidden={!isMobileMenuOpen}
        >
          {navigationItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link-mobile ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMobileMenu}
              aria-label={item.description}
              role="menuitem"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.shortLabel}</span>
              {location.pathname === item.path && (
                <span className="current-indicator" aria-hidden="true">●</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMobileMenu}
          aria-hidden="true"
          role="presentation"
        />
      )}
    </nav>
  );
}

export default function App() {
  // In development, we use '/' as the base path, in production we use '/GitHub_ToolBox'
  const basename = import.meta.env.DEV ? '/' : '/GitHub_ToolBox';

  return (
    <Router basename={basename}>
      <GoogleAnalyticsTracker />
      <div className="copilot-hero-bg">
        <header className="copilot-header">
          <img src={githubIcon} alt="GitHub" className="copilot-header-icon copilot-header-icon-large" />
          <span className="copilot-logo">GitHub ToolBox</span>
        </header>
        <Navigation />
        <div className="copilot-banner">
          The content of this resource is provided <strong>-as is-</strong> for educational purposes and it is not part of GitHub's official documentation.
          For GitHub's Official documentation, pricing and offerings, please visit 
          <a href="https://docs.github.com/en" target="_blank" rel="noopener noreferrer"> GitHub Docs</a>.
        </div>
        <main className="copilot-main">
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/licensing" element={<LicensingCalculator />} />
            <Route path="/features" element={<FeatureComparison />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
