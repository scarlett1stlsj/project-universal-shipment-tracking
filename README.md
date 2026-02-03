# UseOmni.io
### Tracking the world so you don't have to.

UseOmni.io is a modern, mobile-first universal tracking platform. It consolidates package information from all major carriers (UPS, FedEx, DHL, Amazon) into a single, beautiful dashboard.

## 🚀 Key Features
- **AI-Powered Inbox Sync**: Automatically extract shipment details from confirmation emails using Google Gemini.
- **Smart Label Scanning**: Use your camera to scan physical shipping labels and instantly parse addresses using computer vision and AI.
- **Unified Feed**: Manage both incoming orders and outgoing shipments in one place.
- **Address Book**: Save frequently used addresses for rapid shipment creation.
- **Mobile Optimized**: Designed for a seamless experience on the go.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS
- **AI/ML**: Google Gemini AI (via `@google/genai`)
- **Icons**: Lucide React

## 📦 Setup & Deployment

### Local Development
1. Clone the repository.
2. Ensure you have your Google Gemini API Key.
3. Set the environment variable `API_KEY` in your development environment.
4. Run the application using your preferred web server or build tool.

### GitHub Deployment
To push this code to your GitHub repository, run the following commands in your terminal:

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: UseOmni.io tracking platform"

# Set main branch
git branch -M main

# Link to your repository
git remote add origin https://github.com/scarlett1stlsj/project-universal-shipment-tracking.git

# Push to GitHub
git push -u origin main
```

## 🔒 Privacy & Security
UseOmni.io processes tracking information securely. Ensure your API keys are never committed directly to public repositories by using environment variables.
