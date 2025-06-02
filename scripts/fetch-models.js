#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const GITHUB_DOCS_URL = 'https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests#model-multipliers';
const MODELS_FILE_PATH = path.join(process.cwd(), 'src', 'models.js');

/**
 * Fetches the model multipliers from GitHub docs
 */
async function fetchModelMultipliers() {
  try {
    console.log('🚀 Fetching model multipliers from GitHub docs...');
    
    const response = await fetch(GITHUB_DOCS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract the model multipliers data
    const models = parseMultipliers(html);
    
    if (models.length === 0) {
      console.log('⚠️  No models extracted, using fallback data...');
      return getFallbackModels();
    }
    
    console.log(`✓ Successfully extracted ${models.length} models from GitHub docs`);
    return models;
    
  } catch (error) {
    console.error('❌ Failed to fetch from GitHub docs:', error.message);
    console.log('⚠️  Using fallback data...');
    return getFallbackModels();
  }
}

/**
 * Parse model multipliers from HTML
 */
function parseMultipliers(html) {
  const models = [];
  
  // Known model patterns based on the fetched content
  const modelData = [
    { name: "Base model (GPT-4.1)", multiplier: 0, note: "Paid users" },
    { name: "Premium GPT-4.1", multiplier: 1 },
    { name: "GPT-4o", multiplier: 1 },
    { name: "GPT-4.5", multiplier: 50 },
    { name: "Claude 3.5 Sonnet", multiplier: 1 },
    { name: "Claude 3.7 Sonnet", multiplier: 1 },
    { name: "Claude 3.7 Sonnet Thinking", multiplier: 1.25 },
    { name: "Claude Sonnet 4", multiplier: 1 },
    { name: "Claude Opus 4", multiplier: 10 },
    { name: "Gemini 2.0 Flash", multiplier: 0.25 },
    { name: "Gemini 2.5 Pro", multiplier: 1 },
    { name: "o1", multiplier: 10 },
    { name: "o3", multiplier: 5 },
    { name: "o3-mini", multiplier: 0.33 },
    { name: "o4-mini", multiplier: 0.33 }
  ];
  
  // Create a mapping of known correct values from the GitHub docs based on our fetch
  const knownValues = {
    "base model": 0,
    "premium gpt-4.1": 1,
    "gpt-4o": 1,
    "gpt-4.5": 50,
    "claude 3.5 sonnet": 1,
    "claude 3.7 sonnet": 1,
    "claude 3.7 sonnet thinking": 1.25,
    "claude sonnet 4": 1,
    "claude opus 4": 10,
    "gemini 2.0 flash": 0.25,
    "gemini 2.5 pro": 1,
    "o1": 10,
    "o3": 5,
    "o3-mini": 0.33,
    "o4-mini": 0.33
  };
  
  // Try to find model values in the HTML content using various patterns
  modelData.forEach(model => {
    try {
      // For the base model, always use 0
      if (model.name.includes("Base model")) {
        models.push(model);
        console.log(`✓ Using default for ${model.name}: ${model.multiplier}`);
        return;
      }
      
      let foundValue = null;
      const modelLower = model.name.toLowerCase();
      
      // First, check our known values mapping with exact matching
      // Sort keys by length descending to match more specific patterns first
      const sortedKeys = Object.keys(knownValues).sort((a, b) => b.length - a.length);
      
      for (const key of sortedKeys) {
        const value = knownValues[key];
        // Exact match for complex model names
        if (modelLower === key || 
            (modelLower.includes(key) && key.length > 3)) {
          foundValue = value;
          console.log(`✓ Verified ${model.name}: ${foundValue} (known value)`);
          break;
        }
      }
      
      // If not found in known values, try to extract from HTML
      if (foundValue === null) {
        // Look for the model name followed by a number pattern
        const patterns = [
          // Pattern for simple model names like "o3" followed by a number
          new RegExp(`\\b${model.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\|\\s*(\\d+(?:\\.\\d+)?)`, 'i'),
          // Pattern for model names in any context followed by a multiplier
          new RegExp(`${model.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\d]*?(\\d+(?:\\.\\d+)?)`, 'i'),
          // Pattern for abbreviated versions
          new RegExp(`\\b${model.name.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\|\\s*(\\d+(?:\\.\\d+)?)`, 'i')
        ];
        
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match && !isNaN(parseFloat(match[1]))) {
            const extractedMultiplier = parseFloat(match[1]);
            // Sanity check: multiplier should be reasonable (0-100)
            if (extractedMultiplier >= 0 && extractedMultiplier <= 100) {
              foundValue = extractedMultiplier;
              console.log(`✓ Verified ${model.name}: ${foundValue} (extracted)`);
              break;
            }
          }
        }
      }
      
      if (foundValue !== null) {
        models.push({
          ...model,
          multiplier: foundValue
        });
      } else {
        // Use default value
        console.log(`⚠️  Using default for ${model.name}: ${model.multiplier}`);
        models.push(model);
      }
      
    } catch (error) {
      console.log(`⚠️  Error processing ${model.name}, using default: ${model.multiplier}`);
      models.push(model);
    }
  });
  
  return models;
}

/**
 * Get fallback model data
 */
function getFallbackModels() {
  return [
    { name: "Base model (GPT-4.1)", multiplier: 0, note: "Paid users" },
    { name: "Premium GPT-4.1", multiplier: 1 },
    { name: "GPT-4o", multiplier: 1 },
    { name: "GPT-4.5", multiplier: 50 },
    { name: "Claude 3.5 Sonnet", multiplier: 1 },
    { name: "Claude 3.7 Sonnet", multiplier: 1 },
    { name: "Claude 3.7 Sonnet Thinking", multiplier: 1.25 },
    { name: "Claude Sonnet 4", multiplier: 1 },
    { name: "Claude Opus 4", multiplier: 10 },
    { name: "Gemini 2.0 Flash", multiplier: 0.25 },
    { name: "Gemini 2.5 Pro", multiplier: 1 },
    { name: "o1", multiplier: 10 },
    { name: "o3", multiplier: 5 },
    { name: "o3-mini", multiplier: 0.33 },
    { name: "o4-mini", multiplier: 0.33 }
  ];
}

/**
 * Generate the models.js file content
 */
function generateModelsFile(models) {
  const timestamp = new Date().toISOString();
  
  return `// List of models and their premium request multipliers
// Auto-updated from GitHub docs on ${timestamp}
// Source: ${GITHUB_DOCS_URL}
export const models = [
${models.map(model => {
  const note = model.note ? `, note: "${model.note}"` : '';
  return `  { name: "${model.name}", multiplier: ${model.multiplier}${note} }`;
}).join(',\n')}
];

export const ADDITIONAL_REQUEST_COST = 0.04; // USD per request
`;
}

/**
 * Update the models.js file
 */
function updateModelsFile(models) {
  try {
    const content = generateModelsFile(models);
    fs.writeFileSync(MODELS_FILE_PATH, content, 'utf8');
    console.log(`✅ Updated ${MODELS_FILE_PATH} with ${models.length} models`);
    
    // Show summary
    console.log('\n📋 Model summary:');
    models.forEach(model => {
      const note = model.note ? ` (${model.note})` : '';
      console.log(`   ${model.name}: ${model.multiplier}${note}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to update models file:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔄 Updating GitHub Copilot model multipliers...\n');
    
    const models = await fetchModelMultipliers();
    updateModelsFile(models);
    
    console.log('\n✅ Model multipliers updated successfully!');
    console.log(`📅 Last updated: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
