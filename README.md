# GitHub ToolBox

A comprehensive React-based toolkit for GitHub services, featuring calculators and tools for GitHub Copilot, licensing, and more. Includes automatic data updates and responsive design with enhanced mobile navigation.

🌐 **Live Site**: [https://jackgkafaty.github.io/GitHub_ToolBox/](https://jackgkafaty.github.io/GitHub_ToolBox/)

## Features

### 🤖 GitHub Copilot Premium Request Calculator
- **Real-time Cost Calculation**: Calculate premium request usage for Business and Enterprise plans
- **Multiple Models**: Support for all GitHub Copilot models with their respective multipliers (15+ models)
- **Team Calculations**: Include developer count for accurate team cost estimates
- **Model Multipliers**: Accurate calculations for GPT-4, Claude, Gemini, o1, o3, and more

### 📊 GitHub Licensing Calculator
- **Plan Comparison**: Compare features across Free, Pro, Pro+, Business, and Enterprise plans
- **Feature Selection**: Choose specific features and see which plans support them
- **Cost Estimation**: Calculate total licensing costs including Advanced Security
- **Developer Scaling**: Input team size for accurate enterprise cost projections

### 🎨 Design & UX
- **Responsive Navigation**: Enhanced mobile-first navigation with hamburger menu
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **GitHub Theme**: Professional dark theme matching GitHub's design language
- **Auto-Updates**: Model multipliers and plan data automatically sync from GitHub docs

## Usage

### Premium Request Calculator
1. **Select Plan**: Choose between Business (300 requests) or Enterprise (1000 requests)
2. **Choose Model**: Select from available GitHub Copilot models (GPT-4, Claude, o1, etc.)
3. **Enter Details**: Input number of requests and team size
4. **View Results**: See premium requests used and overage costs at $0.04 per additional request

### Licensing Calculator
1. **Compare Plans**: View feature comparison across all GitHub Copilot plans
2. **Select Features**: Choose specific features you need (Agents, Models, Customization, etc.)
3. **Team Size**: Input number of developers for accurate cost scaling
4. **Advanced Security**: Add GitHub Advanced Security licensing if needed
5. **Total Cost**: See comprehensive cost breakdown for your organization

## Automated Workflows

This project includes GitHub Actions for automated maintenance:

### 🚀 Build & Deploy (Every 3 Days)

- **Schedule**: Runs every 3 days at 6 AM UTC
- **Triggers**: Also runs on pushes to main branch and manual dispatch
- **Actions**: Updates models → Builds project → Deploys to GitHub Pages

### 📊 Model Updates (Daily)

- **Schedule**: Runs daily at 2 AM UTC to check for model changes
- **Actions**: Fetches latest multipliers from GitHub docs → Commits if changed
- **Benefit**: Ensures calculator always has current data without full redeployment

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Update model data manually
npm run fetch-models

# Update plans data manually
npm run fetch-plans

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```text
src/
├── App.jsx              # Main application with navigation
├── App.css              # Styling and responsive design
├── Calculator.jsx       # Premium request calculator
├── LicensingCalculator.jsx  # GitHub licensing calculator
├── FeatureComparison.jsx   # Plan feature comparison
├── models.js            # Model data (auto-updated)
├── plans.js             # Plans data (auto-updated)
└── assets/              # Icons and images

scripts/
├── fetch-models.js      # Model data fetching script
└── fetch-plans.js       # Plans data fetching script

.github/workflows/       # GitHub Actions
├── deploy.yml           # Build & deploy workflow
└── update-models.yml    # Model update workflow
```

## Recent Updates

### June 2025
- 🔄 **Rebranded**: App name changed from "GitHub Copilot Tools" to "GitHub ToolBox"
- 🎨 **New Icon**: Updated to use official GitHub icon with larger, more prominent sizing
- 📱 **Enhanced Navigation**: Added mobile-responsive navigation with hamburger menu
- 🐛 **Bug Fixes**: Fixed GitHub Copilot section visibility and Advanced Security license reset issues
- ♿ **Accessibility**: Improved keyboard navigation and screen reader support
- 📊 **Data Updates**: Auto-sync with latest GitHub Copilot models and plans

## License

MIT

