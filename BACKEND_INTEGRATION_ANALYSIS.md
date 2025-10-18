# Backend Integration Analysis for Reveal 2.0

## Executive Summary

Reveal is a skills analysis platform that allows users to upload their resumes, extract skills, assess AI replacement risk, and discover career augmentation pathways. This document outlines the complete backend integration strategy required to transform the current frontend mockup into a fully functional production application.

---

## 1. Current Architecture Overview

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS v4
- **Animation**: Motion (Framer Motion)
- **State Management**: React hooks (useState)
- **File Upload**: React Dropzone

### Current Data Flow (Mock)
```
User Upload Resume → Mock Processing → Display Predefined Skills → Show Risk Analysis
```

### Key Components
1. **Landing Page** (`App.tsx`) - Hero section with scrolling skill tags
2. **Resume Upload Modal** (`ResumeUploadModal.tsx`) - File upload interface
3. **Workflow Diagram** (`WorkflowDiagram.tsx`) - Visual skill map with radial layout
4. **Skill Detail View** (`SkillDetailView.tsx`) - Detailed risk analysis and pathways

---

## 2. Required Backend Services

### 2.1 Core Services

#### **A. Resume Processing Service**
**Purpose**: Parse and extract information from uploaded resumes

**Functionality**:
- Accept PDF, DOC, DOCX files
- Extract text content using OCR/parsing libraries
- Identify skills, experience, education, certifications
- Normalize skill names (e.g., "React.js" → "react")
- Return structured data

**Technology Options**:
- **Python-based**: PyPDF2, python-docx, spaCy for NLP
- **Cloud Services**: AWS Textract, Google Cloud Document AI, Azure Form Recognizer
- **Open Source**: Apache Tika, Tesseract OCR

#### **B. AI Risk Assessment Service**
**Purpose**: Calculate AI replacement risk for each extracted skill

**Functionality**:
- Match extracted skills against AI capability database
- Calculate risk scores based on:
  - AI tool maturity
  - Automation potential
  - Human-AI collaboration possibilities
  - Market trends
- Return risk level (low/medium/high) and percentage

**Technology Options**:
- **ML Model**: Custom trained model on historical job market data
- **Rule-based Engine**: Predefined risk matrices
- **API Integration**: OpenAI API, Anthropic Claude for semantic analysis

#### **C. AI Tools Database Service**
**Purpose**: Maintain and query database of AI tools relevant to skills

**Functionality**:
- Store AI tools with metadata (name, description, launch date, capabilities)
- Match skills to relevant AI tools
- Track threat levels and relevance scores
- Update with new AI tools regularly

**Data Structure**:
```json
{
  "id": "uuid",
  "name": "GitHub Copilot",
  "description": "AI pair programmer",
  "launchDate": "2021-06",
  "capabilities": ["code-completion", "code-generation"],
  "relevantSkills": ["python", "javascript", "java"],
  "threatLevel": "high",
  "website": "https://github.com/features/copilot"
}
```

#### **D. Career Pathways Service**
**Purpose**: Provide personalized career recommendations

**Functionality**:
- Generate defend/augment/pivot strategies per skill
- Recommend learning resources
- Suggest emerging roles
- Track industry trends

---

## 3. API Endpoints Design

### Base URL: `https://api.reveal.app/v1`

### 3.1 Resume Processing

#### **POST /resumes/upload**
Upload and process resume file

**Request**:
```
Content-Type: multipart/form-data

{
  "file": <binary>,
  "userId": "string (optional)"
}
```

**Response**:
```json
{
  "jobId": "uuid",
  "status": "processing",
  "estimatedTime": 30
}
```

#### **GET /resumes/status/:jobId**
Check processing status

**Response**:
```json
{
  "jobId": "uuid",
  "status": "completed | processing | failed",
  "progress": 100,
  "result": {
    "resumeId": "uuid",
    "skills": [...],
    "experience": [...],
    "education": [...]
  }
}
```

### 3.2 Skills Analysis

#### **GET /skills/analyze/:resumeId**
Get complete skill analysis with risk scores

**Response**:
```json
{
  "resumeId": "uuid",
  "skills": [
    {
      "id": "uuid",
      "name": "advanced python programming",
      "category": "programming",
      "icon": "💻",
      "risk": {
        "level": "high",
        "score": 85,
        "trend": "increasing"
      },
      "extractedFrom": ["work experience", "projects"]
    }
  ],
  "overallRisk": {
    "score": 68,
    "level": "medium"
  }
}
```

#### **GET /skills/:skillId/details**
Get detailed information about a specific skill

**Response**:
```json
{
  "skillId": "uuid",
  "name": "advanced python programming",
  "risk": {
    "level": "high",
    "score": 85,
    "trend": "increasing",
    "factors": [
      "High automation potential",
      "Mature AI tools available"
    ]
  },
  "aiTools": [
    {
      "name": "GitHub Copilot",
      "relevanceScore": 92,
      "threatLevel": "high",
      ...
    }
  ],
  "pathways": [
    {
      "type": "defend",
      "strategies": [...]
    }
  ]
}
```

### 3.3 AI Tools Database

#### **GET /ai-tools**
List all AI tools with filtering

**Query Parameters**:
- `skill`: Filter by skill name
- `threatLevel`: low | medium | high
- `minRelevance`: number (0-100)

**Response**:
```json
{
  "tools": [
    {
      "id": "uuid",
      "name": "GitHub Copilot",
      "description": "AI pair programmer",
      "launchDate": "2021-06",
      "threatLevel": "high",
      "website": "https://...",
      "relevantSkills": ["python", "javascript"]
    }
  ],
  "total": 150,
  "page": 1
}
```

### 3.4 Career Pathways

#### **GET /pathways/:skillId**
Get career pathways for a skill

**Response**:
```json
{
  "skillId": "uuid",
  "pathways": [
    {
      "id": "defend",
      "title": "Defend",
      "description": "Double down and specialize",
      "strategies": [
        "Focus on complex problem-solving",
        "Build interpersonal skills"
      ],
      "resources": [
        {
          "type": "course",
          "title": "Advanced Python Architecture",
          "url": "https://..."
        }
      ]
    }
  ]
}
```

### 3.5 User Management (Optional for MVP)

#### **POST /auth/register**
#### **POST /auth/login**
#### **GET /users/profile**
#### **PUT /users/profile**
#### **GET /users/resumes**

---

## 4. Database Schema Design

### Technology: PostgreSQL + Redis

### 4.1 Core Tables

#### **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **resumes**
```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  file_name VARCHAR(255),
  file_url TEXT,
  file_size INTEGER,
  status VARCHAR(50), -- processing, completed, failed
  raw_text TEXT,
  parsed_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **skills**
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id),
  name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255),
  category VARCHAR(100),
  icon VARCHAR(10),
  risk_level VARCHAR(20), -- low, medium, high
  risk_score INTEGER, -- 0-100
  risk_trend VARCHAR(20), -- increasing, stable, decreasing
  extracted_from TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **ai_tools**
```sql
CREATE TABLE ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  launch_date DATE,
  website TEXT,
  threat_level VARCHAR(20),
  capabilities TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **skill_tool_mappings**
```sql
CREATE TABLE skill_tool_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_normalized_name VARCHAR(255),
  tool_id UUID REFERENCES ai_tools(id),
  relevance_score INTEGER, -- 0-100
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **career_pathways**
```sql
CREATE TABLE career_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_normalized_name VARCHAR(255),
  pathway_type VARCHAR(50), -- defend, augment, pivot
  title VARCHAR(255),
  description TEXT,
  strategies JSONB,
  resources JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Indexes
```sql
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_skills_resume_id ON skills(resume_id);
CREATE INDEX idx_skills_normalized_name ON skills(normalized_name);
CREATE INDEX idx_skill_tool_normalized ON skill_tool_mappings(skill_normalized_name);
```

---

## 5. Implementation Architecture

### Recommended Stack

#### **Backend Framework**
- **Option 1 (Python)**: FastAPI + Celery + Redis
  - FastAPI for REST API
  - Celery for async task processing
  - Redis for job queue and caching
  
- **Option 2 (Node.js)**: Express.js + Bull + Redis
  - Express.js for REST API
  - Bull for job queue
  - Redis for queue and caching

- **Option 3 (Go)**: Gin + Asynq + Redis
  - High performance
  - Better concurrency handling

#### **File Storage**
- AWS S3 / Google Cloud Storage / Azure Blob
- Store original resume files
- Generate signed URLs for secure access

#### **AI/ML Integration**
- OpenAI API for semantic analysis
- spaCy for NLP tasks
- Custom ML models for risk scoring

#### **Deployment**
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (for scale)
- **Cloud Provider**: AWS / GCP / Azure

---

## 6. Implementation Phases

### Phase 1: MVP (2-3 weeks)
**Goal**: Basic functionality with mock data enrichment

**Tasks**:
1. Set up backend framework (FastAPI recommended)
2. Implement file upload endpoint with basic validation
3. Integrate resume parsing library (PyPDF2 + python-docx)
4. Create basic skill extraction (keyword matching)
5. Seed database with AI tools data
6. Implement GET /skills/analyze endpoint
7. Connect frontend to real API endpoints

**Deliverables**:
- Working resume upload and parsing
- Basic skill extraction
- Static risk scoring
- API documentation (Swagger/OpenAPI)

### Phase 2: Enhanced Analysis (2-3 weeks)
**Goal**: Improve accuracy and add AI-powered features

**Tasks**:
1. Integrate OpenAI API for better skill extraction
2. Implement semantic matching for skills
3. Build risk scoring algorithm
4. Create AI tools database with 100+ tools
5. Add skill-to-tool matching logic
6. Implement career pathways generation

**Deliverables**:
- AI-powered skill extraction
- Dynamic risk scoring
- Comprehensive AI tools database
- Personalized pathway recommendations

### Phase 3: User Management & Persistence (1-2 weeks)
**Goal**: Add user accounts and history

**Tasks**:
1. Implement user authentication (JWT)
2. Add user registration and login
3. Create user dashboard
4. Store resume history
5. Add profile management

**Deliverables**:
- User authentication system
- Resume history tracking
- Personal dashboard

### Phase 4: Optimization & Scale (2-3 weeks)
**Goal**: Production-ready system

**Tasks**:
1. Add caching layer (Redis)
2. Implement rate limiting
3. Add monitoring and logging (Sentry, DataDog)
4. Performance optimization
5. Security hardening
6. Load testing

**Deliverables**:
- Scalable infrastructure
- Production monitoring
- Security audit passed

---

## 7. API Integration Changes Required in Frontend

### 7.1 Update ResumeUploadModal.tsx

**Current**:
```typescript
// Mock processing
setTimeout(() => {
  setIsProcessing(false);
  onAnalysisComplete();
}, 3000);
```

**New**:
```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // Upload resume
    const uploadResponse = await fetch('/api/resumes/upload', {
      method: 'POST',
      body: formData
    });
    const { jobId } = await uploadResponse.json();
    
    // Poll for status
    const pollInterval = setInterval(async () => {
      const statusResponse = await fetch(`/api/resumes/status/${jobId}`);
      const { status, result } = await statusResponse.json();
      
      if (status === 'completed') {
        clearInterval(pollInterval);
        setIsProcessing(false);
        onAnalysisComplete(result.resumeId);
      } else if (status === 'failed') {
        clearInterval(pollInterval);
        // Handle error
      }
    }, 2000);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 7.2 Update App.tsx

**Current**:
```typescript
const extractedSkills = [/* hardcoded */];
```

**New**:
```typescript
const [extractedSkills, setExtractedSkills] = useState([]);

const handleAnalysisComplete = async (resumeId: string) => {
  const response = await fetch(`/api/skills/analyze/${resumeId}`);
  const { skills } = await response.json();
  setExtractedSkills(skills);
  setShowWorkflow(true);
};
```

### 7.3 Update SkillDetailView.tsx

**Current**:
```typescript
const mockAITools = {/* hardcoded */};
```

**New**:
```typescript
const [skillDetails, setSkillDetails] = useState(null);

useEffect(() => {
  const fetchSkillDetails = async () => {
    const response = await fetch(`/api/skills/${skill.id}/details`);
    const data = await response.json();
    setSkillDetails(data);
  };
  fetchSkillDetails();
}, [skill.id]);
```

### 7.4 Create API Service Layer

**File**: `src/services/api.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  resumes: {
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
        method: 'POST',
        body: formData
      });
      return response.json();
    },
    
    getStatus: async (jobId: string) => {
      const response = await fetch(`${API_BASE_URL}/resumes/status/${jobId}`);
      return response.json();
    }
  },
  
  skills: {
    analyze: async (resumeId: string) => {
      const response = await fetch(`${API_BASE_URL}/skills/analyze/${resumeId}`);
      return response.json();
    },
    
    getDetails: async (skillId: string) => {
      const response = await fetch(`${API_BASE_URL}/skills/${skillId}/details`);
      return response.json();
    }
  }
};
```

---

## 8. Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reveal
REDIS_URL=redis://localhost:6379

# File Storage
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=reveal-resumes

# AI Services
OPENAI_API_KEY=sk-...

# App Config
PORT=8000
ENV=development
SECRET_KEY=your_secret_key_here

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://reveal.app
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_MAX_FILE_SIZE_MB=10
```

---

## 9. Security Considerations

### 9.1 File Upload Security
- Validate file types (whitelist: PDF, DOC, DOCX)
- Limit file size (max 10MB)
- Scan for malware using ClamAV or similar
- Store files with UUID names (avoid original filenames)
- Use signed URLs for file access

### 9.2 API Security
- Implement rate limiting (10 requests/minute for uploads)
- Add CSRF protection
- Sanitize all user inputs
- Use parameterized queries (prevent SQL injection)
- Implement authentication tokens (JWT)
- Enable CORS only for trusted domains

### 9.3 Data Privacy
- Encrypt sensitive data at rest
- Use HTTPS/TLS for all communications
- Implement data retention policies
- Add GDPR-compliant data deletion
- Don't log sensitive information

---

## 10. Monitoring & Analytics

### Metrics to Track
- Resume processing time
- Skill extraction accuracy
- API response times
- Error rates
- User engagement (uploads per day)
- Popular skills analyzed
- AI tool database update frequency

### Tools
- **Application Monitoring**: Sentry, DataDog
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Analytics**: Mixpanel, Google Analytics
- **Uptime Monitoring**: Pingdom, UptimeRobot

---

## 11. Cost Estimation (Monthly)

### Infrastructure
- **Server (Backend)**: $50-200 (AWS EC2 t3.medium or equivalent)
- **Database (PostgreSQL)**: $15-50 (AWS RDS db.t3.micro)
- **Redis Cache**: $15-30 (AWS ElastiCache)
- **File Storage (S3)**: $5-20 (depends on volume)
- **CDN**: $10-30 (CloudFront)

### AI Services
- **OpenAI API**: $50-500 (depends on usage)
- **Document AI**: $100-300 (if using cloud OCR)

### Total Estimated: $250-1,100/month for MVP (scales with usage)

---

## 12. Success Metrics

### Technical KPIs
- Resume processing time < 30 seconds
- API response time < 200ms (p95)
- Uptime > 99.5%
- Skill extraction accuracy > 85%

### Business KPIs
- User retention rate
- Resumes processed per day
- Skills analyzed per user
- User satisfaction score
- Conversion rate (if monetized)

---

## 13. Next Steps

### Immediate Actions
1. **Choose Backend Stack** - Recommend FastAPI (Python) for rapid development
2. **Set Up Development Environment** - Docker Compose for local dev
3. **Create API Specification** - OpenAPI/Swagger documentation
4. **Start Phase 1 Implementation** - File upload + basic parsing

### Timeline
- **Week 1-2**: Backend setup, file upload, basic parsing
- **Week 3-4**: Skill extraction, API integration with frontend
- **Week 5-6**: AI tools database, risk scoring
- **Week 7-8**: Career pathways, optimization
- **Week 9**: Testing, deployment

---

## 14. Conclusion

Reveal 2.0 requires a robust backend infrastructure to transform from a design prototype to a production application. The recommended approach is to:

1. Start with **Phase 1 MVP** using FastAPI + PostgreSQL + Redis
2. Implement **basic resume parsing** with PyPDF2/python-docx
3. Use **OpenAI API** for intelligent skill extraction
4. Build a **curated AI tools database** (start with 50-100 entries)
5. Implement **simple rule-based risk scoring** initially
6. Add **ML-based risk assessment** in Phase 2

This phased approach allows for rapid iteration, early user feedback, and incremental feature addition while maintaining code quality and system scalability.

The estimated development time is **8-10 weeks** for a fully functional MVP with user authentication, skill analysis, and career pathways.

---

## Appendix A: Example API Request/Response Flows

### Complete User Journey

**1. User uploads resume**
```http
POST /api/v1/resumes/upload
Content-Type: multipart/form-data

Response:
{
  "jobId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing"
}
```

**2. Frontend polls for status**
```http
GET /api/v1/resumes/status/123e4567-e89b-12d3-a456-426614174000

Response:
{
  "status": "completed",
  "result": {
    "resumeId": "987fbc97-4bed-5078-9f07-9141ba07c9f3",
    "skills": [
      {
        "id": "skill-1",
        "name": "advanced python programming",
        "icon": "💻",
        "risk": "high"
      }
    ]
  }
}
```

**3. User views skill details**
```http
GET /api/v1/skills/skill-1/details

Response:
{
  "name": "advanced python programming",
  "risk": {
    "level": "high",
    "score": 85,
    "trend": "increasing"
  },
  "aiTools": [...]
  "pathways": [...]
}
```

---

**End of Analysis**

