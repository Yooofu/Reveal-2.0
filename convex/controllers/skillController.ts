/**
 * Skill Controller
 * 
 * Handles skill catalog and user skill management.
 */

import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Query: Get all skills from catalog
 */
export const getAllSkills = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category !== undefined) {
      return await ctx.db
        .query("skills")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    
    return await ctx.db.query("skills").collect();
  },
});

/**
 * Query: Get user's skills with risk analysis
 */
export const getUserSkills = query({
  args: {
    userId: v.optional(v.id("users")),
    resumeId: v.optional(v.id("resumes")),
  },
  handler: async (ctx, args) => {
    if (args.resumeId !== undefined) {
      return await ctx.db
        .query("userSkills")
        .withIndex("by_resumeId", (q) => q.eq("resumeId", args.resumeId!))
        .collect();
    }

    if (args.userId !== undefined) {
      return await ctx.db
        .query("userSkills")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
        .collect();
    }

    return [];
  },
});

/**
 * Query: Get skills by category
 */
export const getSkillsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

/**
 * Query: Get skills by risk level
 */
export const getSkillsByRiskLevel = query({
  args: {
    userId: v.id("users"),
    riskLevel: v.string(), // "low", "medium", "high"
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userSkills")
      .withIndex("by_userId_riskLevel", (q) => 
        q.eq("userId", args.userId).eq("riskLevel", args.riskLevel)
      )
      .collect();
  },
});

/**
 * Query: Search skills by name
 */
export const searchSkills = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("skills")
      .withSearchIndex("search_skills", (q) => q.search("name", args.searchTerm))
      .take(20);

    return results;
  },
});

/**
 * Query: Get skill details by ID
 */
export const getSkillById = query({
  args: { skillId: v.id("skills") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.skillId);
  },
});

/**
 * Internal Query: Get skill by normalized name
 */
export const getSkillByNormalizedName = internalQuery({
  args: { normalizedName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("normalizedName", args.normalizedName))
      .first();
  },
});

/**
 * Internal Mutation: Find or create skill in master catalog
 * 
 * If skill is new, it will trigger Exa to curate AI tools for it
 */
export const findOrCreateSkill = internalMutation({
  args: {
    skillName: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.skillName.toLowerCase().trim();

    // Try to find existing skill
    const existingSkill = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("normalizedName", normalizedName))
      .first();

    if (existingSkill) {
      // Skill exists, return its ID
      return existingSkill._id;
    }

    // ✨ NEW SKILL DETECTED! ✨
    console.log(`🆕 New skill discovered: ${args.skillName} (${args.category})`);

    // Create new skill with default icon
    const icon = getCategoryIcon(args.category);
    
    const skillId = await ctx.db.insert("skills", {
      name: args.skillName,
      normalizedName,
      category: args.category,
      icon,
    });

    // 🔍 Trigger Exa curation for this new skill asynchronously
    // This will search for AI tools that can perform this skill
    await ctx.scheduler.runAfter(0, internal.actions.exaSearch.curateAIToolsForSkill, {
      skillName: args.skillName,
      skillCategory: args.category,
      skillId,
    });

    // 🎨 Also generate enhanced metadata (emoji + description) using AI
    await ctx.scheduler.runAfter(0, internal.controllers.skillController.enhanceSkillMetadata, {
      skillId,
      skillName: args.skillName,
      category: args.category,
    });

    console.log(`✅ Created skill ${args.skillName} and triggered AI tool curation`);

    return skillId;
  },
});

/**
 * Internal Mutation: Enhance skill metadata with AI-generated emoji and description
 */
export const enhanceSkillMetadata = internalMutation({
  args: {
    skillId: v.id("skills"),
    skillName: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // This will be called asynchronously after skill creation
    // For now, just use default values
    // In a future enhancement, we can call an AI service to generate better metadata
    
    console.log(`🎨 Enhanced metadata for skill: ${args.skillName}`);
    
    // Could call OpenAI/Exa here to generate:
    // - Better emoji representation
    // - Detailed description
    // - Related skills
    // - Skill aliases
    
    // For now, the skill already has the basic icon from getCategoryIcon
  },
});

/**
 * Internal Mutation: Create user skill record
 */
export const createUserSkill = internalMutation({
  args: {
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    skillId: v.id("skills"),
    skillName: v.string(),
    category: v.string(),
    riskScore: v.number(),
    riskLevel: v.string(),
    confidence: v.number(),
    defendStrategies: v.optional(v.array(v.string())),
    augmentStrategies: v.optional(v.array(v.string())),
    pivotStrategies: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const icon = getCategoryIcon(args.category);

    const userSkillId = await ctx.db.insert("userSkills", {
      userId: args.userId,
      resumeId: args.resumeId,
      skillId: args.skillId,
      skillName: args.skillName,
      category: args.category,
      icon,
      riskScore: args.riskScore,
      riskLevel: args.riskLevel,
      confidence: args.confidence,
      defendStrategies: args.defendStrategies,
      augmentStrategies: args.augmentStrategies,
      pivotStrategies: args.pivotStrategies,
      extractedAt: Date.now(),
      source: "resume",
    });

    return userSkillId;
  },
});

/**
 * Mutation: Manually add skill to user profile
 */
export const addManualSkill = mutation({
  args: {
    userId: v.id("users"),
    skillName: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // Find or create skill
    const normalizedName = args.skillName.toLowerCase().trim();
    let skill = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("normalizedName", normalizedName))
      .first();

    if (!skill) {
      const icon = getCategoryIcon(args.category);
      const skillId = await ctx.db.insert("skills", {
        name: args.skillName,
        normalizedName,
        category: args.category,
        icon,
      });
      skill = await ctx.db.get(skillId);
    }

    if (!skill) {
      throw new Error("Failed to create skill");
    }

    // Get user's most recent resume
    const latestResume = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (!latestResume) {
      throw new Error("Please upload a resume first");
    }

    // Create user skill with default risk score
    const icon = getCategoryIcon(args.category);
    
    const userSkillId = await ctx.db.insert("userSkills", {
      userId: args.userId,
      resumeId: latestResume._id,
      skillId: skill._id,
      skillName: args.skillName,
      category: args.category,
      icon,
      riskScore: 50, // Default, can be updated via AI
      riskLevel: "medium",
      confidence: 0.5,
      extractedAt: Date.now(),
      source: "manual",
    });

    return userSkillId;
  },
});

/**
 * Helper: Get emoji icon for skill category
 */
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    programming: "💻",
    design: "🎨",
    management: "📊",
    communication: "💬",
    technical: "🔧",
    creative: "✨",
    analytical: "📈",
    other: "🔹",
  };

  return iconMap[category.toLowerCase()] || "🔹";
}

