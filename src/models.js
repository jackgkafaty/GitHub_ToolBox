// List of models and their premium request multipliers
// Auto-updated from GitHub docs on 2025-06-02T22:07:19.247Z
// Source: https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-premium-requests#model-multipliers
export const models = [
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

export const ADDITIONAL_REQUEST_COST = 0.04; // USD per request
