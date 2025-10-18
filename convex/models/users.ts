/**
 * User Model
 * 
 * Handles user data and business logic related to user operations.
 * This is where we define user-related helper functions and validation.
 * 
 * Note: Authentication has been removed. Users are anonymous.
 */

import { Doc } from "../_generated/dataModel";

// User type alias for convenience
export type User = Doc<"users">;

/**
 * Get user display name
 */
export function getUserDisplayName(user: User): string {
  return user.name || user.email?.split("@")[0] || "Anonymous User";
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(user: User): boolean {
  return user.hasUploadedResume || false;
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

