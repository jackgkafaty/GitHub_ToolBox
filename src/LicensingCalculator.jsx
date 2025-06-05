import { useState, useEffect } from "react";
import { planDetails, featureCategories } from './plans.js';
import Select from 'react-select';

export default function LicensingCalculator() {
  // Filter out plans with "Not applicable" pricing and Pro/Pro+ plans for licensing calculator
  const availablePlans = planDetails.filter(plan => 
    plan.price !== "Not applicable" && 
    !["Copilot Pro", "Copilot Pro+"].includes(plan.name)
  );
  
  const githubPlanOptions = [
    { value: "free", label: "GitHub Free" },
    { value: "team", label: "GitHub Team" },
    { value: "enterprise", label: "GitHub Enterprise Cloud" }
  ];
  
  const billingOptions = [
    { key: "monthly", name: "Monthly", multiplier: 1 },
    { key: "annual", name: "Annual", multiplier: 1 } // No discount - we'll handle pricing explicitly
  ];

  const additionalOptions = [
    { 
      key: "visualStudio", 
      name: "Visual Studio subscriptions with GitHub Enterprise", 
      price: 45, 
      description: "Visual Studio Enterprise subscription with GitHub Enterprise",
      discount: true, // Flag to indicate this option has a discount 
      discountedPrice: 0.01 // Discounted price when the user already has VS licenses
    },
    { 
      key: "enterpriseCloud", 
      name: "GitHub Enterprise Cloud", 
      price: 21, 
      description: "GitHub Enterprise Cloud user license",
      discount: false,
      discountedPrice: 21
    }
  ];
  
  // Standalone option that disables other options when enabled
  const standaloneOption = {
    key: "standalone",
    name: "GitHub Copilot Standalone",
    description: "Use GitHub Copilot without additional bundled products"
  };

  const [selectedPlan, setSelectedPlan] = useState(availablePlans[0]); // Default to first available plan
  const [developerCount, setDeveloperCount] = useState(1);
  const [selectedBilling, setSelectedBilling] = useState(billingOptions[0]);
  const [selectedGithubPlan, setSelectedGithubPlan] = useState(githubPlanOptions[0]); // Default to GitHub Free
  const [months, setMonths] = useState(1); // Default to 1 month
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasExistingVSLicenses, setHasExistingVSLicenses] = useState(true); // Always true now
  const [isStandaloneEnabled, setIsStandaloneEnabled] = useState(false);
  const [showYearlyCost, setShowYearlyCost] = useState(false); // Toggle for Monthly/Yearly display
  const [optionLicenseCounts, setOptionLicenseCounts] = useState({
    visualStudio: 0,  // Default to 0 for Visual Studio licenses
    enterpriseCloud: 0  // Default to 0 for Enterprise Cloud licenses
  });
  
  // Filter available plans based on selected GitHub plan
  const getFilteredPlans = () => {
    const githubPlanValue = selectedGithubPlan.value;
    
    // Return all available plans - removed restrictions
    return availablePlans;
  };
  
  // Get filtered plans based on GitHub plan selection
  const filteredPlans = getFilteredPlans();
  
  // Update selected plan when GitHub plan changes to ensure compatibility
  useEffect(() => {
    // Get filtered plans based on the new GitHub plan
    const filtered = getFilteredPlans();
    
    // If the current selected plan is not in the filtered list, select the first available plan
    if (!filtered.some(plan => plan.name === selectedPlan.name) && filtered.length > 0) {
      setSelectedPlan(filtered[0]);
    }
    
    // If Copilot Enterprise is selected, make sure GitHub Enterprise Cloud is the selected GitHub plan
    if (selectedPlan.name === "Copilot Enterprise" && selectedGithubPlan.value !== 'enterprise') {
      setSelectedGithubPlan(githubPlanOptions[2]); // GitHub Enterprise Cloud
    }
  }, [selectedGithubPlan]);
  
  // Set GitHub Enterprise Cloud as default when Copilot Enterprise is selected
  useEffect(() => {
    if (selectedPlan.name === "Copilot Enterprise") {
      setSelectedGithubPlan(githubPlanOptions[2]); // GitHub Enterprise Cloud
    }
  }, [selectedPlan]);
  
  // No longer automatically add/remove Enterprise Cloud based on GitHub Plan selection
  useEffect(() => {
    // If Copilot Enterprise is selected, we might want to show a notification or info
    // but we don't automatically add Enterprise Cloud to selected options anymore
  }, [selectedGithubPlan]);

  // Set months to 12 when showing yearly costs, otherwise 1
  useEffect(() => {
    if (showYearlyCost) {
      setMonths(12);
    } else {
      setMonths(1); // Default to 1 month when showing monthly costs
    }
  }, [showYearlyCost]);
  
  // No longer force yearly cost display when standalone is enabled
  useEffect(() => {
    // The user can now choose monthly or yearly regardless of standalone mode
  }, [isStandaloneEnabled]);

  // Find premium requests for the selected plan
  const findPremiumRequests = () => {
    // Find the "Premium requests" category
    const premiumCategory = featureCategories.find(category => 
      category.name === "Premium requests"
    );
    
    if (!premiumCategory) return "Not specified";
    
    // Find the "Premium requests" feature
    const premiumFeature = premiumCategory.features.find(feature => 
      feature.name === "Premium requests"
    );
    
    if (!premiumFeature) return "Not specified";
    
    // Get the plan index
    const planIndex = planDetails.findIndex(plan => plan.name === selectedPlan.name);
    if (planIndex === -1) return "Not specified";
    
    // Return the value for the selected plan
    return premiumFeature.values[planIndex];
  };

  // Get the premium requests value
  const premiumRequests = findPremiumRequests();
  
  // Parse price from string like "$19 USD" to number
  const parsePrice = (priceStr) => {
    if (!priceStr || typeof priceStr !== 'string') return 0;
    const match = priceStr.match(/\$(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  // Get base price of the selected plan based on its name (hardcoded prices)
  const getBasePrice = () => {
    const planName = selectedPlan.name;
    if (planName === "Copilot Enterprise") return 39;
    if (planName === "Copilot Business") return 19;
    if (planName === "Copilot Pro+") return 39;
    if (planName === "Copilot Pro") return 10;
    return parsePrice(selectedPlan.price);
  };
  
  // Get base price of the selected plan
  const basePrice = getBasePrice();
  
  // Calculate monthly cost per user with billing option applied
  const monthlyPerUser = basePrice;
  
  // Determine number of months for calculation
  const calculationMonths = selectedBilling.key === 'monthly' ? months : 12;
  
  // Calculate additional options cost per user
  const calculateAdditionalOptionsCost = (perUser = false) => {
    if (selectedOptions.length === 0) return 0;
    
    const totalOptionsCost = selectedOptions.reduce((total, optionKey) => {
      const option = additionalOptions.find(opt => opt.key === optionKey);
      if (!option) return total;
      
      // Special handling for Visual Studio subscriptions with existing licenses
      if (option.key === "visualStudio" && hasExistingVSLicenses) {
        return total + option.discountedPrice;
      }
      
      // Special handling for GHEC when there are existing VS licenses
      if (option.key === "enterpriseCloud" && 
          selectedOptions.includes("visualStudio") && 
          hasExistingVSLicenses) {
        
        const vsLicenseCount = optionLicenseCounts["visualStudio"] || developerCount;
        const ghLicenseCount = optionLicenseCounts[option.key] || developerCount;
        
        if (ghLicenseCount <= vsLicenseCount) {
          return total + option.discountedPrice;
        } else {
          // Only a portion of GHEC licenses get the discount
          const discountedCost = option.discountedPrice * (vsLicenseCount / ghLicenseCount);
          const fullCost = option.price * ((ghLicenseCount - vsLicenseCount) / ghLicenseCount);
          return total + discountedCost + fullCost;
        }
      }
      
      return total + option.price;
    }, 0);
    
    return perUser ? totalOptionsCost : totalOptionsCost * developerCount;
  };
  
  // Calculate total cost for each additional option
  const calculateTotalOptionCost = (optionKey) => {
    const option = additionalOptions.find(opt => opt.key === optionKey);
    if (!option) return 0;
    
    const licenseCount = optionLicenseCounts[optionKey] || developerCount;
    const calculationMonths = selectedBilling.key === 'monthly' ? months : 12;
    
    // Special handling for VS subscriptions with existing licenses
    if (optionKey === "visualStudio" && hasExistingVSLicenses) {
      return option.discountedPrice * licenseCount * calculationMonths;
    }
    
    // For GHEC when Visual Studio subscriptions are selected with existing licenses
    if (optionKey === "enterpriseCloud" && 
        selectedOptions.includes("visualStudio") && 
        hasExistingVSLicenses) {
      
      const vsLicenseCount = optionLicenseCounts["visualStudio"] || developerCount;
      
      // If GHEC license count is less than or equal to VS license count, all are discounted (all have VS licenses)
      if (licenseCount <= vsLicenseCount) {
        return option.discountedPrice * licenseCount * calculationMonths;
      } 
      // Otherwise, some licenses are full price and some are discounted
      else {
        const discountedCount = Math.min(licenseCount, vsLicenseCount);
        const fullPriceCount = licenseCount - discountedCount;
        
        return ((option.discountedPrice * discountedCount) + 
                (option.price * fullPriceCount)) * calculationMonths;
      }
    }
    
    return option.price * licenseCount * calculationMonths;
  };
  
  // Format number with commas for better readability
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };    // Calculate GitHub license cost (Enterprise Cloud licenses)
  const calculateGitHubLicenseCost = () => {
    // Only calculate if Enterprise Cloud is explicitly selected and has license count > 0
    if (!selectedOptions.includes('enterpriseCloud') || (optionLicenseCounts['enterpriseCloud'] || 0) <= 0) {
      return 0;
    }
    
    const option = additionalOptions.find(opt => opt.key === 'enterpriseCloud');
    if (!option) return 0;
    
    // Use the explicitly set license count
    const licenseCount = optionLicenseCounts['enterpriseCloud'];
    
    // Special handling for GHEC when there are existing VS licenses
    if (selectedOptions.includes("visualStudio") && hasExistingVSLicenses) {
      const vsLicenseCount = optionLicenseCounts["visualStudio"] || 0;
      
      // If no VS licenses are specified or VS license count is 0, charge full price
      if (vsLicenseCount <= 0) {
        return option.price * licenseCount * calculationMonths;
      }
      
      // Only charge for GHEC licenses that exceed VS licenses
      // VS licenses effectively cover an equal number of GHEC licenses at no additional cost
      const excessLicenses = Math.max(0, licenseCount - vsLicenseCount);
      
      // If VS covers all GHEC licenses, return 0
      if (excessLicenses === 0) {
        return 0;
      }
      
      // Only charge for excess GHEC licenses at full price
      return option.price * excessLicenses * calculationMonths;
    }
    
    return option.price * licenseCount * calculationMonths;
  };
  
  // Calculate the net GHEC licenses (total GHEC licenses minus VS licenses)
  const calculateNetGHECLicenses = () => {
    if (!selectedOptions.includes('enterpriseCloud') || (optionLicenseCounts['enterpriseCloud'] || 0) <= 0) {
      return 0;
    }
    
    const ghLicenseCount = optionLicenseCounts['enterpriseCloud'] || 0;
    
    // If VS subscriptions are selected, subtract VS licenses from GHEC
    if (selectedOptions.includes("visualStudio") && hasExistingVSLicenses) {
      const vsLicenseCount = optionLicenseCounts["visualStudio"] || 0;
      if (vsLicenseCount > 0) {
        // GHEC licenses minus VS licenses, but not less than 0
        return Math.max(0, ghLicenseCount - vsLicenseCount);
      }
    }
    
    // If no VS subscriptions or they don't have licenses, return full GHEC count
    return ghLicenseCount;
  };
  
  // Calculate Visual Studio subscription cost
  const calculateVSSubscriptionCost = () => {
    if (!selectedOptions.includes('visualStudio') || (optionLicenseCounts['visualStudio'] || 0) <= 0) {
      return 0;
    }
    
    const option = additionalOptions.find(opt => opt.key === 'visualStudio');
    if (!option) return 0;
    
    // Use the explicitly set license count
    const licenseCount = optionLicenseCounts['visualStudio'] || 0;
    
    // VS licenses are billed at the discounted price
    return option.discountedPrice * licenseCount * calculationMonths;
  };
  
  // Calculate GitHub Copilot cost
  const calculateCopilotCost = () => {
    return basePrice * developerCount * calculationMonths;
  };
  
  // Calculate total monthly cost per user (Copilot only)
  const totalMonthlyPerUser = monthlyPerUser;
  
  // Calculate total monthly cost for all developers (Copilot only)
  const totalMonthlyCost = totalMonthlyPerUser * developerCount;
  
  // Calculate total cost for Copilot over the selected period
  const copilotPeriodCost = totalMonthlyCost * calculationMonths;
  
  // Calculate total cost for all additional options
  const additionalOptionsCost = selectedOptions.reduce((total, optionKey) => {
    return total + calculateTotalOptionCost(optionKey);
  }, 0);
  
  // Calculate total cost over the selected period (Copilot + additional options)
  // For the total, we need to count VS subscription cost + GHEC licenses not covered by VS
  
  // Start with the Copilot cost only
  let adjustedAdditionalOptionsCost = 0;
  
  // Add VS subscription cost if selected
  if (selectedOptions.includes("visualStudio")) {
    const vsOption = additionalOptions.find(opt => opt.key === "visualStudio");
    const vsLicenseCount = optionLicenseCounts["visualStudio"] || 0;
    if (vsLicenseCount > 0) {
      adjustedAdditionalOptionsCost += vsOption.discountedPrice * vsLicenseCount * calculationMonths;
    }
  }
  
  // Add GHEC cost if selected - only charging for licenses not covered by VS
  if (selectedOptions.includes("enterpriseCloud")) {
    const ghOption = additionalOptions.find(opt => opt.key === "enterpriseCloud");
    const ghLicenseCount = optionLicenseCounts["enterpriseCloud"] || 0;
    
    if (ghLicenseCount > 0) {
      if (selectedOptions.includes("visualStudio") && hasExistingVSLicenses) {
        const vsLicenseCount = optionLicenseCounts["visualStudio"] || 0;
        
        if (vsLicenseCount > 0) {
          // Only charge for GHEC licenses that exceed VS licenses
          // If GHEC licenses <= VS licenses, then they're already covered
          // If GHEC licenses > VS licenses, only charge for the excess
          const excessLicenses = Math.max(0, ghLicenseCount - vsLicenseCount);
          
          // Add costs only for excess licenses at full price
          // If VS covers all GHEC licenses, the cost is 0
          if (excessLicenses === 0) {
            // VS covers all GHEC licenses, so no additional cost
            adjustedAdditionalOptionsCost += 0;
          } else {
            // Charge only for the excess licenses
            adjustedAdditionalOptionsCost += ghOption.price * excessLicenses * calculationMonths;
          }
        } else {
          // No VS licenses specified, charge full price
          adjustedAdditionalOptionsCost += ghOption.price * ghLicenseCount * calculationMonths;
        }
      } else {
        // No VS subscription selected, charge full price
        adjustedAdditionalOptionsCost += ghOption.price * ghLicenseCount * calculationMonths;
      }
    }
  }
  
  const totalPeriodCost = copilotPeriodCost + adjustedAdditionalOptionsCost;
  
  // Handle toggle of additional options
  const handleOptionToggle = (optionKey) => {
    if (optionKey === 'standalone') {
      // Toggle standalone mode
      const newStandaloneState = !isStandaloneEnabled;
      setIsStandaloneEnabled(newStandaloneState);
      
      // If enabling standalone, clear all other options but don't force yearly cost display
      if (newStandaloneState) {
        setSelectedOptions([]);
        // No longer forcing yearly cost display when enabling standalone
      } else {
        // When disabling standalone, no longer resetting to monthly cost display
      }
      return;
    }
    
    // If standalone is enabled, disable it when selecting other options
    if (isStandaloneEnabled) {
      setIsStandaloneEnabled(false);
      // No longer resetting to monthly when standalone is disabled
    }
    
    if (selectedOptions.includes(optionKey)) {
      setSelectedOptions(selectedOptions.filter(key => key !== optionKey));
      
      // Reset the license count when toggled off
      if (optionKey === 'enterpriseCloud' || optionKey === 'visualStudio') {
        setOptionLicenseCounts({
          ...optionLicenseCounts,
          [optionKey]: 0
        });
      }
    } else {
      setSelectedOptions([...selectedOptions, optionKey]);
      
      // Set license count to 0 when toggled on (requiring explicit entry)
      if (optionKey === 'enterpriseCloud' || optionKey === 'visualStudio') {
        setOptionLicenseCounts({
          ...optionLicenseCounts,
          [optionKey]: 0
        });
      }
    }
  };

  return (
    <div className="copilot-card">
      {/* Plan and GitHub Plan Selectors */}
      <div className="form-row" style={{
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div className="form-column" style={{ flex: 1 }}>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontWeight: '600',
            color: '#e6edf3'
          }}>
            GitHub Copilot:
            <Select 
              value={{ value: selectedPlan.name, label: selectedPlan.name }}
              onChange={(option) => setSelectedPlan(availablePlans.find(p => p.name === option.value))}
              options={filteredPlans.map(plan => ({ value: plan.name, label: plan.name }))}
              classNamePrefix="plan-select"
              className="copilot-plan-select"
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  padding: '0.35rem 0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #30363d',
                  background: '#161b22',
                  minHeight: '44px',
                  height: '44px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    borderColor: '#58a6ff',
                    boxShadow: '0 0 0 1px rgba(88, 166, 255, 0.5)'
                  }
                }),
                singleValue: (baseStyles) => ({
                  ...baseStyles,
                  color: '#e6edf3',
                  fontSize: '1rem',
                  fontWeight: '500',
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  background: '#1a1f24',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 10
                }),
                option: (baseStyles, { isFocused, isSelected }) => ({
                  ...baseStyles,
                  backgroundColor: isSelected ? '#1f6feb' : isFocused ? '#30363d' : undefined,
                  color: '#e6edf3',
                  padding: '0.75rem 1.2rem',
                  cursor: 'pointer',
                  '&:active': {
                    backgroundColor: '#1a5dca'
                  }
                }),
                input: (baseStyles) => ({
                  ...baseStyles,
                  color: '#e6edf3',
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
                dropdownIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: '#8b949e',
                  '&:hover': {
                    color: '#58a6ff'
                  }
                }),
              }}
            />
          </label>
        </div>

        <div className="form-column" style={{ flex: 1 }}>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontWeight: '600',
            color: '#e6edf3'
          }}>
            Current GitHub Plan:
            <Select 
              value={selectedGithubPlan}
              onChange={(option) => setSelectedGithubPlan(option)}
              options={githubPlanOptions}
              isDisabled={selectedPlan.name === "Copilot Enterprise"}
              styles={{
                control: (baseStyles, { isDisabled }) => ({
                  ...baseStyles,
                  padding: '0.35rem 0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #30363d',
                  background: isDisabled ? '#0d1117' : '#161b22',
                  minHeight: '44px',
                  height: '44px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  opacity: isDisabled ? 0.7 : 1,
                  '&:hover': {
                    borderColor: isDisabled ? '#30363d' : '#58a6ff',
                    boxShadow: isDisabled ? '0 1px 3px rgba(0, 0, 0, 0.12)' : '0 0 0 1px rgba(88, 166, 255, 0.5)'
                  }
                }),
                singleValue: (baseStyles) => ({
                  ...baseStyles,
                  color: '#e6edf3',
                  fontSize: '1rem',
                  fontWeight: '500',
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  background: '#1a1f24',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 10
                }),
                option: (baseStyles, { isFocused, isSelected }) => ({
                  ...baseStyles,
                  backgroundColor: isSelected ? '#1f6feb' : isFocused ? '#30363d' : undefined,
                  color: '#e6edf3',
                  padding: '0.75rem 1.2rem',
                  cursor: 'pointer',
                  '&:active': {
                    backgroundColor: '#1a5dca'
                  }
                }),
                input: (baseStyles) => ({
                  ...baseStyles,
                  color: '#e6edf3',
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
                dropdownIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: '#8b949e',
                  '&:hover': {
                    color: '#58a6ff'
                  }
                }),
              }}
            />
            {selectedPlan.name === "Copilot Enterprise" && (
              <div style={{ 
                fontSize: '0.8rem',
                color: '#8b949e',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                Copilot Enterprise requires GitHub Enterprise Cloud
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Developer Count Input */}
      <div className="request-input-section" style={{ marginBottom: '1.5rem' }}>
        <div className="form-row" style={{
          display: 'flex',
          gap: '1.5rem'
        }}>
          <div className="form-column" style={{ flex: 1 }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontWeight: '600',
              color: '#e6edf3'
            }}>
              Number of developers:
              <input
                type="number"
                value={developerCount === 0 ? "" : developerCount}
                min="1"
                placeholder="Enter number of developers"
                onChange={e => {
                  const val = e.target.value;
                  if (val === "") {
                    setDeveloperCount(0);
                  } else {
                    setDeveloperCount(Number(val));
                  }
                }}
                style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #30363d',
                  background: '#161b22',
                  color: '#e6edf3',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginTop: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  minHeight: '38px',
                  height: '38px',
                  width: '60px',
                  textAlign: 'center'
                }}
              />
            </label>
          </div>
        </div>
      </div>
      
      {/* Additional Options Card */}
      <div 
        className="options-card"
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '10px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      >
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#e6edf3',
          margin: '0 0 1rem 0'
        }}>Additional Options</h3>
        
        {/* Standalone Option */}
        <div 
          className="option-item"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem',
            borderRadius: '8px',
            background: isStandaloneEnabled ? '#1d3149' : '#1a1f24',
            border: `1px solid ${isStandaloneEnabled ? '#58a6ff' : '#30363d'}`,
            transition: 'all 0.2s ease',
            marginBottom: '1.2rem'
          }}
        >
          <div className="option-content" style={{ flex: 1, paddingRight: '1rem' }}>
            <div className="option-name" style={{ 
              fontWeight: '600', 
              color: '#e6edf3', 
              fontSize: '1rem',
              marginBottom: '0.3rem'
            }}>{standaloneOption.name}</div>
            <div className="option-description" style={{ 
              color: '#8b949e', 
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>{standaloneOption.description}</div>
          </div>
          <div className="option-toggle">
            <label className="toggle-label" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
              <input
                type="checkbox"
                checked={isStandaloneEnabled}
                onChange={() => handleOptionToggle('standalone')}
                className="toggle-switch"
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="toggle-slider" style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isStandaloneEnabled ? '#2ea043' : '#30363d',
                borderRadius: '34px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '20px',
                  width: '20px',
                  left: isStandaloneEnabled ? '24px' : '2px',
                  bottom: '2px',
                  backgroundColor: '#e6edf3',
                  borderRadius: '50%',
                  transition: '0.3s'
                }}></span>
              </span>
            </label>
          </div>
        </div>
        
        <div className="options-list" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.2rem',
          opacity: isStandaloneEnabled ? '0.5' : '1',
          pointerEvents: isStandaloneEnabled ? 'none' : 'auto'
        }}>
          {additionalOptions.map(option => {
            // Always show all options, including Enterprise Cloud
            return (
              <div 
                key={option.key} 
                className="option-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  background: selectedOptions.includes(option.key) ? '#1d3149' : '#1a1f24',
                  border: `1px solid ${selectedOptions.includes(option.key) ? '#58a6ff' : '#30363d'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="option-content" style={{ flex: 1, paddingRight: '1rem' }}>
                  <div className="option-name" style={{ 
                    fontWeight: '600', 
                    color: '#e6edf3', 
                    fontSize: '1rem',
                    marginBottom: '0.3rem'
                  }}>{option.name}</div>
                  <div className="option-description" style={{ 
                    color: '#8b949e', 
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                  }}>{option.description}</div>
                  
                  {option.key !== 'visualStudio' && (
                    <div className="option-price" style={{ 
                      color: '#58a6ff', 
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      ${formatNumber(option.price)} per user/month
                    </div>
                  )}
                  
                  {option.key === 'visualStudio' && (
                    <div className="option-price" style={{ 
                      color: '#58a6ff', 
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      $0.01 per user/month
                    </div>
                  )}
                  
                  {option.key === 'visualStudio' && selectedOptions.includes(option.key) && (
                    <div style={{ marginTop: '1rem' }}>
                      {selectedOptions.includes('enterpriseCloud') && (
                        <div style={{ 
                          color: '#8b949e', 
                          fontSize: '0.9rem',
                          background: 'rgba(56, 139, 253, 0.1)',
                          borderRadius: '6px',
                          padding: '0.6rem',
                          marginBottom: '0.7rem'
                        }}>
                          <span style={{ color: '#58a6ff', fontWeight: '600' }}>Note:</span> GitHub Enterprise Cloud licenses 
                          are discounted to $0.01 per user/month for users that have VS subscriptions.
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>
                          Number of licenses:
                        </span>
                        <input
                          type="number"
                          value={optionLicenseCounts[option.key] === 0 ? "" : optionLicenseCounts[option.key]}
                          min="1"
                          placeholder="#"
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                            setOptionLicenseCounts({
                              ...optionLicenseCounts,
                              [option.key]: val
                            });
                          }}
                          style={{
                            padding: '0.3rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #30363d',
                            background: '#161b22',
                            color: '#e6edf3',
                            width: '80px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                      {optionLicenseCounts[option.key] === 0 && (
                        <div style={{ 
                          color: '#f85149', 
                          fontSize: '0.9rem',
                          marginTop: '0.5rem'
                        }}>
                          Please enter the total number of Visual Studio licenses
                        </div>
                      )}
                    </div>
                  )}
                  
                  {option.key === 'enterpriseCloud' && selectedOptions.includes(option.key) && (
                    <div style={{ marginTop: '1rem' }}>
                      {selectedOptions.includes('visualStudio') && (
                        <div style={{ 
                          color: '#8b949e', 
                          fontSize: '0.9rem',
                          background: 'rgba(87, 171, 90, 0.1)',
                          borderRadius: '6px',
                          padding: '0.6rem',
                          marginBottom: '0.7rem'
                        }}>
                          <span style={{ color: '#7ee787', fontWeight: '600' }}>Discount Available:</span> You'll only pay $0.01 for GHEC licenses covered by VS subscriptions (up to {optionLicenseCounts['visualStudio']} licenses).
                        </div>
                      )}
                      
                      {selectedGithubPlan.value === 'enterprise' && (
                        <div style={{ 
                          color: '#8b949e', 
                          fontSize: '0.9rem',
                          background: 'rgba(56, 139, 253, 0.1)',
                          borderRadius: '6px',
                          padding: '0.6rem',
                          marginBottom: '0.7rem'
                        }}>
                          <span style={{ color: '#58a6ff', fontWeight: '600' }}>Note:</span> You've selected GitHub Enterprise Cloud as your current plan. You may already have GHEC licenses.
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>
                          Number of licenses:
                        </span>
                        <input
                          type="number"
                          value={optionLicenseCounts[option.key] === 0 ? "" : optionLicenseCounts[option.key]}
                          min="1"
                          placeholder="#"
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                            setOptionLicenseCounts({
                              ...optionLicenseCounts,
                              [option.key]: val
                            });
                          }}
                          style={{
                            padding: '0.3rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #30363d',
                            background: '#161b22',
                            color: '#e6edf3',
                            width: '80px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                      {optionLicenseCounts[option.key] === 0 && (
                        <div style={{ 
                          color: '#f85149', 
                          fontSize: '0.9rem',
                          marginTop: '0.5rem'
                        }}>
                          Please enter the number of GitHub Enterprise Cloud licenses needed
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="option-toggle">
                  <label className="toggle-label" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.key)}
                      onChange={() => handleOptionToggle(option.key)}
                      className="toggle-switch"
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className="toggle-slider" style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: selectedOptions.includes(option.key) ? '#2ea043' : '#30363d',
                      borderRadius: '34px',
                      transition: '0.3s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '20px',
                        width: '20px',
                        left: selectedOptions.includes(option.key) ? '24px' : '2px',
                        bottom: '2px',
                        backgroundColor: '#e6edf3',
                        borderRadius: '50%',
                        transition: '0.3s'
                      }}></span>
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Details Row */}
      <div className="details-row" style={{
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div className="plan-details" style={{
          flex: 1,
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '10px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <h3 className="plan-details-title" style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#e6edf3',
            margin: '0 0 1rem 0'
          }}>Plan Details</h3>
          <div className="plan-details-content">
            <div className="plan-detail-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              borderBottom: '1px solid #30363d'
            }}>
              <span className="plan-detail-label" style={{ color: '#8b949e' }}>
                Monthly Cost:
              </span>
              <span className="plan-detail-value" style={{ color: '#e6edf3', fontWeight: '600' }}>
                ${formatNumber(basePrice)} per user
              </span>
            </div>
            <div className="plan-detail-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.5rem 0'
            }}>
              <span className="plan-detail-label" style={{ color: '#8b949e' }}>Premium Requests:</span>
              <span className="plan-detail-value" style={{ color: '#e6edf3', fontWeight: '600' }}>
                {premiumRequests}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cost Breakdown Section */}
      <h2 className="multiplier-title" style={{
        fontSize: '1.6rem',
        fontWeight: '700',
        margin: '2rem 0 1rem 0',
        letterSpacing: '-0.5px',
        color: '#e6edf3',
        textAlign: 'left'
      }}>Cost Breakdown</h2>
      
      {/* Monthly/Yearly toggle */}
      <div className="toggle-container" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'inline-flex',
          background: '#1a1f24',
          border: '1px solid #30363d',
          borderRadius: '6px',
          height: '32px',
          overflow: 'hidden',
          boxShadow: 'none',
        }}>
          <button 
            onClick={() => setShowYearlyCost(false)}
            style={{
              padding: '0 1rem',
              background: !showYearlyCost ? '#1f6feb' : 'transparent',
              color: !showYearlyCost ? '#ffffff' : '#8b949e',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Monthly
          </button>
          <button 
            onClick={() => setShowYearlyCost(true)}
            style={{
              padding: '0 1rem',
              background: showYearlyCost ? '#1f6feb' : 'transparent',
              color: showYearlyCost ? '#ffffff' : '#8b949e',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Yearly
          </button>
        </div>
      </div>
      
      <div className="multiplier-info" style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '10px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="multiplier-explanation" style={{width: '100%'}}>
          <div className="formula-display" style={{width: '100%'}}>
            {/* GitHub Copilot Cost */}
            <div className="formula-breakdown-container" style={{ 
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #30363d'
            }}>
              <h5 style={{ color: '#58a6ff', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600', textAlign: 'left' }}>
                {selectedPlan.name}
              </h5>
              <div className="formula formula-aligned" style={{ 
                fontSize: '0.9rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                margin: '0.5rem 0'
              }}>
                <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>${formatNumber(basePrice)}</span>
                <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{developerCount}</span>
                <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{calculationMonths}</span>
                <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>=</span>
                <span className="formula-result" style={{flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#e6edf3'}}>${formatNumber(basePrice * developerCount * calculationMonths)}</span>
              </div>
              <div className="formula-labels formula-aligned" style={{ 
                fontSize: '0.8rem', 
                color: '#8b949e',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Price/user</span>
                <span className="formula-label blank" style={{flex: 0.3}}></span>
                <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Developers</span>
                <span className="formula-label blank" style={{flex: 0.3}}></span>
                <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Months</span>
                <span className="formula-label blank" style={{flex: 0.3}}></span>
                <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Total</span>
              </div>
            </div>
            
            {/* Additional Options Cost */}
            {selectedOptions.map((optionKey, index) => {
              const option = additionalOptions.find(opt => opt.key === optionKey);
              if (!option) return null;
              
              const isLast = index === selectedOptions.length - 1;
              const optionPrice = option.key === "visualStudio" && hasExistingVSLicenses 
                ? option.discountedPrice
                : option.price;
              
              const licenseCount = optionLicenseCounts[optionKey] || developerCount;
              const optionCost = optionPrice * licenseCount * calculationMonths;
              
              return (
                <div key={option.key} className="formula-breakdown-container" style={{ 
                  marginBottom: isLast ? '1rem' : '1.5rem',
                  paddingBottom: isLast ? '0' : '1rem',
                  borderBottom: isLast ? 'none' : '1px solid #30363d'
                }}>
                  <h5 style={{ color: '#7ee787', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600', textAlign: 'left' }}>
                    {option.name}
                  </h5>
                  
                  {/* For GitHub Enterprise Cloud with VS subscriptions */}
                  {option.key === "enterpriseCloud" && 
                   selectedOptions.includes("visualStudio") && 
                   hasExistingVSLicenses && 
                   optionLicenseCounts["visualStudio"] > 0 ? (
                    <>
                      {optionLicenseCounts[option.key] > 0 ? (
                        <>
                          {optionLicenseCounts[option.key] > optionLicenseCounts["visualStudio"] ? (
                            <div className="formula formula-aligned" style={{ 
                              fontSize: '0.9rem',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              width: '100%',
                              margin: '0.5rem 0'
                            }}>
                              <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>${formatNumber(option.price)}</span>
                              <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                              <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{calculateNetGHECLicenses()}</span>
                              <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                              <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{calculationMonths}</span>
                              <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>=</span>
                              <span className="formula-result" style={{flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#e6edf3'}}>${formatNumber((option.price * calculateNetGHECLicenses()) * calculationMonths)}</span>
                            </div>
                          ) : (
                            <div className="formula formula-aligned" style={{ 
                              fontSize: '0.9rem',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              width: '100%',
                              margin: '0.5rem 0'
                            }}>
                              <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>${formatNumber(option.price)}</span>
                              <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                              <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>0</span>
                              <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                              <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{calculationMonths}</span>
                              <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>=</span>
                              <span className="formula-result" style={{flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#e6edf3'}}>$0.00</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="formula formula-aligned" style={{ 
                          fontSize: '0.9rem',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          width: '100%',
                          margin: '0.5rem 0'
                        }}>
                          <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>${formatNumber(option.price)}</span>
                          <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                          <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>0</span>
                          <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                          <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{calculationMonths}</span>
                          <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>=</span>
                          <span className="formula-result" style={{flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#e6edf3'}}>$0.00</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="formula formula-aligned" style={{ 
                      fontSize: '0.9rem',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      width: '100%',
                      margin: '0.5rem 0'
                    }}>
                      <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>${formatNumber(optionPrice)}</span>
                      <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                      <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{licenseCount || 0}</span>
                      <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>×</span>
                      <span className="formula-part" style={{flex: 1, textAlign: 'center'}}>{calculationMonths}</span>
                      <span className="formula-operator" style={{flex: 0.3, textAlign: 'center'}}>=</span>
                      <span className="formula-result" style={{flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#e6edf3'}}>${formatNumber(licenseCount ? optionCost : 0)}</span>
                    </div>
                  )}
                  
                  <div className="formula-labels formula-aligned" style={{ 
                    fontSize: '0.8rem', 
                    color: '#8b949e',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Price/user</span>
                    <span className="formula-label blank" style={{flex: 0.3}}></span>
                    <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Licenses</span>
                    <span className="formula-label blank" style={{flex: 0.3}}></span>
                    <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Months</span>
                    <span className="formula-label blank" style={{flex: 0.3}}></span>
                    <span className="formula-label" style={{flex: 1, textAlign: 'center'}}>Total</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total Cost Section */}
          <div className="total-premium-section" style={{marginTop: '1.5rem'}}>
            <div className="total-premium-card" style={{
              background: '#1a1f24',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '1rem 1.5rem'
            }}>
              <div className="total-premium-row" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'
              }}>
                <span className="total-premium-label" style={{
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  color: '#e6edf3'
                }}>Total {showYearlyCost ? 'Annual' : 'Monthly'} Cost:</span>
                <span className="total-premium-spacer" style={{flex: 1}}></span>
                <span className="total-premium-value" style={{
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  color: '#58a6ff'
                }}>
                  ${showYearlyCost ? formatNumber(totalPeriodCost) : formatNumber(totalPeriodCost / months)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <h2 className="results-title" style={{
        fontSize: '1.6rem',
        fontWeight: '700',
        margin: '2rem 0 1rem 0',
        letterSpacing: '-0.5px',
        color: '#e6edf3',
        textAlign: 'left'
      }}>Total Licensing Costs</h2>
      <div className="results-section" style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '10px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        {/* GitHub License Cost Section */}
        {selectedOptions.includes('enterpriseCloud') && (
          <div className="github-license-section" style={{marginBottom: '1.5rem'}}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#e6edf3',
              margin: '0 0 1rem 0'
            }}>GitHub License Cost</h3>
            
            {/* GHEC License line item */}
            {optionLicenseCounts['enterpriseCloud'] > 0 && (
              <div className="result-row" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0',
                borderBottom: '1px solid #30363d'
              }}>
                {selectedOptions.includes("visualStudio") && hasExistingVSLicenses && optionLicenseCounts["visualStudio"] > 0 ? (
                  <span style={{ color: '#8b949e' }}>
                    GitHub Enterprise Cloud ({calculateNetGHECLicenses() <= 0 ? 0 : calculateNetGHECLicenses()} license{calculateNetGHECLicenses() !== 1 ? 's' : ''}):
                  </span>
                ) : (
                  <span style={{ color: '#8b949e' }}>
                    GitHub Enterprise Cloud ({optionLicenseCounts['enterpriseCloud']} license{optionLicenseCounts['enterpriseCloud'] !== 1 ? 's' : ''}):
                  </span>
                )}
                <b style={{ color: '#e6edf3' }}>
                  ${showYearlyCost 
                    ? formatNumber(calculateGitHubLicenseCost()) 
                    : formatNumber(calculateGitHubLicenseCost() / calculationMonths)}{showYearlyCost ? '/year' : '/month'}
                </b>
              </div>
            )}
            
            {/* Visual Studio Bundle line item */}
            {selectedOptions.includes("visualStudio") && 
             selectedOptions.includes("enterpriseCloud") && 
             hasExistingVSLicenses && 
             optionLicenseCounts["visualStudio"] > 0 && (
              <div className="result-row" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0',
                borderBottom: '1px solid #30363d'
              }}>
                <span style={{ color: '#8b949e' }}>GitHub Enterprise Cloud - Visual Studio Bundle ({optionLicenseCounts['visualStudio']} license{optionLicenseCounts['visualStudio'] !== 1 ? 's' : ''}):</span>
                <b style={{ color: '#e6edf3' }}>
                  ${showYearlyCost 
                     ? formatNumber(calculateVSSubscriptionCost()) 
                     : formatNumber(calculateVSSubscriptionCost() / calculationMonths)}{showYearlyCost ? '/year' : '/month'}
                </b>
              </div>
            )}
          </div>
        )}
        
        {/* GitHub Copilot Cost Section */}
        <div className="github-copilot-section" style={{marginBottom: '1.5rem'}}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#e6edf3',
            margin: '0 0 1rem 0'
          }}>GitHub Copilot Cost</h3>
          
          <div className="result-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.6rem 0',
            borderBottom: '1px solid #30363d'
          }}>
            <span style={{ color: '#8b949e' }}>{selectedPlan.name} ({developerCount} user{developerCount !== 1 ? 's' : ''}):</span>
            <b style={{ color: '#e6edf3' }}>
              ${showYearlyCost 
                 ? formatNumber(calculateCopilotCost()) 
                 : formatNumber(basePrice * developerCount)}{showYearlyCost ? '/year' : '/month'}
            </b>
          </div>
        </div>
        
        {/* Total Cost Section */}
        <div className="result-row" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.8rem 0',
          fontSize: '1.1rem',
          borderTop: '1px solid #30363d'
        }}>
          <span style={{ color: '#e6edf3' }}>
            Total {showYearlyCost ? 'Annual' : 'Monthly'} Cost:
          </span>
          <b style={{ color: '#58a6ff', fontSize: '1.2rem' }}>
            ${showYearlyCost ? formatNumber(totalPeriodCost) : formatNumber(totalPeriodCost / months)}
          </b>
        </div>
        
        <div style={{
          color: '#8b949e',
          fontSize: '0.9rem',
          marginTop: '1rem',
          fontStyle: 'italic',
          padding: '0.8rem',
          background: 'rgba(56, 139, 253, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(56, 139, 253, 0.2)'
        }}>
          <span style={{ color: '#58a6ff', fontWeight: '600' }}>Note:</span> This estimate doesn't include taxes, which vary by location. Your GitHub account representative can provide a detailed quote with all applicable taxes included.
        </div>
      </div>
      
      <div className="button-container" style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '1.5rem',
        justifyContent: 'center'
      }}>
        <a
          className="copilot-pricing-btn"
          href={selectedPlan.githubUrl || "https://github.com/features/copilot/plans"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.8rem 1.6rem',
            backgroundColor: '#1f6feb',
            color: '#ffffff',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontSize: '1rem',
            minWidth: '180px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12)'
          }}
        >
          Get {selectedPlan.name}
        </a>
        <a
          className="copilot-feature-btn"
          href="https://docs.github.com/en/enterprise-cloud@latest/copilot/about-github-copilot/plans-for-github-copilot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.8rem 1.6rem',
            backgroundColor: 'transparent',
            color: '#58a6ff',
            fontWeight: '600',
            borderRadius: '8px',
            border: '1px solid #30363d',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontSize: '1rem',
            minWidth: '180px',
            textAlign: 'center'
          }}
        >
          Feature Comparison
        </a>
      </div>
    </div>
  );
}
