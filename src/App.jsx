import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import githubIcon from './assets/GitHub_Icon.png';
import Calculator from './Calculator';
import FeatureComparison from './FeatureComparison';
import LicensingCalculator from './LicensingCalculator';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      label: 'Premium Requests',
      icon: '⚡',
      description: 'Calculate premium request costs'
    },
    {
      path: '/licensing',
      label: 'License Calculator',
      icon: '📊',
      description: 'General licensing calculator'
    },
    {
      path: '/features',
      label: 'Feature Comparison',
      icon: '⚖️',
      description: 'Compare Copilot plans'
    }
  ];
  
  return (
    <nav className="copilot-nav">
      <div className="nav-container">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            title={item.description}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  // In development, we use '/' as the base path, in production we use '/GitHubCopilot_PremiumRequests'
  const basename = import.meta.env.DEV ? '/' : '/GitHubCopilot_PremiumRequests';

  return (
    <Router basename={basename}>
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
