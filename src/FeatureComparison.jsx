import React, { useState } from 'react';
import { planDetails, featureCategories } from './plans.js';

const FeatureComparison = () => {
  const plans = planDetails.map(plan => plan.name.replace('Copilot ', ''));
  const [selectedPlans, setSelectedPlans] = useState([]);

  const handlePlanSelect = (index) => {
    if (selectedPlans.includes(index)) {
      // Deselect if already selected
      setSelectedPlans(selectedPlans.filter(i => i !== index));
    } else if (selectedPlans.length < 2) {
      // Select if less than 2 are selected
      setSelectedPlans([...selectedPlans, index]);
    } else {
      // Replace oldest selection if 2 are already selected
      setSelectedPlans([selectedPlans[1], index]);
    }
  };

  const getFeatureIcon = (value) => {
    if (value === 'yes' || value === 'Included') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 12.5l3 3 6-6" stroke="#3fb950" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (value === 'no' || value === 'Not included') return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 10a.75.75 0 000 1.5h10a.75.75 0 000-1.5H5z" fill="currentColor"/>
      </svg>
    );
    return null;
  };

  const getFeatureClass = (value) => {
    if (value === 'yes' || value === 'Included') return 'feature-included';
    if (value === 'no' || value === 'Not included') return 'feature-not-included';
    return 'feature-custom';
  };

  return (
    <div className="feature-comparison-container">
      <div className="feature-comparison-header">
        <h1 className="feature-comparison-title">Compare GitHub Copilot Features</h1>
        <p className="feature-comparison-subtitle">Choose the plan that's right for you and your team</p>
      </div>
      
      {/* Plan Cards Section */}
      <div className="plans-grid-compact">
        {planDetails.map((plan, index) => (
          <div 
            key={plan.name} 
            className={`plan-card-compact ${
              selectedPlans.includes(index) ? 'plan-selected' : 
              selectedPlans.length > 0 ? 'plan-dimmed' : ''
            }`}
            onClick={() => handlePlanSelect(index)}
          >
            <div className="plan-card-header-compact">
              <h3 className="plan-card-name-compact">{plan.name}</h3>
              <div className="plan-card-price-compact">{plan.price}</div>
              <div className="plan-card-billing-compact">{plan.billing}</div>
            </div>
            <a 
              href={plan.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="plan-card-button-compact"
              onClick={(e) => e.stopPropagation()}
            >
              {plan.buttonText}
            </a>
          </div>
        ))}
      </div>
      
      {/* Features Table Section */}
      <div className="features-table">
        {/* Header Section */}
        <div className="feature-category">
          <div className="feature-grid">
            <div className="feature-grid-row feature-header-row">
              <div className="feature-label"></div>
              {plans.map((plan, index) => (
                <div 
                  key={plan} 
                  className={`feature-cell feature-header-cell ${
                    selectedPlans.includes(index) ? 'feature-column-highlighted' : 
                    selectedPlans.length > 0 ? 'feature-column-dimmed' : ''
                  }`}
                  onClick={() => handlePlanSelect(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{plan}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {featureCategories.map((category) => (
          <div key={category.name} className="feature-category">
            <h2 className="category-title">{category.name}</h2>
            <div className="feature-grid">
              {/* Feature rows */}
              {category.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="feature-grid-row">
                  <div className="feature-label">
                    {feature.name}
                    {feature.preview && <span className="preview-badge">Preview</span>}
                  </div>
                  {feature.values.map((value, planIndex) => (
                    <div 
                      key={planIndex} 
                      className={`feature-cell ${getFeatureClass(value)} ${
                        selectedPlans.includes(planIndex) ? 'feature-column-highlighted' : 
                        selectedPlans.length > 0 ? 'feature-column-dimmed' : ''
                      }`}
                    >
                      {getFeatureIcon(value) || value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureComparison;
