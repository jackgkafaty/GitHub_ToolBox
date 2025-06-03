import React, { useState } from 'react';

const FeatureComparison = () => {
  const plans = ['Free', 'Pro', 'Pro+', 'Business', 'Enterprise'];
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

  const planDetails = [
    {
      name: 'Free',
      price: '$0',
      billing: 'Forever',
      description: 'For personal use',
      popular: false,
      buttonText: 'Get started',
      githubUrl: 'https://github.com/features/copilot'
    },
    {
      name: 'Pro',
      price: '$10',
      billing: 'per user/month',
      description: 'For individual developers',
      popular: false,
      buttonText: 'Start free trial',
      githubUrl: 'https://github.com/features/copilot'
    },
    {
      name: 'Pro+',
      price: '$30',
      billing: 'per user/month',
      description: 'For power users and professionals',
      popular: false,
      buttonText: 'Start free trial',
      githubUrl: 'https://github.com/features/copilot'
    },
    {
      name: 'Business',
      price: '$19',
      billing: 'per user/month',
      description: 'For teams and organizations',
      popular: false,
      buttonText: 'Start free trial',
      githubUrl: 'https://github.com/features/copilot/business'
    },
    {
      name: 'Enterprise',
      price: '$39',
      billing: 'per user/month',
      description: 'For large enterprises',
      popular: false,
      buttonText: 'Get started',
      githubUrl: 'https://github.com/enterprise'
    }
  ];

    const featureCategories = [
    {
      name: 'Premium requests',
      features: [
        {
          name: 'Premium requests',
          values: ['50 per month', '300 per month', '1500 per month', 'Up to 300 per user per month', 'Up to 1,000 per user per month']
        },
        {
          name: 'Purchase additional premium requests at $0.04/request',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        }
      ]
    },
    {
      name: 'Agents',
      features: [
        {
          name: 'Agent mode',
          values: ['Not included', 'Not included', 'Included', 'Not included', 'Included']
        },
        {
          name: 'Code review',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Coding agent',
          values: ['Only "Review selection" in VS Code', 'Included', 'Included', 'Included', 'Included'],
          preview: true
        },
        {
          name: 'Copilot Extensions',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        }
      ]
    },
    {
      name: 'Chat',
      features: [
        {
          name: 'Copilot Chat in IDEs',
          values: ['50 messages per month', 'Unlimited with base model', 'Unlimited with base model', 'Unlimited with base model', 'Unlimited with base model']
        },
        {
          name: 'Copilot Chat on GitHub.com',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Copilot Chat on GitHub Mobile',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Copilot Chat in Windows Terminal',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Copilot Chat in CLI',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Copilot Chat on Copilot.microsoft.com',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Copilot Chat skills in IDEs',
          values: ['Not included', 'Not included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Knowledge base access',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        }
      ]
    },
    {
      name: 'Models',
      features: [
        {
          name: 'GPT-4.1-turbo',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Claude 3.5 Sonnet',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Claude 3.7 Sonnet',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Claude 4 Sonnet',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Claude Opus 4',
          values: ['Not included', 'Not included', 'Included', 'Not included', 'Included']
        },
        {
          name: 'Gemini 2.5 Pro',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Gemini 2.0 Flash Experimental',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'GPT-4o',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'GPT-4o-mini',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'GPT-4.5-turbo',
          values: ['Not included', 'Not included', 'Included', 'Not included', 'Included']
        },
        {
          name: 'o1',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'o3',
          values: ['Not included', 'Not included', 'Included', 'Not included', 'Included']
        },
        {
          name: 'GitHub Models in IDEs',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Azure AI models',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        }
      ]
    },
    {
      name: 'Code completion',
      features: [
        {
          name: 'Code completion in IDEs',
          values: ['2000 completions per month', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Multi-line completion',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        }
      ]
    },
    {
      name: 'Customization',
      features: [
        {
          name: 'Block suggestions matching public code',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Fine-tuned custom models',
          values: ['Not included', 'Not included', 'Not included', 'Not included', 'Included']
        },
        {
          name: 'Organization-wide policy management',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Organization usage dashboard',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Exclude specified files',
          values: ['Not included', 'Not included', 'Not included', 'Not included', 'Included']
        },
        {
          name: 'Repository indexing for Copilot Chat',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Knowledge base indexing',
          values: ['Not included', 'Not included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Bing indexing',
          values: ['Not included', 'Not included', 'Included', 'Included', 'Included']
        }
      ]
    },
    {
      name: 'Other features',
      features: [
        {
          name: 'IP indemnity',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Identity and access management',
          values: ['Not included', 'Not included', 'Included', 'Included', 'Included']
        },
        {
          name: 'SAML single sign-on',
          values: ['Not included', 'Not included', 'Not included', 'Not included', 'Included']
        },
        {
          name: 'Audit logs',
          values: ['Not included', 'Not included', 'Not included', 'Not included', 'Included']
        },
        {
          name: 'GitHub Models increased rate limits',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        }
      ]
    }
  ];

  const getFeatureIcon = (value) => {
    if (value === 'Included') return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" fill="currentColor"/>
      </svg>
    );
    if (value === 'Not included') return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.75 8a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z" fill="currentColor"/>
      </svg>
    );
    return null;
  };

  const getFeatureClass = (value) => {
    if (value === 'Included') return 'feature-included';
    if (value === 'Not included') return 'feature-not-included';
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
              <div className="feature-label">Features</div>
              {plans.map((plan, index) => (
                <div 
                  key={plan} 
                  className={`feature-cell feature-header-cell ${
                    selectedPlans.includes(index) ? 'feature-column-highlighted' : 
                    selectedPlans.length > 0 ? 'feature-column-dimmed' : ''
                  }`}
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
