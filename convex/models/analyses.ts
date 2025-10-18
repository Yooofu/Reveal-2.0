/**
 * Analyses Model
 * 
 * Handles analysis results and recommendations.
 */

import { Doc } from "../_generated/dataModel";
import { RiskLevel } from "./skills";

export type Analysis = Doc<"analyses">;

/**
 * Analysis status
 */
export enum AnalysisStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Overall assessment based on all skills
 */
export interface OverallAssessment {
  averageRiskScore: number;
  riskLevel: RiskLevel;
  highRiskSkillCount: number;
  mediumRiskSkillCount: number;
  lowRiskSkillCount: number;
  totalSkills: number;
}

/**
 * Calculate overall assessment from user skills
 */
export function calculateOverallAssessment(
  skills: Array<{ riskScore: number }>
): OverallAssessment {
  const total = skills.length;
  if (total === 0) {
    return {
      averageRiskScore: 0,
      riskLevel: RiskLevel.LOW,
      highRiskSkillCount: 0,
      mediumRiskSkillCount: 0,
      lowRiskSkillCount: 0,
      totalSkills: 0,
    };
  }

  const sum = skills.reduce((acc, skill) => acc + skill.riskScore, 0);
  const avg = sum / total;

  const highCount = skills.filter((s) => s.riskScore >= 70).length;
  const mediumCount = skills.filter(
    (s) => s.riskScore >= 40 && s.riskScore < 70
  ).length;
  const lowCount = skills.filter((s) => s.riskScore < 40).length;

  let riskLevel: RiskLevel;
  if (avg >= 70) riskLevel = RiskLevel.HIGH;
  else if (avg >= 40) riskLevel = RiskLevel.MEDIUM;
  else riskLevel = RiskLevel.LOW;

  return {
    averageRiskScore: Math.round(avg),
    riskLevel,
    highRiskSkillCount: highCount,
    mediumRiskSkillCount: mediumCount,
    lowRiskSkillCount: lowCount,
    totalSkills: total,
  };
}

