import { models, ADDITIONAL_REQUEST_COST } from "./models";
import { useState } from "react";
import copilotIcon from './assets/github-copilot-white-icon.svg';

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
  const [requestCount, setRequestCount] = useState("");
  const [developerCount, setDeveloperCount] = useState(1);
  const [overage, setOverage] = useState(0);

  const getMultiplier = () => {
    if (selectedModel.name === "Base model (GPT-4.1)") {
      return 0;
    }
    return selectedModel.multiplier;
  };

  const premiumUsed = (requestCount || 0) * getMultiplier() * developerCount;
  const included = selectedPlan.allowance;
  const overageRequests = Math.max(0, premiumUsed - included);
  const overageCost = overageRequests * ADDITIONAL_REQUEST_COST;

  return (
    <div className="copilot-hero-bg">
      <header className="copilot-header">
        <img src={copilotIcon} alt="GitHub Copilot" className="copilot-header-icon" />
        <span className="copilot-logo">Copilot Premium Request Calculator</span>
      </header>
      <main className="copilot-main">
        <div className="copilot-card">
          {/* Top Row: Plan and Model Selectors */}
          <div className="form-row">
            <div className="form-column">
              <label>
                Plan:
                <select value={selectedPlan.key} onChange={e => setSelectedPlan(plans.find(p => p.key === e.target.value))}>
                  {plans.map(plan => (
                    <option key={plan.key} value={plan.key}>{plan.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-column">
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
            </div>
          </div>

          {/* Request Count and Developer Count Inputs */}
          <div className="request-input-section">
            <div className="form-row">
              <div className="form-column">
                <label>
                  Number of requests:
                  <input
                    type="number"
                    value={requestCount}
                    min="0"
                    placeholder="Enter number of requests"
                    onChange={e => setRequestCount(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </label>
              </div>
              
              <div className="form-column">
                <label>
                  Total number of developers:
                  <input
                    type="number"
                    value={developerCount}
                    min="1"
                    placeholder="Enter number of developers"
                    onChange={e => setDeveloperCount(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Plan Details and Model Info Row */}
          <div className="details-row">
            <div className="plan-details">
              <h3 className="plan-details-title">Plan Details</h3>
              <div className="plan-details-content">
                <div className="plan-detail-row">
                  <span className="plan-detail-label">Monthly Cost:</span>
                  <span className="plan-detail-value">
                    ${selectedPlan.key === 'business' ? '19' : '39'} USD
                  </span>
                </div>
                <div className="plan-detail-row">
                  <span className="plan-detail-label">Premium Requests:</span>
                  <span className="plan-detail-value">
                    {selectedPlan.allowance.toLocaleString()}/month
                  </span>
                </div>
              </div>
            </div>

            <div className="model-info">
              <h3>Selected Model</h3>
              <div className="model-info-content">
                <div className="model-detail-row">
                  <span className="model-detail-label">Model Name:</span>
                  <span className="model-detail-value">
                    {selectedModel.name}
                  </span>
                </div>
                <div className="model-detail-row">
                  <span className="model-detail-label">Multiplier:</span>
                  <span className="model-detail-value">
                    {getMultiplier() === 0 ? "Unlimited" : getMultiplier()}
                  </span>
                </div>
                {selectedModel.note && (
                  <div className="model-detail-row">
                    <span className="model-detail-label">Note:</span>
                    <span className="model-detail-value">
                      {selectedModel.note}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Model Multiplier Section */}
          <div className="multiplier-section">
            <div className="multiplier-info">
              <div className="multiplier-header">
                <h3>Model Multiplier</h3>
                <div className="multiplier-value">{getMultiplier()}</div>
              </div>
              {getMultiplier() === 0 ? (
                <div className="unlimited-section">
                  <div className="unlimited-icon">∞</div>
                  <div className="unlimited-text">Unlimited</div>
                  <div className="unlimited-description">Base model requests don't count against your premium request allowance</div>
                </div>
              ) : (
                <div className="multiplier-explanation">
                  <p>Each request to this model uses <strong>{getMultiplier()}</strong> premium requests from your allowance.</p>
                </div>
              )}
            </div>
          </div>
          <h2 className="results-title">Total Cost for additional Premium Requests</h2>
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
