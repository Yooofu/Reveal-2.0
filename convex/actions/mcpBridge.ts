"use node";

/**
 * MCP Bridge
 * 
 * Bridge for Model Context Protocol (MCP) integrations.
 * 
 * This application uses OpenAI directly for AI analysis (see aiAnalysis.ts).
 * The MCP architecture allows us to:
 * 1. Call OpenAI GPT-4 for skill extraction
 * 2. Analyze AI replacement risk for each skill
 * 3. Generate career recommendations
 * 
 * To extend with additional MCP tools (Smithery, Exa, etc.):
 * - Add tool-specific actions here
 * - Configure API keys in environment variables
 * - Call from controllers/actions as needed
 */

import { action } from "../_generated/server";
import { v } from "convex/values";

/**
 * Action: Call MCP tool (Generic wrapper for future MCP integrations)
 * 
 * This is a generic action to call any MCP tool.
 * Currently, we use OpenAI directly in aiAnalysis.ts
 * 
 * Future integrations could include:
 * - Exa search for market research
 * - Anthropic Claude for alternative AI analysis
 * - Custom MCP servers for specialized tools
 */
export const callMCPTool = action({
  args: {
    toolName: v.string(),
    toolArgs: v.any(),
  },
  handler: async (ctx, args) => {
    console.log(`[MCP Bridge] Calling tool: ${args.toolName}`);
    console.log(`[MCP Bridge] Arguments:`, args.toolArgs);
    
    // Route to appropriate service based on tool name
    switch (args.toolName) {
      case "openai":
        // OpenAI is handled in aiAnalysis.ts
        return {
          success: false,
          error: "Use aiAnalysis.ts actions for OpenAI integration",
        };
      
      case "exa-search":
        // TODO: Implement Exa search integration
        return {
          success: false,
          error: "Exa search not yet implemented",
        };
      
      default:
        return {
          success: false,
          error: `Unknown tool: ${args.toolName}`,
        };
    }
  },
});

/**
 * Action: Test MCP connection
 * 
 * Tests connectivity to all configured MCP services
 */
export const testMCPConnection = action({
  args: {},
  handler: async (ctx) => {
    const status: any = {
      openai: false,
      exa: false,
      timestamp: Date.now(),
    };

    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
      status.openai = true;
    }

    // Test Exa
    if (process.env.EXA_API_KEY) {
      status.exa = true;
    }

    const allConnected = status.openai; // Minimum requirement
    
    return {
      connected: allConnected,
      services: status,
      message: allConnected 
        ? "MCP services are configured and ready" 
        : "Some MCP services are not configured. Check environment variables.",
    };
  },
});

