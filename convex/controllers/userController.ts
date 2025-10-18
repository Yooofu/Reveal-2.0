/**
 * User Controller
 * 
 * Handles user-related queries and mutations.
 * These are Convex functions that the frontend will call directly.
 * 
 * Note: Authentication removed - users are optional and created on-demand
 */

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Mutation: Create a new anonymous user
 * Called when someone uploads their first resume
 */
export const createAnonymousUser = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Create new anonymous user
    const userId = await ctx.db.insert("users", {
      hasUploadedResume: false,
      createdAt: now,
      lastActive: now,
      status: "active",
    });
    
    return userId;
  },
});

/**
 * Query: Get user by ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Mutation: Update user activity timestamp
 */
export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActive: Date.now(),
    });
  },
});

