"use node";

/**
 * Exa Search Action
 * 
 * Integrates with Exa search API for:
 * 1. Finding AI tools that can perform specific skills
 * 2. Market research and skill demand analysis
 * 3. Curating learning resources
 * 4. Generating skill descriptions and emojis
 */

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Internal Action: Curate AI tools for a new skill using Exa
 * 
 * This is called when a new skill is discovered during resume analysis.
 * It uses Exa to search for AI tools that can perform this skill.
 */
export const curateAIToolsForSkill = internalAction({
  args: {
    skillName: v.string(),
    skillCategory: v.string(),
    skillId: v.id("skills"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      console.log(`Exa API key not configured, skipping AI tool curation for ${args.skillName}`);
      return {
        success: false,
        message: "Exa API key not configured",
        aiTools: [],
      };
    }

    console.log(`🔍 Curating AI tools for new skill: ${args.skillName}`);

    try {
      // Search for AI tools that can perform this skill
      const searchQuery = `AI tools that can automate or assist with ${args.skillName} ${args.skillCategory} tasks`;
      
      const exaResponse = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          query: searchQuery,
          type: "neural",
          useAutoprompt: true,
          numResults: 5,
          contents: {
            text: true,
            highlights: true,
          },
        }),
      });

      if (!exaResponse.ok) {
        throw new Error(`Exa API error: ${exaResponse.statusText}`);
      }

      const exaData: any = await exaResponse.json();
      const aiTools: any[] = [];

      // Process search results and extract AI tool information
      for (const result of exaData.results || []) {
        const tool = {
          name: extractToolName(result.title, args.skillName),
          url: result.url,
          description: result.text?.substring(0, 300) || result.title,
          source: "exa",
          relevanceScore: result.score || 0.5,
          relatedSkill: args.skillName,
        };
        aiTools.push(tool);
      }

      // Store AI tools in database
      for (const tool of aiTools) {
        await ctx.runAction(internal.actions.exaSearch.storeAIToolForSkill, {
          skillId: args.skillId,
          skillName: args.skillName,
          toolName: tool.name,
          toolUrl: tool.url,
          description: tool.description,
          relevanceScore: tool.relevanceScore,
        });
      }

      console.log(`✅ Found and stored ${aiTools.length} AI tools for ${args.skillName}`);

      return {
        success: true,
        aiTools,
        count: aiTools.length,
      };

    } catch (error: any) {
      console.error(`Error curating AI tools for ${args.skillName}:`, error);
      return {
        success: false,
        error: error.message,
        aiTools: [],
      };
    }
  },
});

/**
 * Internal Mutation: Store AI tool information for a skill
 */
export const storeAIToolForSkill = internalAction({
  args: {
    skillId: v.id("skills"),
    skillName: v.string(),
    toolName: v.string(),
    toolUrl: v.string(),
    description: v.string(),
    relevanceScore: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if this AI tool already exists
    const existingTool = await ctx.runQuery(internal.controllers.aiToolController.getAIToolByName, {
      name: args.toolName,
    });

    let toolId: any;

    if (existingTool) {
      toolId = existingTool._id;
    } else {
      // Create new AI tool
      toolId = await ctx.runMutation(internal.controllers.aiToolController.createAITool, {
        name: args.toolName,
        provider: "various",
        type: "tool",
        description: args.description,
        capabilities: [args.skillName],
        mcpToolName: args.toolName.toLowerCase().replace(/\s+/g, "_"),
        homepageUrl: args.toolUrl,
        isActive: true,
      });
    }

    // Link the tool to the skill (logged for now)
    console.log(`Linked tool ${toolId} to skill ${args.skillId} (relevance: ${args.relevanceScore})`);

    return toolId;
  },
});

/**
 * Internal Query: Find AI tool by name
 */
export const findAIToolByName = internalAction({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const tools: any = await ctx.runQuery(internal.controllers.aiToolController.getAIToolByName, {
      name: args.name,
    });
    return tools;
  },
});

/**
 * Internal Mutation: Create AI tool
 */
export const createAITool = internalAction({
  args: {
    name: v.string(),
    provider: v.string(),
    type: v.string(),
    description: v.string(),
    capabilities: v.array(v.string()),
    mcpToolName: v.string(),
    homepageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runMutation(internal.controllers.aiToolController.createAITool, args);
  },
});

/**
 * Internal Mutation: Link tool to skill
 */
export const linkToolToSkill = internalAction({
  args: {
    skillId: v.id("skills"),
    toolId: v.id("aiTools"),
    relevanceScore: v.number(),
  },
  handler: async (ctx, args) => {
    // This could be stored in a junction table or as an array in the skill
    // For now, we'll update the skill's metadata
    // You might want to create a separate skillTools table for this
    console.log(`Linked tool ${args.toolId} to skill ${args.skillId} (relevance: ${args.relevanceScore})`);
  },
});

/**
 * Action: Search for skill market demand using Exa
 */
export const searchSkillMarketDemand = action({
  args: {
    skillName: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      return {
        skillName: args.skillName,
        demandLevel: "unknown",
        message: "Exa API key not configured",
      };
    }

    console.log(`Searching market demand for skill: ${args.skillName}`);

    try {
      const exaResponse = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          query: `${args.skillName} job market demand trends salary 2025`,
          type: "neural",
          useAutoprompt: true,
          numResults: 10,
          contents: {
            text: true,
          },
        }),
      });

      if (!exaResponse.ok) {
        throw new Error(`Exa API error: ${exaResponse.statusText}`);
      }

      const data: any = await exaResponse.json();

      // Analyze results to determine demand level
      const demandLevel = analyzeDemandLevel(data.results);

      return {
        skillName: args.skillName,
        demandLevel,
        resultsCount: data.results?.length || 0,
        sources: data.results?.slice(0, 3).map((r: any) => ({
          title: r.title,
          url: r.url,
        })) || [],
      };

    } catch (error: any) {
      console.error("Exa search error:", error);
      return {
        skillName: args.skillName,
        demandLevel: "unknown",
        error: error.message,
      };
    }
  },
});

/**
 * Action: Generate emoji and enhanced description for new skill
 */
export const generateSkillMetadata = action({
  args: {
    skillName: v.string(),
    skillCategory: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.EXA_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    if (!openAIKey) {
      // Return defaults if no API key
      return {
        emoji: getCategoryEmoji(args.skillCategory),
        description: `${args.skillName} is a ${args.skillCategory} skill.`,
        aliases: [],
      };
    }

    console.log(`🎨 Generating metadata for skill: ${args.skillName}`);

    try {
      // Use OpenAI to generate emoji and description
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey: openAIKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates skill metadata. Always return valid JSON."
          },
          {
            role: "user",
            content: `Generate metadata for this skill:

Skill Name: ${args.skillName}
Category: ${args.skillCategory}

Return JSON with:
{
  "emoji": "single emoji that best represents this skill",
  "description": "concise 1-2 sentence description",
  "aliases": ["alternative name 1", "alternative name 2"]
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

      return {
        emoji: result.emoji || getCategoryEmoji(args.skillCategory),
        description: result.description || `${args.skillName} is a ${args.skillCategory} skill.`,
        aliases: result.aliases || [],
      };

    } catch (error: any) {
      console.error("Error generating skill metadata:", error);
      return {
        emoji: getCategoryEmoji(args.skillCategory),
        description: `${args.skillName} is a ${args.skillCategory} skill.`,
        aliases: [],
      };
    }
  },
});

/**
 * Action: Search for learning resources using Exa
 */
export const searchSkillResources = action({
  args: {
    skillName: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      return {
        skillName: args.skillName,
        resources: [],
        message: "Exa API key not configured",
      };
    }

    console.log(`Searching learning resources for: ${args.skillName}`);

    try {
      const exaResponse = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          query: `best courses tutorials documentation to learn ${args.skillName}`,
          type: "neural",
          useAutoprompt: true,
          numResults: 5,
          contents: {
            text: true,
          },
        }),
      });

      if (!exaResponse.ok) {
        throw new Error(`Exa API error: ${exaResponse.statusText}`);
      }

      const data: any = await exaResponse.json();

      const resources = data.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        description: r.text?.substring(0, 200),
        score: r.score,
      })) || [];

      return {
        skillName: args.skillName,
        resources,
        count: resources.length,
      };

    } catch (error: any) {
      console.error("Exa resource search error:", error);
      return {
        skillName: args.skillName,
        resources: [],
        error: error.message,
      };
    }
  },
});

/**
 * Helper: Extract tool name from title
 */
function extractToolName(title: string, skillName: string): string {
  // Simple extraction - take first few words
  const words = title.split(/[\s-:,]/);
  const name = words.slice(0, 3).join(" ");
  return name || `AI Tool for ${skillName}`;
}

/**
 * Helper: Analyze demand level from Exa results
 */
function analyzeDemandLevel(results: any[]): string {
  if (!results || results.length === 0) return "low";
  if (results.length >= 8) return "high";
  if (results.length >= 5) return "medium";
  return "low";
}

/**
 * Helper: Get category emoji
 */
function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    programming: "💻",
    design: "🎨",
    management: "📊",
    communication: "💬",
    technical: "🔧",
    creative: "✨",
    analytical: "📈",
    other: "🔹",
  };
  return emojiMap[category.toLowerCase()] || "🔹";
}

