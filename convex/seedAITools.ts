/**
 * Seed AI Tools
 * 
 * Populate the aiTools table with common MCP tools you'll be using.
 * Run this once to initialize your AI tools catalog.
 */

import { mutation } from "./_generated/server";

/**
 * Seed common AI tools for Reveal 2.0
 * 
 * Usage: Call this mutation once from your Convex dashboard or frontend
 */
export const seedAITools = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if tools already exist
    const existingTools = await ctx.db.query("aiTools").collect();
    if (existingTools.length > 0) {
      return {
        success: false,
        message: "AI tools already seeded. Delete existing tools first if you want to re-seed.",
        count: existingTools.length,
      };
    }

    // Define AI tools to seed
    const aiTools = [
      // OpenAI GPT-4
      {
        name: "gpt-4",
        provider: "openai",
        type: "llm",
        description: "Advanced language model for skill extraction and risk assessment",
        capabilities: ["skill_extraction", "risk_assessment", "text_analysis", "reasoning"],
        mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
        mcpToolName: "openai_chat",
        documentationUrl: "https://platform.openai.com/docs/models/gpt-4",
        homepageUrl: "https://openai.com",
        version: "gpt-4-turbo-preview",
        maxTokens: 128000,
        costPerRequest: 0.01,
        isActive: true,
        usageCount: 0,
        createdAt: now,
      },

      // Anthropic Claude
      {
        name: "claude-3-opus",
        provider: "anthropic",
        type: "llm",
        description: "Most capable Claude model for complex analysis and reasoning",
        capabilities: ["skill_extraction", "risk_assessment", "detailed_analysis", "reasoning"],
        mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
        mcpToolName: "anthropic_chat",
        documentationUrl: "https://docs.anthropic.com/claude/docs",
        homepageUrl: "https://anthropic.com",
        version: "claude-3-opus-20240229",
        maxTokens: 200000,
        costPerRequest: 0.015,
        isActive: false, // Set to true when you want to use Claude
        usageCount: 0,
        createdAt: now,
      },

      // Exa Search
      {
        name: "exa-search",
        provider: "exa",
        type: "search",
        description: "AI-powered search engine for market research and skill demand analysis",
        capabilities: ["market_research", "skill_demand", "trend_analysis", "job_search"],
        mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
        mcpToolName: "exa_search",
        documentationUrl: "https://docs.exa.ai",
        homepageUrl: "https://exa.ai",
        version: "v1",
        costPerRequest: 0.005,
        isActive: true,
        usageCount: 0,
        createdAt: now,
      },

      // Exa Contents
      {
        name: "exa-contents",
        provider: "exa",
        type: "search",
        description: "Retrieve full content from Exa search results for detailed analysis",
        capabilities: ["content_retrieval", "web_scraping", "data_extraction"],
        mcpServerUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
        mcpToolName: "exa_contents",
        documentationUrl: "https://docs.exa.ai/reference/contents",
        homepageUrl: "https://exa.ai",
        version: "v1",
        costPerRequest: 0.002,
        isActive: true,
        usageCount: 0,
        createdAt: now,
      },
    ];

    // Insert all tools
    const insertedIds = [];
    for (const tool of aiTools) {
      const id = await ctx.db.insert("aiTools", tool);
      insertedIds.push(id);
    }

    return {
      success: true,
      message: `Successfully seeded ${aiTools.length} AI tools`,
      count: aiTools.length,
      tools: aiTools.map((t) => t.name),
      insertedIds,
    };
  },
});

/**
 * Get all active AI tools
 */
export const getActiveAITools = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("aiTools")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

