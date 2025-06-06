import { models, ADDITIONAL_REQUEST_COST } from "./models";
import { useState } from "react";
import Select from 'react-select';

export default function Calculator() {
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
  const [selectedModels, setSelectedModels] = useState([models[0]]);
  const [requestCount, setRequestCount] = useState("");
  const [developerCount, setDeveloperCount] = useState(1);
  const [overage, setOverage] = useState(0);
  const [divideRequests, setDivideRequests] = useState(false);

  // Create options for react-select with colors
  const modelOptions = models.map((model, index) => ({
    value: model,
    label: model.name === "Base model (GPT-4.1)" ? "Base (GPT-4.1)" : model.name,
    color: `hsl(${(index * 137.5) % 360}, 70%, 60%)` // Generate distinct colors
  }));

  // Create plan options for react-select
  const planOptions = plans.map((plan, index) => ({
    value: plan,
    label: plan.name,
    color: `hsl(${(index * 180) % 360}, 70%, 60%)` // Generate distinct colors for plans
  }));

  const getMultiplier = () => {
    if (selectedModels.length === 1) {
      const model = selectedModels[0];
      if (model.name === "Base model (GPT-4.1)") {
        return 0;
      }
      return model.multiplier;
    }
    // For multiple models, return null to indicate "see details below"
    return null;
  };

  const calculatePremiumUsed = () => {
    if (selectedModels.length === 1) {
      const multiplier = selectedModels[0].name === "Base model (GPT-4.1)" ? 0 : selectedModels[0].multiplier;
      return (requestCount || 0) * multiplier * (developerCount || 1);
    }
    
    if (divideRequests) {
      // Divide requests across models, but exclude base model from division
      const premiumModels = selectedModels.filter(model => model.name !== "Base model (GPT-4.1)");
      const requestsPerModel = premiumModels.length > 0 ? Math.floor((requestCount || 0) / premiumModels.length) : 0;
      
      return selectedModels.reduce((total, model) => {
        const multiplier = model.name === "Base model (GPT-4.1)" ? 0 : model.multiplier;
        if (model.name === "Base model (GPT-4.1)") {
          return total; // Base model contributes 0 regardless of request count
        }
        return total + (requestsPerModel * multiplier * (developerCount || 1));
      }, 0);
    } else {
      // Use same number of requests for each model
      return selectedModels.reduce((total, model) => {
        const multiplier = model.name === "Base model (GPT-4.1)" ? 0 : model.multiplier;
        return total + ((requestCount || 0) * multiplier * (developerCount || 1));
      }, 0);
    }
  };

  const premiumUsed = calculatePremiumUsed();
  const included = selectedPlan.allowance * (developerCount || 1);
  const overageRequests = Math.max(0, premiumUsed - included);
  const overageCost = overageRequests * ADDITIONAL_REQUEST_COST;

  return (
    <div className="copilot-card">
      {/* Top Row: Plan and Model Selectors */}
      <div className="form-row">
        <div className="form-column">
          <label>
            Plan:
            <Select
              value={planOptions.find(option => option.value.key === selectedPlan.key)}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setSelectedPlan(selectedOption.value);
                }
              }}
              options={planOptions}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: '#161b22',
                  borderColor: state.isFocused ? '#7c3aed' : '#30363d',
                  color: '#e6edf3',
                  minHeight: '44px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: '1px solid #30363d',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(124, 58, 237, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    borderColor: '#7c3aed',
                    backgroundColor: '#0d1117'
                  }
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  zIndex: 9999
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected 
                    ? '#7c3aed' 
                    : state.isFocused 
                      ? '#21262c' 
                      : '#161b22',
                  color: '#e6edf3',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#21262c'
                  }
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#7d8590'
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#e6edf3'
                }),
                input: (provided) => ({
                  ...provided,
                  color: '#e6edf3'
                })
              }}
              placeholder="Select plan..."
            />
          </label>
        </div>

        <div className="form-column">
          <label>
            Model:
            <Select
              isMulti
              value={selectedModels.map(model => modelOptions.find(opt => opt.value === model))}
              onChange={(selectedOptions) => {
                if (selectedOptions && selectedOptions.length > 0) {
                  setSelectedModels(selectedOptions.map(opt => opt.value));
                } else {
                  // If no models selected, default to base model
                  setSelectedModels([models[0]]);
                }
              }}
              options={modelOptions}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: '#161b22',
                  borderColor: state.isFocused ? '#7c3aed' : '#30363d',
                  color: '#e6edf3',
                  minHeight: '44px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: '1px solid #30363d',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(124, 58, 237, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    borderColor: '#7c3aed',
                    backgroundColor: '#0d1117'
                  }
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  zIndex: 9999
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected 
                    ? '#7c3aed' 
                    : state.isFocused 
                      ? '#21262c' 
                      : '#161b22',
                  color: '#e6edf3',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#21262c'
                  }
                }),
                multiValue: (provided, { data }) => ({
                  ...provided,
                  backgroundColor: data.color + '20',
                  borderRadius: '4px',
                  border: `1px solid ${data.color}`
                }),
                multiValueLabel: (provided, { data }) => ({
                  ...provided,
                  color: '#e6edf3',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }),
                multiValueRemove: (provided, { data }) => ({
                  ...provided,
                  color: data.color,
                  '&:hover': {
                    backgroundColor: data.color + '40',
                    color: '#ffffff'
                  }
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#7d8590'
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#e6edf3'
                }),
                input: (provided) => ({
                  ...provided,
                  color: '#e6edf3'
                })
              }}
              placeholder="Select models..."
            />
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
                value={developerCount === 0 ? "" : developerCount}
                min="0"
                placeholder="Enter number of developers"
                onChange={e => {
                  const val = e.target.value;
                  if (val === "") {
                    setDeveloperCount(0);
                  } else {
                    setDeveloperCount(Number(val));
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Plan Details and Model Info Row */}
      <div className="details-row">
        <div className="plan-details">
          <h3 className="plan-details-title">Plan Details (Per User/Month)</h3>
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
                {selectedPlan.allowance.toLocaleString()}
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
                {selectedModels.length === 1 
                  ? (selectedModels[0].name === "Base model (GPT-4.1)" ? "Base (GPT-4.1)" : selectedModels[0].name)
                  : "Multiple Selected*"
                }
              </span>
            </div>
            <div className="model-detail-row">
              <span className="model-detail-label">Multiplier:</span>
              <span className="model-detail-value">
                {selectedModels.length === 1
                  ? (getMultiplier() === 0 ? "Unlimited" : getMultiplier())
                  : "see details below*"
                }
              </span>
            </div>
            {selectedModels.length === 1 && selectedModels[0].note && selectedModels[0].name !== "Base model (GPT-4.1)" && (
              <div className="model-detail-row">
                <span className="model-detail-label">Note:</span>
                <span className="model-detail-value">
                  {selectedModels[0].note}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Multiplier Section - Now Outside the Card */}
      <h2 className="multiplier-title">
        {selectedModels.length === 1 ? "Model Multiplier" : "Model Multiplier Breakdown"}
      </h2>
        <div className="multiplier-info">
          {selectedModels.length === 1 && getMultiplier() !== 0 && (
            <>
              <p className="multiplier-description">
                <strong>{selectedModels[0].name === "Base model (GPT-4.1)" ? "Base (GPT-4.1)" : selectedModels[0].name}</strong> has a request multiplier of:
              </p>
              <div className="single-multiplier-value">{getMultiplier()}</div>
            </>
          )}
          {selectedModels.length === 1 ? (
            // Single model display
            getMultiplier() === 0 ? (
              <div className="unlimited-section">
                <div className="unlimited-icon">∞</div>
                <div className="unlimited-text">Unlimited</div>
                <div className="unlimited-description">Base model requests don't count against your premium request allowance</div>
              </div>
            ) : (
              <div className="multiplier-explanation">
                <div className="formula-display">
                  <h4>Formula:</h4>
                  <div className="formula formula-aligned">
                    <span className="formula-part">{requestCount || 0}</span>
                    <span className="formula-operator">×</span>
                    <span className="formula-part">{getMultiplier()}</span>
                    <span className="formula-operator">×</span>
                    <span className="formula-part">{developerCount || 1}</span>
                    <span className="formula-operator">=</span>
                    <span className="formula-result">{premiumUsed.toLocaleString()}</span>
                  </div>
                  <div className="formula-labels formula-aligned">
                    <span className="formula-label">Requests</span>
                    <span className="formula-label blank"></span>
                    <span className="formula-label">Multiplier</span>
                    <span className="formula-label blank"></span>
                    <span className="formula-label">Developers</span>
                    <span className="formula-label blank"></span>
                    <span className="formula-label">Premium Used</span>
                  </div>
                </div>
              </div>
            )
          ) : (
            // Multiple models display
            <div className="multiplier-explanation">
              {/* Toggle positioned directly above formula breakdown */}
              <div className="toggle-container-below-title">
                <span className="toggle-text">Divide the number of requests across the selected models</span>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={divideRequests}
                    onChange={(e) => setDivideRequests(e.target.checked)}
                    className="toggle-switch"
                  />
                </label>
              </div>
              <div className="formula-display">
                {selectedModels.map((model, index) => {
                  const color = modelOptions.find(opt => opt.value === model)?.color || '#58a6ff';
                  const multiplier = model.name === "Base model (GPT-4.1)" ? 0 : model.multiplier;
                  
                  // Calculate requests per model based on toggle state
                  let requestsForModel;
                  if (model.name === "Base model (GPT-4.1)") {
                    requestsForModel = "∞"; // Always show unlimited for base model
                  } else if (divideRequests) {
                    // When dividing, exclude base model from division calculation
                    const premiumModels = selectedModels.filter(m => m.name !== "Base model (GPT-4.1)");
                    requestsForModel = premiumModels.length > 0 ? Math.floor((requestCount || 0) / premiumModels.length) : (requestCount || 0);
                  } else {
                    requestsForModel = (requestCount || 0);
                  }
                  
                  const premiumForModel = typeof requestsForModel === 'string' ? 0 : requestsForModel * multiplier * (developerCount || 1);
                  
                  return (
                    <div key={index} className="formula-breakdown-container" style={{ 
                      marginBottom: index === selectedModels.length - 1 ? '1rem' : '1.5rem',
                      paddingBottom: index === selectedModels.length - 1 ? '0' : '1rem',
                      borderBottom: index === selectedModels.length - 1 ? 'none' : '1px solid #30363d'
                    }}>
                      <h5 style={{ color: color, margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600', textAlign: 'left' }}>
                        {model.name === "Base model (GPT-4.1)" ? "Base (GPT-4.1)" : model.name}
                      </h5>
                      {multiplier === 0 ? (
                        <>
                          <div className="formula formula-aligned" style={{ fontSize: '0.9rem' }}>
                            <span className="formula-part">{typeof requestsForModel === 'string' ? requestsForModel : requestsForModel}</span>
                            <span className="formula-operator">×</span>
                            <span className="formula-part">0</span>
                            <span className="formula-operator">×</span>
                            <span className="formula-part">{developerCount || 1}</span>
                            <span className="formula-operator">=</span>
                            <span className="formula-result unlimited-result">∞</span>
                          </div>
                          <div className="formula-labels formula-aligned">
                            <span className="formula-label">Requests</span>
                            <span className="formula-label blank"></span>
                            <span className="formula-label">Multiplier</span>
                            <span className="formula-label blank"></span>
                            <span className="formula-label">Developers</span>
                            <span className="formula-label blank"></span>
                            <span className="formula-label" style={{ visibility: 'hidden' }}></span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="formula formula-aligned" style={{ fontSize: '0.9rem' }}>
                            <span className="formula-part">{requestsForModel}</span>
                            <span className="formula-operator">×</span>
                            <span className="formula-part">{multiplier}</span>
                            <span className="formula-operator">×</span>
                            <span className="formula-part">{developerCount || 1}</span>
                            <span className="formula-operator">=</span>
                            <span className="formula-result">{premiumForModel.toLocaleString()}</span>
                          </div>
                          <div className="formula-labels formula-aligned">
                            <span className="formula-label">Requests</span>
                            <span className="formula-label blank"></span>
                            <span className="formula-label">Multiplier</span>
                            <span className="formula-label blank"></span>
                            <span className="formula-label">Developers</span>
                            <span className="formula-label blank"></span>
                            <span className="formula-label">Premium Used</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Total Premium Request with breakdown style */}
              <div className="total-premium-section">
                <div className="total-premium-card">
                  <div className="total-premium-row">
                    <span className="total-premium-label">Total Premium Request:</span>
                    <span className="total-premium-spacer"></span>
                    <span className="total-premium-spacer"></span>
                    <span className="total-premium-spacer"></span>
                    <span className="total-premium-spacer"></span>
                    <span className="total-premium-spacer"></span>
                    <span className="total-premium-value">
                      {premiumUsed.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      <h2 className="results-title">Total Cost for additional Premium Requests</h2>
      <div className="results-section">
        <div className="result-row">
          <span>Premium requests used:</span>
          <b>{premiumUsed.toLocaleString()}</b>
        </div>
        <div className="result-row result-row-minus">
          <span>Included in plan:</span>
          <b><span className="result-minus">-</span>{included.toLocaleString()}</b>
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
  );
}
