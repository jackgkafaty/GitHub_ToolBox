import { models, ADDITIONAL_REQUEST_COST } from "./models";
import { useState } from "react";
import { CopilotIcon } from "./CopilotIcon";

export default function App() {
  const plans = [
    {
      key: "business",
      name: "Business",
      allowance: 300,
      description: (
        <ul>
          <li>Unlimited agent mode and chats with GPT-4.11</li>
          <li>Unlimited code completions</li>
          <li>Access to code review, Claude 3.5/3.7/4 Sonnet, Gemini 2.5 Pro, and more</li>
          <li>300 premium requests to use latest models per user, with the option to buy more</li>
          <li>User management and usage metrics</li>
          <li>IP indemnity and data privacy</li>
        </ul>
      ),
    },
    {
      key: "enterprise",
      name: "Enterprise",
      allowance: 1000,
      description: (
        <ul>
          <li>Everything in Business and:</li>
          <li>Access to all models, including Claude Opus 4, o3, and GPT-4.5</li>
          <li>3.33x more premium requests than Business to use the latest models, with the option to buy more</li>
          <li>Coding agent (preview)</li>
        </ul>
      ),
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [requestCount, setRequestCount] = useState(1);
  const [overage, setOverage] = useState(0);

  const getMultiplier = () => {
    if (selectedModel.name === "Base model (GPT-4.1)") {
      return 0;
    }
    return selectedModel.multiplier;
  };

  const premiumUsed = requestCount * getMultiplier();
  const included = selectedPlan.allowance;
  const overageRequests = Math.max(0, premiumUsed - included);
  const overageCost = overageRequests * ADDITIONAL_REQUEST_COST;

  return (
    <div className="copilot-hero-bg">
      <header className="copilot-header">
        <div className="copilot-header-left">
          <CopilotIcon size={28} className="copilot-header-icon" />
          <span className="copilot-logo">GitHub Copilot</span>
        </div>
        <span className="copilot-github-icon">{/* GitHub logo SVG or image here if desired */}</span>
      </header>
      <main className="copilot-main">
        <h1 className="copilot-title">GitHub Copilot Premium Requests</h1>
        <div className="copilot-card">
          <div className="form-section">
            <label>
              Plan:
              <select value={selectedPlan.key} onChange={e => setSelectedPlan(plans.find(p => p.key === e.target.value))}>
                {plans.map(plan => (
                  <option key={plan.key} value={plan.key}>{plan.name}</option>
                ))}
              </select>
            </label>
            <div className="plan-details">
              <h3 className="plan-details-title">Plan Details</h3>
              <div className="plan-details-content">
                <div className="plan-detail-row">
                  <span className="plan-detail-label">Monthly Cost:</span>
                  <span className="plan-detail-value">
                    ${selectedPlan.key === 'business' ? '19' : '39'} USD per granted seat per month
                  </span>
                </div>
                <div className="plan-detail-row">
                  <span className="plan-detail-label">Premium Requests:</span>
                  <span className="plan-detail-value">
                    {selectedPlan.allowance.toLocaleString()} per user per month
                  </span>
                </div>
              </div>
            </div>
            <label>
              Model:
              <select
                value={models.indexOf(selectedModel)}
                onChange={e => setSelectedModel(models[e.target.value])}
              >
                {models.map((m, i) => (
                  <option key={i} value={i}>
                    {m.name}
                    {m.note ? ` (${m.note})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="multiplier-info">
              <div className="multiplier-row">
                <span>Multiplier:</span>
                <strong>{getMultiplier()}</strong>
              </div>
              {getMultiplier() === 0 ? (
                <div className="unlimited-section">
                  <div className="unlimited-icon">∞</div>
                  <div className="unlimited-text">Unlimited</div>
                  <div className="unlimited-description">Base model requests are unlimited and don't count against your premium request allowance</div>
                </div>
              ) : (
                <div className="calculation-explanation">
                  <div className="calculation-formula">
                    Number of requests × Multiplier = Premium requests used
                  </div>
                  <div className="calculation-example">
                    Example: {requestCount} × {getMultiplier()} = <strong>{premiumUsed}</strong> premium requests
                  </div>
                </div>
              )}
            </div>
            <label>
              Number of requests:
              <input
                type="number"
                value={requestCount}
                min="0"
                placeholder="Enter number of requests"
                onChange={e => setRequestCount(Number(e.target.value))}
              />
            </label>
          </div>
          <h2 className="results-title">Results</h2>
          <div className="results-section">
            <div className="result-row">
              <span>Premium requests used:</span>
              <b>{premiumUsed.toLocaleString()}</b>
            </div>
            <div className="result-row">
              <span>Included in plan:</span>
              <b>{included.toLocaleString()}</b>
            </div>
            <div className="result-row">
              <span>Overage premium requests:</span>
              <b>{overageRequests.toLocaleString()}</b>
            </div>
            <div className="result-row">
              <span>Additional premium requests cost:</span>
              <b>${overageCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>
            </div>
            <p style={{ fontSize: "0.9em", color: "#aaa", marginTop: 16 }}>
              Additional requests are billed at ${ADDITIONAL_REQUEST_COST.toFixed(2)} per request.
            </p>
          </div>
          <div className="button-container">
            <a
              className="copilot-pricing-btn"
              href="https://github.com/features/copilot/plans?cft=copilot_li.features_copilot"
              target="_blank"
              rel="noopener noreferrer"
            >
              Plans & Pricing
            </a>
            <a
              className="copilot-feature-btn"
              href="https://docs.github.com/en/enterprise-cloud@latest/copilot/about-github-copilot/plans-for-github-copilot"
              target="_blank"
              rel="noopener noreferrer"
            >
              Feature Comparison
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
