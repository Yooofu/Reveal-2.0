/**
 * AI Tool Controller
 * 
 * Manages the AI Tools database - tracking which AI tools can perform which skills.
 * This is populated via Exa search when new skills are discovered.
 */

import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Query: Get all AI tools
 */
export const getAllAITools = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.isActive !== undefined) {
      return await ctx.db
        .query("aiTools")
        .withIndex("by_isActive", (q) => q.eq("isActive", args.isActive!))
        .collect();
    }
    
    return await ctx.db.query("aiTools").collect();
  },
});

/**
 * Query: Get AI tools by type
 */
export const getAIToolsByType = query({
  args: {
    type: v.string(), // "llm", "search", "tool", "analysis"
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiTools")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

/**
 * Query: Get AI tools by provider
 */
export const getAIToolsByProvider = query({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiTools")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .collect();
  },
});

/**
 * Internal Query: Get AI tool by name
 */
export const getAIToolByName = internalQuery({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiTools")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

/**
 * Internal Mutation: Create new AI tool
 */
export const createAITool = internalMutation({
  args: {
    name: v.string(),
    provider: v.string(),
    type: v.string(),
    description: v.string(),
    capabilities: v.array(v.string()),
    mcpToolName: v.string(),
    documentationUrl: v.optional(v.string()),
    homepageUrl: v.optional(v.string()),
    version: v.optional(v.string()),
    maxTokens: v.optional(v.number()),
    costPerRequest: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const toolId = await ctx.db.insert("aiTools", {
      name: args.name,
      provider: args.provider,
      type: args.type,
      description: args.description,
      capabilities: args.capabilities,
      mcpToolName: args.mcpToolName,
      documentationUrl: args.documentationUrl,
      homepageUrl: args.homepageUrl,
      version: args.version,
      maxTokens: args.maxTokens,
      costPerRequest: args.costPerRequest,
      isActive: args.isActive,
      usageCount: 0,
      createdAt: now,
    });

    return toolId;
  },
});

/**
 * Internal Mutation: Update AI tool usage
 */
export const incrementToolUsage = internalMutation({
  args: {
    toolId: v.id("aiTools"),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return;

    await ctx.db.patch(args.toolId, {
      usageCount: (tool.usageCount || 0) + 1,
      lastUsedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mutation: Update AI tool status
 */
export const updateAIToolStatus = mutation({
  args: {
    toolId: v.id("aiTools"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.toolId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Query: Get AI tools for a specific skill
 * 
 * Returns AI tools that can perform or assist with this skill
 */
export const getAIToolsForSkill = query({
  args: {
    skillId: v.id("skills"),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    if (!skill) return [];

    // Optimized: Only fetch active tools, with limit
    const allTools = await ctx.db
      .query("aiTools")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .take(100); // Limit to avoid fetching thousands
    
    // Filter tools that can perform this skill
    const relevantTools = allTools.filter(tool => {
      if (!tool.capabilities || tool.capabilities.length === 0) {
        return false;
      }
      
      const skillNameLower = skill.name.toLowerCase();
      const skillWords = skillNameLower.split(/\s+/);
      
      return tool.capabilities.some(cap => {
        const capLower = cap.toLowerCase();
        // Check for exact matches or partial matches
        return capLower.includes(skillNameLower) ||
               skillNameLower.includes(capLower) ||
               skillWords.some(word => word.length > 3 && capLower.includes(word));
      });
    });

    // Sort by relevance (tools with more matching capabilities first)
    relevantTools.sort((a, b) => {
      const aMatches = a.capabilities?.filter(cap =>
        cap.toLowerCase().includes(skill.name.toLowerCase())
      ).length || 0;
      const bMatches = b.capabilities?.filter(cap =>
        cap.toLowerCase().includes(skill.name.toLowerCase())
      ).length || 0;
      return bMatches - aMatches;
    });

    // Return top 10 most relevant tools
    return relevantTools.slice(0, 10);
  },
});

/**
 * Query: Get statistics about AI tools
 */
export const getAIToolStats = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db.query("aiTools").collect();
    
    const stats = {
      total: allTools.length,
      active: allTools.filter(t => t.isActive).length,
      byType: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
      totalUsage: allTools.reduce((sum, t) => sum + (t.usageCount || 0), 0),
    };

    // Count by type
    allTools.forEach(tool => {
      stats.byType[tool.type] = (stats.byType[tool.type] || 0) + 1;
      stats.byProvider[tool.provider] = (stats.byProvider[tool.provider] || 0) + 1;
    });

    return stats;
  },
});
