import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import copilotIcon from './assets/github-copilot-white-icon.svg';
import Calculator from './Calculator';
import FeatureComparison from './FeatureComparison';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="copilot-nav">
      <Link 
        to="/" 
        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
      >
        Premium Calculator
      </Link>
      <Link 
        to="/features" 
        className={`nav-link ${location.pathname === '/features' ? 'active' : ''}`}
      >
        Feature Comparison
      </Link>
    </nav>
  );
}

export default function App() {

  return (
    <Router basename="/GitHubCopilot_PremiumRequests">
      <div className="copilot-hero-bg">
        <header className="copilot-header">
          <img src={copilotIcon} alt="GitHub Copilot" className="copilot-header-icon copilot-header-icon-large" />
          <span className="copilot-logo">GitHub Copilot Tools</span>
        </header>
        <Navigation />
        <main className="copilot-main">
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/features" element={<FeatureComparison />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
