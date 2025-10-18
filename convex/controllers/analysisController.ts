/**
 * Analysis Controller
 * 
 * Handles skill analysis results and AI insights
 */

import { query, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Query: Get analysis by resume ID with skills
 * Returns analysis and extracted skills for a specific resume
 */
export const getAnalysisWithSkills = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    // Get the analysis for this specific resume
    const analysis = await ctx.db
      .query("analyses")
      .filter((q) => q.eq(q.field("resumeId"), args.resumeId))
      .order("desc")
      .first();

    if (!analysis) {
      return null;
    }

    // Get all user skills linked to this resume
    const userSkills = await ctx.db
      .query("userSkills")
      .filter((q) => q.eq(q.field("resumeId"), args.resumeId))
      .collect();

    // Fetch skill details for each userSkill
    const skillsWithDetails = await Promise.all(
      userSkills.map(async (userSkill) => {
        const skill = await ctx.db.get(userSkill.skillId);
        return {
          ...skill,
          ...userSkill, // Include all userSkill fields (riskScore, riskLevel, etc.)
          source: userSkill.source,
        };
      })
    );

    return {
      analysis,
      skills: skillsWithDetails,
    };
  },
});

/**
 * Query: Get analysis by resume ID
 */
export const getAnalysisByResumeId = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db
      .query("analyses")
      .filter((q) => q.eq(q.field("resumeId"), args.resumeId))
      .first();

    if (!analysis) {
      return null;
    }

    // Get all user skills linked to this resume
    const userSkills = await ctx.db
      .query("userSkills")
      .filter((q) => q.eq(q.field("resumeId"), args.resumeId))
      .collect();

    // Fetch skill details
    const skillsWithDetails = await Promise.all(
      userSkills.map(async (userSkill) => {
        const skill = await ctx.db.get(userSkill.skillId);
        return {
          ...skill,
          ...userSkill, // Include all userSkill fields (riskScore, riskLevel, etc.)
          source: userSkill.source,
        };
      })
    );

    return {
      analysis,
      skills: skillsWithDetails,
    };
  },
});

/**
 * Internal Mutation: Create analysis record
 * Called by AI analysis action after skill extraction
 */
export const createAnalysis = internalMutation({
  args: {
    userId: v.id("users"),
    resumeId: v.id("resumes"),
    averageRiskScore: v.number(),
    overallRiskLevel: v.string(),
    totalSkills: v.number(),
    highRiskCount: v.number(),
    mediumRiskCount: v.number(),
    lowRiskCount: v.number(),
    recommendations: v.array(v.string()),
    safeSkills: v.array(v.string()),
    atRiskSkills: v.array(v.string()),
    defendStrategies: v.optional(v.array(v.string())),
    augmentStrategies: v.optional(v.array(v.string())),
    pivotStrategies: v.optional(v.array(v.string())),
    aiModelVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const analysisId = await ctx.db.insert("analyses", {
      userId: args.userId,
      resumeId: args.resumeId,
      averageRiskScore: args.averageRiskScore,
      overallRiskLevel: args.overallRiskLevel,
      totalSkills: args.totalSkills,
      highRiskCount: args.highRiskCount,
      mediumRiskCount: args.mediumRiskCount,
      lowRiskCount: args.lowRiskCount,
      recommendations: args.recommendations,
      safeSkills: args.safeSkills,
      atRiskSkills: args.atRiskSkills,
      defendStrategies: args.defendStrategies,
      augmentStrategies: args.augmentStrategies,
      pivotStrategies: args.pivotStrategies,
      analyzedAt: Date.now(),
      status: "completed",
    });

    return analysisId;
  },
});
