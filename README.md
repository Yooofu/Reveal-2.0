# Reveal 2.0 - AI-Powered Career Skills Dashboard

> An intelligent resume analysis platform that extracts skills, calculates AI automation risk scores, and provides career recommendations using real AI.

<div align="center">

![Skills Dashboard](https://img.shields.io/badge/Skills-72%2B-blue)
![AI Powered](https://img.shields.io/badge/AI-GPT--4o-green)
![Real Time](https://img.shields.io/badge/Real--Time-Convex-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-React-blue)

</div>

---

## 📑 Table of Contents

- [What It Does](#-what-it-does)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Database Schema](#-database-schema)
- [Architecture](#️-architecture)
- [AI Tools Update System](#-ai-tools-update-system)
- [Frontend Usage](#-frontend-usage)
- [Skill Categories](#-skill-categories-18-total)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Support & Debugging](#-support--debugging)

---

## 🎯 What It Does

Upload your resume and get instant insights:

- 🎯 **72+ Skills Extracted** across 18 categories (programming, frontend, backend, cloud, AI/ML, soft skills, etc.)
- 📊 **AI Automation Risk Scores** for each skill (powered by GPT-4o)
- 💡 **Career Recommendations** tailored to your unique skill profile
- 🤖 **AI Tools Discovery** - finds tools that can automate specific skills (powered by Exa)
- 📈 **Market Demand Analysis** - research skill demand and industry trends
- 🗺️ **Visual Skill Map** - beautiful interactive visualization of your skills

---

## ✨ Key Features

### 🧠 **Intelligent Skill Extraction**
- Extracts 72 comprehensive skills across 18 categories
- Unique, contextually relevant icons for each skill (🐍 Python, 🐳 Docker, ⚛️ React)
- Categorizes skills: Programming, Frontend, Backend, Cloud, AI/ML, Security, Soft Skills, etc.

### 📊 **Risk Assessment**
- Calculates AI automation risk for each skill (0-100%)
- Risk categories: Low (15-35%), Medium (45-55%), High (60-80%)
- Intelligent scoring based on skill category
- Soft skills get lower risk scores (harder for AI to replicate)

### 🤖 **Smart AI Tools Database**
- **Automatic Updates** - intelligently decides when to update AI tools info
- **New Skills Detected** → Immediate update
- **No New Skills** → Weekly scheduled update (every 7 days)
- **Cost Efficient** - only updates when necessary
- **Always Fresh** - data never more than 7 days old

### 🔍 **Market Research**
- Powered by Exa API for real-time market data
- Discovers AI tools that can automate specific skills
- Tracks tool usage and costs
- Links to documentation and resources

### ⚡ **Real-Time Updates**
- Powered by Convex for instant data synchronization
- Live skill extraction progress
- Automatic updates as analysis completes

---

## 🏗️ Tech Stack

### **Frontend**
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Convex React** - Real-time data subscriptions

### **Backend**
- **Convex** - Backend-as-a-Service (real-time database + serverless functions)
- **Model Context Protocol (MCP)** - AI tool integration via Smithery
- **Convex Actions** - External API integrations

### **AI & Analysis**
- **OpenAI GPT-4o** - Skill extraction & risk analysis
- **Exa API** - Market research & AI tool discovery
- **Smithery MCP** - Bridge to AI services

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Convex account** - Sign up at [convex.dev](https://convex.dev) (free tier available)
- **OpenAI API key** - Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Exa API key** - Get from [exa.ai](https://exa.ai/) (free tier available)

### Installation

```bash
# 1. Clone and install dependencies
npm install

# 2. Start Convex (first time setup)
npx convex dev
# Follow prompts to create/link a Convex project

# 3. Configure API keys
npx convex env set OPENAI_API_KEY sk-your-key-here
npx convex env set EXA_API_KEY your-exa-key-here
```

### Running the App

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: React frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and upload a resume!

### Optional: Seed Database

To pre-populate the AI tools database:

```bash
# In Convex dashboard, run:
api.seedAITools.seedAITools()
```

This adds common AI tools like GPT-4, Claude, GitHub Copilot, etc.

### 💰 API Costs

- **OpenAI**: ~$0.01-0.05 per resume analysis (GPT-4o)
- **Exa**: Free tier includes 1,000 searches/month

---

## 📊 Database Schema

### **6 Tables**

#### 1. **users** - User Profiles
- Stores minimal user data for session tracking
- Fields: `email`, `name`, `hasUploadedResume`, `createdAt`, `lastAIToolsUpdate`, `nextScheduledUpdate`

#### 2. **resumes** - Uploaded Files
- Stores resume files and parsing status
- Fields: `userId`, `storageId`, `fileName`, `fileSize`, `status`, `parsedText`, `uploadedAt`

#### 3. **skills** - Master Skills Catalog
- Master list of all possible skills (72+ skills)
- Fields: `name`, `normalizedName`, `category`, `icon`, `aliases`, `relatedSkills`, `industryDemand`

#### 4. **userSkills** - User's Extracted Skills
- Links users to their skills with risk scores
- Fields: `userId`, `skillId`, `skillName`, `category`, `riskScore`, `riskLevel`, `confidence`, `marketDemand`

#### 5. **analyses** - Analysis Results
- Complete analysis results with recommendations
- Fields: `userId`, `resumeId`, `averageRiskScore`, `overallRiskLevel`, `totalSkills`, `recommendations`, `aiToolId`

#### 6. **aiTools** - AI Tools Catalog
- Tracks AI tools used for analysis
- Fields: `name`, `provider`, `type`, `description`, `capabilities`, `documentationUrl`, `homepageUrl`

### Table Relationships

```
users
  ├── resumes (1:many)
  ├── userSkills (1:many)
  └── analyses (1:many)

resumes
  ├── userSkills (1:many)
  └── analyses (1:1)

skills
  └── userSkills (1:many)

aiTools
  └── analyses (1:many)
```

---

## 🏛️ Architecture

### **MVC Pattern in Convex**

```
convex/
├── schema.ts                  # Database schema
├── models/                    # Data models & business logic
│   ├── users.ts
│   ├── resumes.ts
│   ├── skills.ts
│   └── analyses.ts
├── controllers/               # API endpoints (Queries & Mutations)
│   ├── userController.ts
│   ├── resumeController.ts
│   ├── skillController.ts
│   ├── analysisController.ts
│   └── aiToolsUpdateController.ts
├── actions/                   # External integrations via MCP
│   ├── mcpBridge.ts          # Smithery MCP bridge
│   ├── aiAnalysis.ts         # OpenAI integration
│   └── exaSearch.ts          # Exa search integration
└── utils/
    ├── validators.ts
    └── constants.ts
```

### **Data Flow**

```
1. User uploads resume
   ↓
2. Frontend → Convex Mutation (createResume)
   ↓
3. Convex Action → OpenAI via MCP (skill extraction)
   ↓
4. Store skills in database
   ↓
5. Detect if new skills found
   ↓
6. New skills? → Immediate AI tools update
   No new skills? → Check if 7 days passed
   ↓
7. Exa search for AI tools (if update needed)
   ↓
8. Real-time updates to frontend via Convex subscriptions
```

---

## 🔄 AI Tools Update System

### How It Works

The system intelligently manages when to update the AI tools database:

#### **Strategy A: Immediate Update (New Skills Detected)**
- When new skills are found in a resume
- Triggers immediate AI tools database update
- Searches for AI tools for ALL skills (new + existing)
- Timeline: < 5 seconds

#### **Strategy B: Scheduled Update (No New Skills)**
- When no new skills found
- Checks if 7 days passed since last update
- If yes → updates AI tools info for all existing skills
- If no → waits until next upload or 7 days pass

### Update Flow

```
User Uploads Resume
    ↓
Skill Extraction
    ↓
  ┌────────────┐
  │ New Skills?│
  └─────┬──┬───┘
    YES │  │ NO
        ↓  ↓
   ┌─────────┐  ┌────────────────┐
   │IMMEDIATE│  │CHECK SCHEDULE  │
   │UPDATE   │  │Last > 7 days?  │
   └─────────┘  └───┬────────┬───┘
                YES │        │ NO
                    ↓        ↓
              ┌─────────┐ ┌──────┐
              │SCHEDULED│ │WAIT  │
              │UPDATE   │ │      │
              └─────────┘ └──────┘
```

### Console Logs

You'll see detailed logs in Convex dashboard:

```
🆕 NEW SKILL DETECTED: Rust (programming)
🆕 NEW SKILL DETECTED: Kubernetes (devops)

📊 Skill Extraction Summary:
   Total skills: 67
   New skills detected: 2
   Existing skills: 65

✨ 2 new skills will trigger AI tools database update!

🔄 Starting AI tools database update for user xyz
📊 Found 67 unique skills to update
✅ AI tools database update initiated
📅 Next scheduled update: 2025-10-25T12:00:00.000Z
```

---

## 💻 Frontend Usage

### Resume Upload

```tsx
import { useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";

function ResumeUpload() {
  const generateUploadUrl = useMutation(
    api.controllers.resumeController.generateUploadUrl
  );
  const createResume = useMutation(
    api.controllers.resumeController.createResume
  );
  const analyzeResume = useAction(
    api.actions.aiAnalysis.analyzeResume
  );

  const handleUpload = async (file: File) => {
    // 1. Generate upload URL
    const uploadUrl = await generateUploadUrl();
    
    // 2. Upload file
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    
    // 3. Create resume record
    const resumeId = await createResume({
      storageId,
      fileName: file.name,
      fileSize: file.size,
    });
    
    // 4. Trigger AI analysis
    await analyzeResume({ resumeId });
  };
}
```

### Get User's Skills (Real-time)

```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function SkillsDisplay() {
  // Automatically updates when skills change
  const skills = useQuery(api.controllers.skillController.getUserSkills);
  
  if (!skills) return <div>Loading...</div>;
  
  return (
    <div>
      {skills.map(skill => (
        <SkillCard 
          key={skill._id}
          name={skill.skillName}
          icon={skill.icon}
          risk={skill.riskScore}
        />
      ))}
    </div>
  );
}
```

### Get Latest Analysis

```tsx
const analysis = useQuery(
  api.controllers.analysisController.getLatestAnalysis
);

// Returns:
// {
//   averageRiskScore: 65,
//   overallRiskLevel: "medium",
//   totalSkills: 67,
//   recommendations: [...],
//   safeSkills: [...],
//   atRiskSkills: [...]
// }
```

---

## 🎨 Skill Categories (18 Total)

### Technical Skills
- 💻 **Programming Languages** (6): JavaScript, TypeScript, Python, Java, C++, Go
- ⚛️ **Frontend Frameworks** (5): React, Vue.js, Next.js, Tailwind CSS, Redux
- 🟢 **Backend & APIs** (5): Node.js, Express.js, GraphQL, REST API, FastAPI
- 🐘 **Databases** (4): PostgreSQL, MongoDB, Redis, MySQL
- ☁️ **Cloud & DevOps** (7): AWS, Azure, Google Cloud, Docker, Kubernetes, CI/CD, Terraform
- 📦 **Development Tools** (4): Git, GitHub Actions, VS Code, Postman
- 🧪 **Testing & Quality** (4): Jest, Cypress, Unit Testing, TDD
- 📱 **Mobile Development** (2): React Native, Mobile Development

### Advanced Skills
- 🏛️ **Architecture & Design** (4): System Design, Microservices, Design Patterns, API Architecture
- 🤖 **AI & Machine Learning** (4): Machine Learning, TensorFlow, OpenAI API, NLP
- 📊 **Data & Analytics** (3): Data Analysis, SQL Optimization, ETL Pipelines
- 🔐 **Security** (3): Web Security, OAuth, Encryption
- 🚀 **Performance & Quality** (3): Performance Optimization, Code Review, Debugging

### Business Skills
- 💡 **Soft Skills** (8): Problem Solving, Team Collaboration, Leadership, Communication, Time Management, Critical Thinking, Adaptability, Mentoring
- 🏃 **Project Management** (4): Agile, Scrum, Jira, Project Planning
- 🛒 **Domain Knowledge** (3): E-commerce, FinTech, Healthcare Tech

---

## 📈 Recommendations System

Based on your skill mix, the system provides 6 actionable recommendations:

1. 🤖 **Focus on AI & Machine Learning** - Future-proof your career
2. 🤝 **Leverage Soft Skills** - Difficult for AI to replicate
3. 🔐 **Security & Ethical AI** - High demand, low risk
4. 🚀 **Upskill in Emerging Tech** - Web3, Edge Computing, Quantum
5. 💡 **Build Domain Expertise** - Valuable combination with technical skills
6. 🎓 **Invest in Mentoring & Leadership** - Long-term career value

---

## 🔧 Configuration

### Change Update Interval

Edit `/convex/controllers/aiToolsUpdateController.ts`:

```typescript
// Default: 7 days
const oneWeek = 7 * 24 * 60 * 60 * 1000;

// Examples:
const threeDays = 3 * 24 * 60 * 60 * 1000;
const twoWeeks = 14 * 24 * 60 * 60 * 1000;
```

### Manual Update Trigger

```typescript
// From Convex dashboard or frontend
await api.controllers.aiToolsUpdateController.manualUpdateAITools({
  userId: "user_id_here"
});
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **"OPENAI_API_KEY not configured"** | Run `npx convex env set OPENAI_API_KEY sk-...` then `npx convex dev` |
| **Skills not extracting** | Verify OpenAI API key validity and account has credits |
| **TypeScript errors** | Run `npx convex dev` to regenerate types |
| **Updates not triggering** | Check Convex logs for errors, verify Exa API key is set |
| **Resume upload fails** | Ensure file is PDF/DOC/DOCX format and under 10MB |
| **Frontend not loading** | Check if both `npx convex dev` and `npm run dev` are running |

### Debug Checklist

1. ✅ Convex dev server running (`npx convex dev`)
2. ✅ Frontend dev server running (`npm run dev`)
3. ✅ API keys configured (`npx convex env list`)
4. ✅ Check browser console for errors (F12)
5. ✅ Check Convex dashboard for backend errors
6. ✅ Look for emoji indicators in logs (🆕, ✨, 📊, 🔄)

---

## 📚 Project Structure

```
Reveal 2.0/
├── convex/                    # Backend (Convex)
│   ├── schema.ts             # Database schema
│   ├── models/               # Data models
│   ├── controllers/          # API endpoints
│   ├── actions/              # External integrations
│   ├── utils/                # Helpers
│   └── seedAITools.ts        # Seed data
├── src/                      # Frontend (React)
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── components/          # React components
│   │   ├── ResumeUploadModal.tsx
│   │   ├── SkillDetailView.tsx
│   │   ├── ScrollingSkillRow.tsx
│   │   ├── WorkflowDiagram.tsx
│   │   └── ui/              # shadcn/ui components
│   └── styles/              # CSS styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.ts           # Vite config
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

---

## 🎯 Development Workflow

### Daily Development

```bash
# Terminal 1: Backend (auto-reloads on changes)
npx convex dev

# Terminal 2: Frontend (auto-reloads on changes)
npm run dev
```

### Making Changes

1. **Frontend changes** (`src/`) → Auto-reload in browser
2. **Backend changes** (`convex/`) → Auto-deploy to Convex
3. **Schema changes** → Regenerates types automatically
4. **View logs** → Convex dashboard + browser console

### Deploying to Production

```bash
# Deploy backend
npx convex deploy

# Deploy frontend (Vercel)
vercel --prod
```

---

## 📦 Dependencies

### Core
- `react` - UI framework
- `convex` - Backend & real-time database
- `typescript` - Type safety
- `vite` - Build tool

### UI
- `tailwindcss` - Styling
- `@radix-ui/*` - Headless UI components (via shadcn/ui)
- `lucide-react` - Icons

### Utilities
- `clsx` / `class-variance-authority` - Class management
- `date-fns` - Date formatting
- `sonner` - Toast notifications

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npx convex dev` | Start Convex backend (dev mode) |
| `npx convex deploy` | Deploy backend to production |
| `npx convex env list` | List environment variables |
| `npx convex env set KEY value` | Set environment variable |
| `npx convex dashboard` | Open Convex dashboard in browser |

---

## 🎨 Design System

This project uses components from **[shadcn/ui](https://ui.shadcn.com/)** under MIT license.

Photos from **[Unsplash](https://unsplash.com)** used under their license.

Original Figma design available at: [Pixelated Skills Dashboard](https://www.figma.com/design/JDyLqmukm3ya54cNnW0gvL/Pixelated-Skills-Dashboard)

---

## 🚀 Deployment

### Backend (Convex)

```bash
# Deploy to production
npx convex deploy
```

### Frontend

**Option 1: Vercel** (Recommended)
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Environment Variables:**
- Set `VITE_CONVEX_URL` to your Convex deployment URL (if needed)
- All API keys are stored securely in Convex environment variables

---

## 🔐 Security

- ✅ API keys stored securely in Convex environment variables
- ✅ Never commit secrets to Git (protected by `.gitignore`)
- ✅ File uploads validated and sanitized
- ✅ Resume files stored securely in Convex storage
- ⚠️ Anonymous user authentication (no login required)

---

## 📄 License

MIT License

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (ensure `npx convex dev` runs without errors)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 🎉 Success Metrics

✅ 72+ skills extracted across 18 categories  
✅ Intelligent AI automation risk scoring  
✅ Smart AI tools database updates  
✅ Real-time data synchronization  
✅ Cost-efficient API usage  
✅ Comprehensive logging and monitoring  
✅ Production-ready architecture

---

## 📞 Support & Debugging

If you encounter issues:

1. **Check Convex logs** - Open your [Convex dashboard](https://dashboard.convex.dev) and view function logs
2. **Verify API keys** - Run `npx convex env list` to check configured keys
3. **Look for emoji indicators** in logs - 🆕 (new skills), ✨ (updates), 📊 (summaries), 🔄 (processing)
4. **Check browser console** - For frontend errors
5. **Verify database** - Use Convex dashboard to inspect table data

Common fixes:
- **"OPENAI_API_KEY not configured"** → Run `npx convex env set OPENAI_API_KEY sk-...`
- **Skills not extracting** → Check OpenAI API key is valid and has credits
- **TypeScript errors** → Run `npx convex dev` to regenerate types

---

## 🌟 Show Your Support

If you found this project helpful, please consider:
- ⭐ Star this repository
- 🐛 Report bugs by opening an issue
- 💡 Suggest new features
- 📖 Improve documentation

---

**Built with ❤️ using React, TypeScript, Convex, OpenAI GPT-4o, and Exa**

**Ready to analyze your resume?** Upload a resume and discover your AI automation risk profile! 🚀
  