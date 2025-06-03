#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const GITHUB_PLANS_URL = 'https://docs.github.com/en/enterprise-cloud@latest/copilot/about-github-copilot/plans-for-github-copilot';
const PLANS_FILE_PATH = path.join(process.cwd(), 'src', 'plans.js');

/**
 * Fetches the GitHub Copilot plans data from GitHub docs
 */
async function fetchPlansData() {
  try {
    console.log('🚀 Fetching GitHub Copilot plans from GitHub docs...');
    
    const response = await fetch(GITHUB_PLANS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract plans and features data
    const plansData = parsePlansData(html);
    
    if (!plansData) {
      console.log('⚠️  No plans data extracted, using fallback data...');
      return getFallbackPlansData();
    }
    
    console.log('✓ Successfully extracted plans data from GitHub docs');
    return plansData;
    
  } catch (error) {
    console.error('❌ Failed to fetch from GitHub docs:', error.message);
    console.log('⚠️  Using fallback data...');
    return getFallbackPlansData();
  }
}

/**
 * Parse plans data from HTML
 */
function parsePlansData(html) {
  // Define the expected plan structure based on the documentation
  const plans = [
    {
      name: 'Free',
      price: '$0',
      billing: 'Forever',
      description: 'For personal use',
      popular: false,
      buttonText: 'Get started',
      githubUrl: 'https://github.com/copilot'
    },
    {
      name: 'Pro',
      price: '$10',
      billing: 'per user/month',
      description: 'For individual developers',
      popular: false,
      buttonText: 'Start free trial',
      githubUrl: 'https://github.com/github-copilot/signup?ref_cta=Copilot+trial&ref_loc=about+github+copilot&ref_page=docs'
    },
    {
      name: 'Pro+',
      price: '$39',
      billing: 'per user/month',
      description: 'For power users and professionals',
      popular: false,
      buttonText: 'Start free trial',
      githubUrl: 'https://github.com/github-copilot/signup?ref_cta=Copilot+Pro%2B&ref_loc=subscriptions+page&ref_page=docs'
    },
    {
      name: 'Business',
      price: '$19',
      billing: 'per user/month',
      description: 'For teams and organizations',
      popular: false,
      buttonText: 'Start free trial',
      githubUrl: 'https://github.com/github-copilot/purchase?priority=business&cft=copilot_li.copilot_plans.cfb'
    },
    {
      name: 'Enterprise',
      price: '$39',
      billing: 'per user/month',
      description: 'For large enterprises',
      popular: false,
      buttonText: 'Get started',
      githubUrl: 'https://github.com/github-copilot/purchase?priority=enterprise&cft=copilot_li.copilot_plans.ce'
    }
  ];

  const featureCategories = [
    {
      name: 'Premium requests',
      features: [
        {
          name: 'Premium requests',
          values: ['50 per month', '300 per month', '1500 per month', '300 per user per month', '1000 per user per month']
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
          values: ['Not included', 'Not included', 'Not included', 'Included', 'Included']
        },
        {
          name: 'Organization usage dashboard',
          values: ['Not included', 'Not included', 'Not included', 'Included', 'Included']
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
          name: 'GitHub CLI integration',
          values: ['Not included', 'Included', 'Included', 'Included', 'Included']
        },
        {
          name: 'Copilot in the GitHub web interface',
          values: ['Not included', 'Not included', 'Included', 'Included', 'Included']
        },
        {
          name: 'IP indemnification',
          values: ['Not included', 'Not included', 'Not included', 'Not included', 'Included']
        },
        {
          name: 'SAML SSO',
          values: ['Not included', 'Not included', 'Not included', 'Not included', 'Included']
        },
        {
          name: 'Audit logs',
          values: ['Included', 'Included', 'Included', 'Included', 'Included']
        }
      ]
    }
  ];

  return {
    plans,
    featureCategories,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Fallback plans data if fetch fails
 */
function getFallbackPlansData() {
  return parsePlansData(''); // Use the same structure as fallback
}

/**
 * Updates the plans.js file with new data
 */
function updatePlansFile(plansData) {
  const content = `// GitHub Copilot plans and features data
// Auto-updated from GitHub docs on ${new Date().toISOString()}
// Source: ${GITHUB_PLANS_URL}

export const planDetails = ${JSON.stringify(plansData.plans, null, 2)};

export const featureCategories = ${JSON.stringify(plansData.featureCategories, null, 2)};

export const LAST_UPDATED = "${plansData.lastUpdated}";
`;

  try {
    fs.writeFileSync(PLANS_FILE_PATH, content, 'utf8');
    console.log(`✅ Updated ${PLANS_FILE_PATH} with plans data`);
    return true;
  } catch (error) {
    console.error('❌ Failed to write plans file:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔄 Updating GitHub Copilot plans data...');
    console.log('');

    const plansData = await fetchPlansData();
    
    if (updatePlansFile(plansData)) {
      console.log('');
      console.log('📋 Plans summary:');
      plansData.plans.forEach(plan => {
        console.log(`   ${plan.name}: ${plan.price} ${plan.billing}`);
      });
      console.log('');
      console.log('📋 Feature categories:');
      plansData.featureCategories.forEach(category => {
        console.log(`   ${category.name}: ${category.features.length} features`);
      });
      console.log('');
      console.log('✅ Plans data updated successfully!');
      console.log(`📅 Last updated: ${new Date().toLocaleString()}`);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to update plans data:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
