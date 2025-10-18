/**
 * Resume Controller
 * 
 * Handles resume upload, storage, and retrieval.
 */

import { mutation, query, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Mutation: Generate upload URL for resume file
 * Usage: const uploadUrl = await generateUploadUrl();
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Mutation: Create resume record after file upload
 * This will also trigger the AI analysis pipeline
 */
export const createResume = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // Create an anonymous user for this session
    const userId = await ctx.db.insert("users", {
      hasUploadedResume: true,
      createdAt: Date.now(),
      lastActive: Date.now(),
      status: "active",
    });

    // Get file extension
    const fileType = args.fileName.split('.').pop()?.toLowerCase() || '';
    
    // Validate file type
    if (!['pdf', 'doc', 'docx'].includes(fileType)) {
      throw new Error("Invalid file type. Please upload PDF, DOC, or DOCX files.");
    }

    // Create resume record
    const resumeId = await ctx.db.insert("resumes", {
      userId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType,
      status: "processing",
      uploadedAt: Date.now(),
    });

    // Trigger real AI skill extraction and analysis immediately
    await ctx.scheduler.runAfter(0, internal.actions.aiAnalysis.analyzeResume, {
      resumeId,
    });

    return resumeId;
  },
});

/**
 * Query: Get user's resumes by user ID
 */
export const getUserResumes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return resumes;
  },
});

/**
 * Query: Get resume by ID
 */
export const getResumeById = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.resumeId);
  },
});

/**
 * Internal Mutation: Update resume status
 */
export const updateResumeStatus = internalMutation({
  args: {
    resumeId: v.id("resumes"),
    status: v.string(),
    parsedText: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
    };

    if (args.parsedText !== undefined) {
      updates.parsedText = args.parsedText;
    }

    if (args.error !== undefined) {
      updates.error = args.error;
    }

    if (args.status === "completed" || args.status === "failed") {
      updates.processedAt = Date.now();
    }

    await ctx.db.patch(args.resumeId, updates);
  },
});

/**
 * Query: Get resume file URL for download
 */
export const getResumeFileUrl = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      return null;
    }

    const url = await ctx.storage.getUrl(resume.storageId);
    return url;
  },
});

/**
 * Internal Query: Get resume by ID (for internal actions)
 */
export const getResumeByIdInternal = internalQuery({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.resumeId);
  },
});

/**
 * Internal Mutation: Mock skill extraction (demo mode)
 * Extracts comprehensive skills from resume including hard and soft skills
 * Each skill gets a unique, contextually relevant icon
 */
export const mockSkillExtraction = internalMutation({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    // Get the resume to find userId
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Comprehensive skill extraction with unique icons
    const mockSkills = [
      // Programming Languages
      { name: "JavaScript", category: "programming", proficiency: 85, icon: "💻" },
      { name: "TypeScript", category: "programming", proficiency: 82, icon: "📘" },
      { name: "Python", category: "programming", proficiency: 78, icon: "🐍" },
      { name: "Java", category: "programming", proficiency: 70, icon: "☕" },
      { name: "C++", category: "programming", proficiency: 65, icon: "⚙️" },
      { name: "Go", category: "programming", proficiency: 60, icon: "🔵" },
      
      // Frontend Frameworks & Libraries
      { name: "React", category: "framework", proficiency: 88, icon: "⚛️" },
      { name: "Vue.js", category: "framework", proficiency: 72, icon: "💚" },
      { name: "Next.js", category: "framework", proficiency: 80, icon: "▲" },
      { name: "Tailwind CSS", category: "framework", proficiency: 85, icon: "🎨" },
      { name: "Redux", category: "framework", proficiency: 75, icon: "🔄" },
      
      // Backend & APIs
      { name: "Node.js", category: "backend", proficiency: 83, icon: "🟢" },
      { name: "Express.js", category: "backend", proficiency: 80, icon: "🚂" },
      { name: "GraphQL", category: "backend", proficiency: 70, icon: "🔷" },
      { name: "REST API Design", category: "backend", proficiency: 85, icon: "🔌" },
      { name: "FastAPI", category: "backend", proficiency: 68, icon: "⚡" },
      
      // Databases
      { name: "PostgreSQL", category: "database", proficiency: 78, icon: "🐘" },
      { name: "MongoDB", category: "database", proficiency: 75, icon: "🍃" },
      { name: "Redis", category: "database", proficiency: 70, icon: "🔴" },
      { name: "MySQL", category: "database", proficiency: 72, icon: "🐬" },
      
      // Cloud & Infrastructure
      { name: "AWS", category: "cloud", proficiency: 80, icon: "☁️" },
      { name: "Azure", category: "cloud", proficiency: 65, icon: "🔷" },
      { name: "Google Cloud", category: "cloud", proficiency: 60, icon: "🌐" },
      { name: "Docker", category: "devops", proficiency: 82, icon: "🐳" },
      { name: "Kubernetes", category: "devops", proficiency: 70, icon: "☸️" },
      { name: "CI/CD", category: "devops", proficiency: 78, icon: "🔁" },
      { name: "Terraform", category: "devops", proficiency: 65, icon: "🏗️" },
      
      // Development Tools
      { name: "Git", category: "tool", proficiency: 90, icon: "📦" },
      { name: "GitHub Actions", category: "tool", proficiency: 75, icon: "🤖" },
      { name: "VS Code", category: "tool", proficiency: 88, icon: "💾" },
      { name: "Postman", category: "tool", proficiency: 80, icon: "📮" },
      
      // Testing & Quality
      { name: "Jest", category: "testing", proficiency: 78, icon: "🃏" },
      { name: "Cypress", category: "testing", proficiency: 72, icon: "🌲" },
      { name: "Unit Testing", category: "testing", proficiency: 80, icon: "🧪" },
      { name: "Test-Driven Development", category: "methodology", proficiency: 75, icon: "🎯" },
      
      // Architecture & Design
      { name: "System Design", category: "architecture", proficiency: 82, icon: "🏛️" },
      { name: "Microservices", category: "architecture", proficiency: 78, icon: "🔷" },
      { name: "Design Patterns", category: "architecture", proficiency: 80, icon: "🎨" },
      { name: "API Architecture", category: "architecture", proficiency: 83, icon: "🔗" },
      
      // AI & Machine Learning
      { name: "Machine Learning", category: "ai", proficiency: 65, icon: "🤖" },
      { name: "TensorFlow", category: "ai", proficiency: 60, icon: "🧠" },
      { name: "OpenAI API", category: "ai", proficiency: 72, icon: "✨" },
      { name: "Natural Language Processing", category: "ai", proficiency: 68, icon: "💬" },
      
      // Data & Analytics
      { name: "Data Analysis", category: "data", proficiency: 70, icon: "📊" },
      { name: "SQL Optimization", category: "data", proficiency: 75, icon: "⚡" },
      { name: "ETL Pipelines", category: "data", proficiency: 68, icon: "🔄" },
      
      // Security
      { name: "Web Security", category: "security", proficiency: 75, icon: "🔐" },
      { name: "OAuth", category: "security", proficiency: 78, icon: "🔑" },
      { name: "Encryption", category: "security", proficiency: 70, icon: "🛡️" },
      
      // Soft Skills
      { name: "Problem Solving", category: "soft_skill", proficiency: 88, icon: "💡" },
      { name: "Team Collaboration", category: "soft_skill", proficiency: 85, icon: "🤝" },
      { name: "Leadership", category: "soft_skill", proficiency: 78, icon: "👑" },
      { name: "Communication", category: "soft_skill", proficiency: 82, icon: "💬" },
      { name: "Time Management", category: "soft_skill", proficiency: 80, icon: "⏰" },
      { name: "Critical Thinking", category: "soft_skill", proficiency: 85, icon: "🧠" },
      { name: "Adaptability", category: "soft_skill", proficiency: 83, icon: "🌊" },
      { name: "Mentoring", category: "soft_skill", proficiency: 75, icon: "🎓" },
      
      // Project Management
      { name: "Agile", category: "methodology", proficiency: 82, icon: "🏃" },
      { name: "Scrum", category: "methodology", proficiency: 80, icon: "📋" },
      { name: "Jira", category: "tool", proficiency: 75, icon: "📊" },
      { name: "Project Planning", category: "management", proficiency: 78, icon: "🗓️" },
      
      // Domain Knowledge
      { name: "E-commerce", category: "domain", proficiency: 70, icon: "🛒" },
      { name: "FinTech", category: "domain", proficiency: 65, icon: "💰" },
      { name: "Healthcare Tech", category: "domain", proficiency: 60, icon: "⚕️" },
      
      // Performance & Optimization
      { name: "Performance Optimization", category: "optimization", proficiency: 80, icon: "🚀" },
      { name: "Code Review", category: "quality", proficiency: 85, icon: "👀" },
      { name: "Debugging", category: "quality", proficiency: 88, icon: "🐛" },
      
      // Mobile & Cross-platform
      { name: "React Native", category: "mobile", proficiency: 72, icon: "📱" },
      { name: "Mobile Development", category: "mobile", proficiency: 70, icon: "📲" },
    ];

    // Create skill records with unique icons and calculate risk scores
    let totalRiskScore = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    const safeSkills: string[] = [];
    const atRiskSkills: string[] = [];
    let newSkillsDetected = 0;
    
    for (const skill of mockSkills) {
      // Check if skill already exists
      const normalizedName = skill.name.toLowerCase().trim();
      let skillRecord = await ctx.db
        .query("skills")
        .withIndex("by_name", (q) => q.eq("normalizedName", normalizedName))
        .first();

      const isNewSkill = !skillRecord;
      
      if (!skillRecord) {
        // Create new skill with unique icon
        const skillId = await ctx.db.insert("skills", {
          name: skill.name,
          normalizedName,
          category: skill.category,
          icon: skill.icon,
        });
        skillRecord = await ctx.db.get(skillId);
        newSkillsDetected++;
        
        console.log(`🆕 NEW SKILL DETECTED: ${skill.name} (${skill.category})`);
        
        // Trigger AI tool curation for this new skill
        await ctx.scheduler.runAfter(0, internal.actions.exaSearch.curateAIToolsForSkill, {
          skillName: skill.name,
          skillCategory: skill.category,
          skillId,
        });
      }

      if (skillRecord) {
        // Calculate risk score based on proficiency and category
        // Higher proficiency in tech = higher AI replacement risk
        // Soft skills have lower AI risk
        let riskScore: number;
        if (skill.category === "soft_skill") {
          riskScore = Math.floor(Math.random() * 20 + 15); // 15-35% risk
        } else if (skill.category === "ai" || skill.category === "security") {
          riskScore = Math.floor(Math.random() * 25 + 30); // 30-55% risk (lower, more future-proof)
        } else {
          riskScore = Math.floor(Math.random() * 35 + 45); // 45-80% risk (tech skills)
        }
        
        // Determine risk level
        let riskLevel: "low" | "medium" | "high";
        if (riskScore < 40) {
          riskLevel = "low";
          lowRiskCount++;
          safeSkills.push(skill.name);
        } else if (riskScore < 70) {
          riskLevel = "medium";
          mediumRiskCount++;
        } else {
          riskLevel = "high";
          highRiskCount++;
          atRiskSkills.push(skill.name);
        }
        
        totalRiskScore += riskScore;
        
        // Link skill to resume (create userSkills entry)
        await ctx.db.insert("userSkills", {
          userId: resume.userId,
          skillId: skillRecord._id,
          resumeId: args.resumeId,
          skillName: skill.name,
          category: skill.category,
          icon: skill.icon, // Use unique icon
          riskScore,
          riskLevel,
          confidence: 0.85,
          source: "resume",
          extractedAt: Date.now(),
        });
      }
    }
    
    const averageRiskScore = Math.floor(totalRiskScore / mockSkills.length);
    const overallRiskLevel = averageRiskScore < 40 ? "low" : averageRiskScore < 70 ? "medium" : "high";

    // Create comprehensive analysis record
    await ctx.db.insert("analyses", {
      userId: resume.userId,
      resumeId: args.resumeId,
      averageRiskScore,
      overallRiskLevel,
      totalSkills: mockSkills.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      recommendations: [
        "🤖 Focus on AI & Machine Learning skills - these are growing and future-proof",
        "🤝 Leverage your soft skills - these are difficult for AI to replicate",
        "🔐 Security and ethical AI skills are in high demand and low AI-replacement risk",
        "🚀 Consider upskilling in emerging technologies like Web3, Edge Computing, or Quantum Computing",
        "💡 Build domain expertise - deep industry knowledge combined with tech skills is valuable",
        "🎓 Invest in mentoring and leadership - these human-centric skills have long-term value"
      ],
      safeSkills: safeSkills.slice(0, 10), // Top 10 safe skills
      atRiskSkills: atRiskSkills.slice(0, 10), // Top 10 at-risk skills
      analyzedAt: Date.now(),
      status: "completed",
    });

    // Update resume status
    await ctx.db.patch(args.resumeId, {
      status: "completed",
      parsedText: "Mock resume text content...",
      processedAt: Date.now(),
    });

    // Schedule AI tools database update based on new skills detection
    console.log(`\n📊 Skill Extraction Summary:`);
    console.log(`   Total skills: ${mockSkills.length}`);
    console.log(`   New skills detected: ${newSkillsDetected}`);
    console.log(`   Existing skills: ${mockSkills.length - newSkillsDetected}`);
    
    await ctx.scheduler.runAfter(
      3000, // Wait 3 seconds to ensure all skill records are created
      internal.controllers.aiToolsUpdateController.scheduleAIToolsUpdate,
      {
        userId: resume.userId,
        newSkillsDetected: newSkillsDetected > 0,
        newSkillCount: newSkillsDetected,
      }
    );

    if (newSkillsDetected > 0) {
      console.log(`✨ ${newSkillsDetected} new skills will trigger AI tools database update!`);
    } else {
      console.log(`⏳ No new skills. Will check if weekly update is due...`);
    }
  },
});

