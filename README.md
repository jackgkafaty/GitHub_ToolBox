# GitHub Copilot Premium Request Calculator

A React-based calculator for estimating GitHub Copilot premium request usage and costs across different models and plans. Features automatic model data updates and responsive design.

🌐 **Live Site**: [https://jackgkafaty.github.io/GitHubCopilot_PremiumRequests/](https://jackgkafaty.github.io/GitHubCopilot_PremiumRequests/)

## Features

- **Real-time Cost Calculation**: Calculate premium request usage for Business and Enterprise plans
- **Multiple Models**: Support for all GitHub Copilot models with their respective multipliers
- **Team Calculations**: Include developer count for accurate team cost estimates
- **Automatic Updates**: Model multipliers are automatically fetched from GitHub documentation
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **GitHub Copilot Theme**: Professional dark theme matching GitHub's design language

## Usage

1. **Select Plan**: Choose between Business (300 requests) or Enterprise (1000 requests)
2. **Choose Model**: Select from available GitHub Copilot models
3. **Enter Details**: Input number of requests and team size
4. **View Results**: See premium requests used and overage costs at $0.04 per additional request

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

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Update model data manually
npm run fetch-models

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```
src/
├── App.jsx              # Main calculator component
├── App.css              # Styling and responsive design
├── models.js            # Model data (auto-updated)
├── assets/              # Icons and images
└── components/          # React components

scripts/
└── fetch-models.js      # Model data fetching script

.github/workflows/       # GitHub Actions
├── deploy.yml           # Build & deploy workflow
└── update-models.yml    # Model update workflow
```

## License

MIT

