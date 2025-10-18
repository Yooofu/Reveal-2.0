/**
 * Clear Test Data Script
 * Run this to clear all test/mock data from the database
 */

import { internalMutation } from "./_generated/server";

export const clearAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all user skills
    const userSkills = await ctx.db.query("userSkills").collect();
    for (const skill of userSkills) {
      await ctx.db.delete(skill._id);
    }
    
    // Delete all analyses
    const analyses = await ctx.db.query("analyses").collect();
    for (const analysis of analyses) {
      await ctx.db.delete(analysis._id);
    }
    
    // Delete all resumes
    const resumes = await ctx.db.query("resumes").collect();
    for (const resume of resumes) {
      await ctx.db.delete(resume._id);
    }
    
    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    
    console.log("✅ All test data cleared successfully!");
    
    return {
      success: true,
      cleared: {
        userSkills: userSkills.length,
        analyses: analyses.length,
        resumes: resumes.length,
        users: users.length,
      }
    };
  },
});

