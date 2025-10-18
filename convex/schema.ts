/**
 * Convex Database Schema
 * 
 * Defines all database tables and their relationships for Reveal 2.0
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * Users Table
   * Stores user profile data
   * Note: Authentication removed - users are created on first resume upload
   */
  users: defineTable({
    // Basic fields
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()), // For auth, kept for backward compatibility
    
    // Profile fields
    hasUploadedResume: v.optional(v.boolean()),
    createdAt: v.number(), // Timestamp
    lastActive: v.optional(v.number()),
    
    // AI Tools Database Tracking
    lastAIToolsUpdate: v.optional(v.number()), // Timestamp of last AI tools database update
    nextScheduledUpdate: v.optional(v.number()), // Timestamp for next scheduled update
    
    // Metadata
    status: v.optional(v.string()), // "active", "inactive"
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_nextScheduledUpdate", ["nextScheduledUpdate"]),

  /**
   * Resumes Table
   * Stores uploaded resume files and parsing status
   */
  resumes: defineTable({
    userId: v.id("users"),
    
    // File storage
    storageId: v.string(), // Convex storage ID
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(), // "pdf", "doc", "docx"
    
    // Processing status
    status: v.string(), // "uploaded", "parsing", "parsed", "analyzing", "completed", "failed"
    parsedText: v.optional(v.string()), // Extracted text content
    
    // Metadata
    uploadedAt: v.number(),
    processedAt: v.optional(v.number()),
    error: v.optional(v.string()), // Error message if processing failed
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"]),

  /**
   * Skills Table
   * Master catalog of all possible skills
   */
  skills: defineTable({
    name: v.string(),
    normalizedName: v.string(), // Lowercase, for matching
    category: v.string(), // "programming", "design", "management", etc.
    icon: v.string(), // Emoji or icon identifier
    
    // Metadata
    aliases: v.optional(v.array(v.string())), // Alternative names
    relatedSkills: v.optional(v.array(v.id("skills"))), // Related skill IDs
    
    // Market data (can be updated via Exa)
    industryDemand: v.optional(v.string()), // "high", "medium", "low"
    lastUpdated: v.optional(v.number()),
  })
    .index("by_name", ["normalizedName"])
    .index("by_category", ["category"])
    .searchIndex("search_skills", {
      searchField: "name",
      filterFields: ["category"],
    }),

  /**
   * User Skills Table
   * Junction table linking users to their extracted skills
   */
  userSkills: defineTable({
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    skillId: v.id("skills"),
    
    // Skill details
    skillName: v.string(), // Denormalized for quick access
    category: v.string(),
    icon: v.string(),
    
    // AI Assessment
    riskScore: v.number(), // 0-100, AI replacement risk
    riskLevel: v.string(), // "low", "medium", "high"
    confidence: v.number(), // 0-1, AI confidence in extraction
    
    // AI Augmentation Pathways - SKILL-SPECIFIC strategies
    defendStrategies: v.optional(v.array(v.string())), // Defend strategies for THIS skill
    augmentStrategies: v.optional(v.array(v.string())), // Augment strategies for THIS skill
    pivotStrategies: v.optional(v.array(v.string())), // Pivot strategies for THIS skill
    
    // Market analysis (via Exa)
    marketDemand: v.optional(v.string()),
    averageSalary: v.optional(v.number()),
    
    // Metadata
    extractedAt: v.number(),
    source: v.optional(v.string()), // "resume", "manual", etc.
  })
    .index("by_userId", ["userId"])
    .index("by_resumeId", ["resumeId"])
    .index("by_skillId", ["skillId"])
    .index("by_userId_riskLevel", ["userId", "riskLevel"])
    .index("by_riskScore", ["riskScore"]),

  /**
   * Analyses Table
   * Stores complete analysis results for each resume
   */
  analyses: defineTable({
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    
    // Overall assessment
    averageRiskScore: v.number(),
    overallRiskLevel: v.string(), // "low", "medium", "high"
    totalSkills: v.number(),
    highRiskCount: v.number(),
    mediumRiskCount: v.number(),
    lowRiskCount: v.number(),
    
    // Recommendations
    recommendations: v.array(v.string()),
    safeSkills: v.array(v.string()), // Skills with low AI risk
    atRiskSkills: v.array(v.string()), // Skills with high AI risk
    
    // AI Augmentation Pathways - Personalized strategies
    defendStrategies: v.optional(v.array(v.string())), // DEFEND pathway recommendations
    augmentStrategies: v.optional(v.array(v.string())), // AUGMENT pathway recommendations
    pivotStrategies: v.optional(v.array(v.string())), // PIVOT pathway recommendations
    
    // Industry insights
    industryOutlook: v.optional(v.string()),
    suggestedTransitions: v.optional(v.array(v.string())),
    
    // AI Tool tracking
    aiToolId: v.optional(v.id("aiTools")), // Which AI tool performed this analysis
    aiModelVersion: v.optional(v.string()), // "gpt-4", "claude-3", etc.
    
    // Metadata
    analyzedAt: v.number(),
    status: v.string(), // "pending", "processing", "completed", "failed"
  })
    .index("by_userId", ["userId"])
    .index("by_resumeId", ["resumeId"])
    .index("by_status", ["status"])
    .index("by_aiToolId", ["aiToolId"]),

  /**
   * AI Tools Table
   * Tracks MCP tools/AI models used for analysis and their capabilities
   */
  aiTools: defineTable({
    // Tool identification
    name: v.string(), // e.g., "gpt-4", "claude-3-opus", "exa-search"
    provider: v.string(), // "openai", "anthropic", "exa", etc.
    type: v.string(), // "llm", "search", "analysis", "embedding"
    
    // Tool details
    description: v.string(), // Brief description of what this tool does
    capabilities: v.array(v.string()), // ["skill_extraction", "risk_assessment", "market_research"]
    
    // MCP Integration
    mcpServerUrl: v.optional(v.string()), // URL to the MCP server
    mcpToolName: v.string(), // Name of the tool in MCP protocol
    
    // Documentation & Resources
    documentationUrl: v.optional(v.string()), // Link to tool documentation
    homepageUrl: v.optional(v.string()), // Official website
    
    // Configuration
    version: v.optional(v.string()), // Tool version
    maxTokens: v.optional(v.number()), // For LLMs
    costPerRequest: v.optional(v.number()), // Estimated cost in USD
    
    // Usage tracking
    isActive: v.boolean(), // Whether this tool is currently in use
    usageCount: v.optional(v.number()), // Number of times used
    lastUsedAt: v.optional(v.number()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_provider", ["provider"])
    .index("by_type", ["type"])
    .index("by_isActive", ["isActive"]),
});

