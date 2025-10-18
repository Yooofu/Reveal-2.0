/**
 * AI Tools Update Controller
 * 
 * Manages updating the AI tools database based on:
 * 1. New skills detected (immediate update)
 * 2. Scheduled weekly updates (when no new skills)
 */

import { internalMutation, internalQuery, mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Internal Mutation: Update AI tools database for all user skills
 * This re-runs Exa search to update information about AI tools
 */
export const updateAIToolsDatabase = internalMutation({
  args: {
    userId: v.id("users"),
    reason: v.string(), // "new_skills" or "scheduled_update"
  },
  handler: async (ctx, args) => {
    console.log(`🔄 Starting AI tools database update for user ${args.userId} - Reason: ${args.reason}`);

    try {
      // Get all unique skills for this user
      const userSkills = await ctx.db
        .query("userSkills")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();

      const uniqueSkillIds = new Set(userSkills.map(us => us.skillId));
      const skillsToUpdate: Array<{ id: any; name: string; category: string }> = [];

      // Collect skill details
      for (const skillId of uniqueSkillIds) {
        const skill = await ctx.db.get(skillId);
        if (skill) {
          skillsToUpdate.push({
            id: skill._id,
            name: skill.name,
            category: skill.category,
          });
        }
      }

      console.log(`📊 Found ${skillsToUpdate.length} unique skills to update`);

      // Schedule Exa search for each skill
      for (const skill of skillsToUpdate) {
        await ctx.scheduler.runAfter(
          0,
          internal.actions.exaSearch.curateAIToolsForSkill,
          {
            skillName: skill.name,
            skillCategory: skill.category,
            skillId: skill.id,
          }
        );
      }

      // Update user's last update timestamp
      const now = Date.now();
      const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000; // 7 days

      await ctx.db.patch(args.userId, {
        lastAIToolsUpdate: now,
        nextScheduledUpdate: oneWeekFromNow,
      });

      console.log(`✅ AI tools database update initiated for ${skillsToUpdate.length} skills`);
      console.log(`📅 Next scheduled update: ${new Date(oneWeekFromNow).toISOString()}`);

      return {
        success: true,
        skillsUpdated: skillsToUpdate.length,
        nextUpdate: oneWeekFromNow,
        reason: args.reason,
      };
    } catch (error: any) {
      console.error(`❌ Error updating AI tools database:`, error);
      throw error;
    }
  },
});

/**
 * Internal Mutation: Schedule next AI tools update
 * This is called after skill extraction to determine if immediate or weekly update is needed
 */
export const scheduleAIToolsUpdate = internalMutation({
  args: {
    userId: v.id("users"),
    newSkillsDetected: v.boolean(),
    newSkillCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (args.newSkillsDetected) {
      // New skills detected - trigger immediate update
      console.log(`🆕 ${args.newSkillCount || 0} new skills detected! Triggering immediate AI tools update...`);
      
      await ctx.scheduler.runAfter(
        5000, // Wait 5 seconds to ensure all skills are created
        internal.controllers.aiToolsUpdateController.updateAIToolsDatabase,
        {
          userId: args.userId,
          reason: "new_skills",
        }
      );

      return {
        action: "immediate_update",
        newSkills: args.newSkillCount || 0,
        message: "New skills detected - AI tools database update triggered",
      };
    } else {
      // No new skills - check if weekly update is due
      const now = Date.now();
      const lastUpdate = user.lastAIToolsUpdate || 0;
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const timeSinceLastUpdate = now - lastUpdate;

      if (timeSinceLastUpdate >= oneWeek || !lastUpdate) {
        // Weekly update is due
        console.log(`📅 Weekly update is due. Scheduling AI tools update...`);
        
        await ctx.scheduler.runAfter(
          0,
          internal.controllers.aiToolsUpdateController.updateAIToolsDatabase,
          {
            userId: args.userId,
            reason: "scheduled_update",
          }
        );

        return {
          action: "scheduled_update",
          message: "Weekly update scheduled",
          lastUpdate: lastUpdate || null,
        };
      } else {
        // No update needed yet
        const nextUpdate = user.nextScheduledUpdate || (lastUpdate + oneWeek);
        const timeUntilNext = nextUpdate - now;
        const daysUntilNext = Math.ceil(timeUntilNext / (24 * 60 * 60 * 1000));

        console.log(`⏳ No new skills. Next update in ${daysUntilNext} days`);

        return {
          action: "no_update_needed",
          message: `Next update scheduled in ${daysUntilNext} days`,
          nextUpdate,
        };
      }
    }
  },
});

/**
 * Internal Query: Check if AI tools update is due for a user
 */
export const isUpdateDue = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { isDue: false, reason: "user_not_found" };
    }

    const now = Date.now();
    const lastUpdate = user.lastAIToolsUpdate || 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!lastUpdate) {
      return { isDue: true, reason: "never_updated" };
    }

    const timeSinceLastUpdate = now - lastUpdate;
    if (timeSinceLastUpdate >= oneWeek) {
      return { isDue: true, reason: "weekly_update_due" };
    }

    return {
      isDue: false,
      reason: "not_due_yet",
      nextUpdate: user.nextScheduledUpdate,
      daysUntilNext: Math.ceil((user.nextScheduledUpdate || 0) - now) / (24 * 60 * 60 * 1000),
    };
  },
});

/**
 * Mutation: Manually trigger AI tools update (for admin/testing)
 */
export const manualUpdateAITools = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`🔧 Manual AI tools update triggered for user ${args.userId}`);

    await ctx.scheduler.runAfter(
      0,
      internal.controllers.aiToolsUpdateController.updateAIToolsDatabase,
      {
        userId: args.userId,
        reason: "manual_trigger",
      }
    );

    return {
      success: true,
      message: "AI tools update triggered manually",
    };
  },
});

/**
 * Internal Query: Get update statistics for a user
 */
export const getUpdateStats = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    const now = Date.now();
    const lastUpdate = user.lastAIToolsUpdate;
    const nextUpdate = user.nextScheduledUpdate;

    return {
      lastUpdate: lastUpdate || null,
      lastUpdateDate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
      nextUpdate: nextUpdate || null,
      nextUpdateDate: nextUpdate ? new Date(nextUpdate).toISOString() : null,
      daysSinceLastUpdate: lastUpdate ? Math.floor((now - lastUpdate) / (24 * 60 * 60 * 1000)) : null,
      daysUntilNextUpdate: nextUpdate ? Math.ceil((nextUpdate - now) / (24 * 60 * 60 * 1000)) : null,
    };
  },
});

