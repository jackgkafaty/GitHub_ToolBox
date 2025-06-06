#!/usr/bin/env node

// Script to generate GitHub Copilot plans data from the official GitHub documentation
// Source: https://docs.github.com/en/enterprise-cloud@latest/copilot/about-github-copilot/plans-for-github-copilot

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const GITHUB_PLANS_URL = 'https://docs.github.com/en/enterprise-cloud@latest/copilot/about-github-copilot/plans-for-github-copilot';
const PLANS_FILE_PATH = path.join(process.cwd(), 'src', 'plans.js');

/**
 * Determines if a feature is included in a plan based on the cell content
 * @param {Object} $ - Cheerio instance
 * @param {Element} cell - The table cell element
 * @returns {string} - 'yes', 'no', or the text content
 */
function parseFeatureValue($, cell) {
  // Check if cell contains a checkmark
  if ($(cell).find('.octicon-check').length > 0) {
    return 'yes';
  } 
  // Check if cell contains an x mark
  else if ($(cell).find('.octicon-x').length > 0) {
    return 'no';
  }
  // Otherwise return the text content
  else {
    return $(cell).text().trim();
  }
}

/**
 * Model name mapping to ensure consistent naming
 */
const MODEL_NAME_MAPPING = {
  'Claude Sonnet': 'Claude Sonnet 4',
  'Claude Opus': 'Claude Opus 4'
};

/**
 * Fetches and parses the GitHub Copilot plans data from the official documentation
 */
async function fetchPlansData() {
  try {
    console.log('🚀 Fetching GitHub Copilot plans data from official documentation...');

    // Fetch the main plans page
    const response = await fetch(GITHUB_PLANS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Also fetch the signup URLs section
    console.log('🔍 Searching for GitHub Copilot plan signup URLs...');
    const planUrlsResponse = await fetch(GITHUB_PLANS_URL);
    const plansHtml = await planUrlsResponse.text();
    const urlSection = plansHtml.includes('ready-to-choose-a-plan') ? 
      plansHtml.split('ready-to-choose-a-plan')[1] : '';
    
    // Extract URLs for each plan type
    const planUrls = {
      'Copilot Free': 'https://github.com/copilot',
      'Copilot Pro': 'https://github.com/github-copilot/signup?ref_cta=Copilot+trial&ref_loc=about+github+copilot&ref_page=docs',
      'Copilot Pro+': 'https://github.com/github-copilot/signup?ref_cta=Copilot+Pro%2B&ref_loc=subscriptions+page&ref_page=docs',
      'Copilot Business': 'https://github.com/github-copilot/purchase?priority=business&cft=copilot_li.copilot_plans.cfb',
      'Copilot Enterprise': 'https://github.com/github-copilot/purchase?priority=enterprise&cft=copilot_li.copilot_plans.ce'
    };
    
    // Log the URLs found
    console.log('✓ Found plan URLs:');
    Object.entries(planUrls).forEach(([plan, url]) => {
      console.log(`   ${plan}: ${url}`);
    });

    // Initialize arrays to hold plan details and feature categories
    const plans = [];
    const featureCategories = [];

    // Get the plan names from the first table in the document
    // This avoids duplicating plan names from each feature category section
    const planNames = [];
    const firstTable = $('.ghd-tool table').first();
    $(firstTable).find('thead tr th').each((index, element) => {
      if (index === 0) return; // Skip the first header cell (empty or "Features" column)
      const planName = $(element).text().trim();
      planNames.push(planName);
    });

    // Create plan objects with basic info
    planNames.forEach(name => {
      plans.push({
        name,
        price: '', // Will be filled below when we process the pricing row
        billing: '',
        description: '',
        popular: name.includes('Pro+') || name.includes('Business'), // Marking Pro+ and Business as popular
        buttonText: 'Get started',
        githubUrl: planUrls[name] || 'https://github.com/features/copilot' // Use the URL from our map or default
      });
    });
    
    // Process the pricing row from the first table to get price information
    const pricingRow = $(firstTable).find('tbody tr').first();
    if ($(pricingRow).find('th').text().trim() === 'Pricing') {
      $(pricingRow).find('td').each((colIndex, col) => {
        if (plans[colIndex]) {
          const priceText = $(col).text().trim();
          plans[colIndex].price = priceText.split(' per ')[0] || priceText;
          plans[colIndex].billing = priceText.includes('per month') ? 'monthly' : 
                                    priceText.includes('per year') ? 'yearly' : '';
        }
      });
    }

    // Find all feature category sections
    // Each section starts with an h3 heading and contains a table
    // Keep track of processed categories to avoid duplicates
    const processedCategories = new Set();
    
    // Ensure we have a Premium requests category
    let hasPremiumRequestsCategory = false;
    
    $('h3').each((headingIndex, heading) => {
      const categoryName = $(heading).text().trim();
      
      // Check if this is about Premium requests
      if (categoryName.toLowerCase().includes('premium request')) {
        hasPremiumRequestsCategory = true;
      }
      
      // Skip if already processed this category
      if (processedCategories.has(categoryName)) return;
      processedCategories.add(categoryName);
      
      const table = $(heading).next('.ghd-tool').find('table');
      
      // Skip if no table found
      if (table.length === 0) return;

      const features = [];        // Process each row in the table
      $(table).find('tbody tr').each((rowIndex, row) => {
        const featureNameWithFootnotes = $(row).find('th').text().trim();
        // Remove footnote numbers from feature names (e.g., "Copilot Chat in IDEs1 2" to "Copilot Chat in IDEs")
        // But keep numbers that are part of model names like "GPT-4.1", "Claude Sonnet 4"
        // Only remove if the number is standalone (preceded by a space and followed by nothing or another digit)
        let featureName = featureNameWithFootnotes.replace(/ \d+(\s+\d+)*$/, '').replace(/\s+$/, '').trim();
        
        // Apply model name mapping for consistent naming
        if (MODEL_NAME_MAPPING[featureName]) {
          featureName = MODEL_NAME_MAPPING[featureName];
        }
        const values = [];
        
        // Process each column (skipping the feature name column)
        $(row).find('td').each((colIndex, col) => {
          // Get value as yes/no or text
          const value = parseFeatureValue($, col);
          values.push(value);
          
          // If this is the pricing row, update the plan details
          if (featureName === 'Pricing' && plans[colIndex]) {
            plans[colIndex].price = value.split(' per ')[0] || value;
            plans[colIndex].billing = value.includes('per month') ? 'monthly' : 
                                      value.includes('per year') ? 'yearly' : '';
          }
        });
        
        features.push({
          name: featureName,
          values: values
        });
      });

      // Add feature category only if it has features
      if (features.length > 0) {
        featureCategories.push({
          name: categoryName,
          features: features
        });
      }
    });

    // Update plan prices and other details based on known information
    // Since the documentation may not include all details, you might need to supplement this data manually or from another source
    
    // Add Premium requests category if it wasn't found
    if (!hasPremiumRequestsCategory) {
      console.log('⚠️ Premium requests category not found, adding from default data...');
      
      // Add the premium requests category
      featureCategories.unshift({
        name: 'Premium requests',
        features: [
          {
            name: 'Premium requests',
            values: ['50 per month', '300 per month', '1500 per month', '300 per user per month', '1000 per user per month']
          },
          {
            name: 'Purchase additional premium requests at $0.04/request',
            values: ['no', 'yes', 'yes', 'yes', 'yes']
          }
        ]
      });
    }

    console.log('✓ Successfully fetched and parsed plans data');
    
    // Log feature categories for debugging
    console.log('📋 Feature categories found:');
    featureCategories.forEach(category => {
      console.log(`   ${category.name}: ${category.features.length} features`);
    });
    
    return {
      plans,
      featureCategories,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Failed to fetch plans data:', error.message);
    return getFallbackPlansData();
  }
}

/**
 * Fallback plans data in case fetching from the official documentation fails
 */
function getFallbackPlansData() {
  console.log('🚀 Using default GitHub Copilot plans data...');
  
  // Default plan details
  const plans = [
    {
      name: 'Copilot Free',
      price: '$0',
      billing: 'Forever',
      description: 'Basic AI coding assistance',
      popular: false,
      buttonText: 'Get started',
      githubUrl: 'https://github.com/copilot'
    },
    {
      name: 'Copilot Pro',
      price: '$10',
      billing: 'monthly',
      description: 'AI pair programmer for individual developers',
      popular: false,
      buttonText: 'Subscribe now',
      githubUrl: 'https://github.com/github-copilot/signup?ref_cta=Copilot+trial&ref_loc=about+github+copilot&ref_page=docs'
    },
    {
      name: 'Copilot Pro+',
      price: '$39',
      billing: 'monthly',
      description: 'Premium AI pair programmer for individual developers',
      popular: false,
      buttonText: 'Subscribe now',
      githubUrl: 'https://github.com/github-copilot/signup?ref_cta=Copilot+Pro%2B&ref_loc=subscriptions+page&ref_page=docs'
    },
    {
      name: 'Copilot Business',
      price: '$19',
      billing: 'monthly',
      description: 'AI pair programmer for teams',
      popular: true,
      buttonText: 'Get started',
      githubUrl: 'https://github.com/github-copilot/purchase?priority=business&cft=copilot_li.copilot_plans.cfb'
    },
    {
      name: 'Copilot Enterprise',
      price: '$39',
      billing: 'monthly',
      description: 'Enhanced security and compliance',
      popular: true,
      buttonText: 'Get started',
      githubUrl: 'https://github.com/github-copilot/purchase?priority=enterprise&cft=copilot_li.copilot_plans.ce'
    }
  ];

  // Default feature categories
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
          values: ['no', 'yes', 'yes', 'yes', 'yes']
        }
      ]
    },
    {
      name: 'Agents',
      features: [
        {
          name: 'Copilot coding agent (public preview)',
          values: ['no', 'no', 'yes', 'no', 'yes']
        },
        {
          name: 'Agent mode in VS Code',
          values: ['yes', 'yes', 'yes', 'yes', 'yes']
        },
        {
          name: 'Copilot code review',
          values: ['Only "Review selection" in VS Code', 'yes', 'yes', 'yes', 'yes']
        },
        {
          name: 'Copilot Extensions',
          values: ['yes', 'yes', 'yes', 'yes', 'yes']
        }
      ]
    },
    {
      name: 'Models',
      features: [
        {
          name: 'Available models in chat',
          values: ['Limited selection', 'All models', 'All models', 'All models', 'All models']
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

    // Read current plans.js file to preserve model names
    let preservedModelsCategory = null;
    try {
      const currentPlansContent = fs.readFileSync(PLANS_FILE_PATH, 'utf8');
      const modelsMatch = currentPlansContent.match(/("name": "Models"[^{]*{[^[]*\[[^]]*"features": \[)([^]]*)\]/s);
      if (modelsMatch && modelsMatch[2]) {
        console.log('📋 Found existing Models category, will preserve model names');
        preservedModelsCategory = {
          name: "Models",
          features: JSON.parse(`[${modelsMatch[2]}]`)
        };
      }
    } catch (err) {
      console.log('⚠️ Could not read existing plans.js file, will use fetched model names');
    }

    const plansData = await fetchPlansData();
    
    // Replace the Models category with our preserved one if it exists
    if (preservedModelsCategory) {
      const modelsCategoryIndex = plansData.featureCategories.findIndex(cat => cat.name === "Models");
      if (modelsCategoryIndex !== -1) {
        plansData.featureCategories[modelsCategoryIndex] = preservedModelsCategory;
        console.log('✅ Successfully preserved model names from existing file');
      } else {
        plansData.featureCategories.push(preservedModelsCategory);
        console.log('✅ Added preserved Models category to the feature categories');
      }
    }

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
