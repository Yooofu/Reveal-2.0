/**
 * Skills Model
 * 
 * Handles skill data and categorization logic.
 */

import { Doc } from "../_generated/dataModel";

export type Skill = Doc<"skills">;
export type UserSkill = Doc<"userSkills">;

/**
 * AI Replacement Risk Levels
 */
export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

/**
 * Skill Categories
 */
export enum SkillCategory {
  PROGRAMMING = "programming",
  DESIGN = "design",
  MANAGEMENT = "management",
  MARKETING = "marketing",
  WRITING = "writing",
  DATA_SCIENCE = "data_science",
  SOFT_SKILLS = "soft_skills",
  OTHER = "other",
}

/**
 * Convert risk score (0-100) to risk level
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return RiskLevel.HIGH;
  if (score >= 40) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

/**
 * Get color for risk level (for UI)
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case RiskLevel.HIGH:
      return "#ef4444"; // red
    case RiskLevel.MEDIUM:
      return "#eab308"; // yellow
    case RiskLevel.LOW:
      return "#22c55e"; // green
  }
}

/**
 * Calculate position for radial skill map
 */
export function calculateRadialPosition(
  index: number,
  total: number,
  radius: number
): { x: number; y: number } {
  const angle = (index / total) * 2 * Math.PI;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

