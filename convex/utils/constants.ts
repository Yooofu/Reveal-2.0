/**
 * Application Constants
 */

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ["pdf", "doc", "docx"];

// AI Analysis
export const MIN_CONFIDENCE_THRESHOLD = 0.5; // Minimum confidence to include a skill
export const MAX_SKILLS_PER_ANALYSIS = 50; // Maximum skills to extract

// Skill icons mapping
export const SKILL_ICONS: Record<string, string> = {
  // Programming
  python: "💻",
  javascript: "💻",
  typescript: "💻",
  react: "⚛️",
  nodejs: "🟢",
  // Design
  design: "🎨",
  figma: "🎨",
  photoshop: "🎨",
  // Management
  management: "🎯",
  leadership: "👔",
  // Marketing
  marketing: "📈",
  seo: "🔍",
  // Writing
  writing: "📝",
  documentation: "📄",
  // Data
  "data science": "📊",
  analytics: "📉",
  // Soft skills
  communication: "💬",
  "problem solving": "💡",
  // Default
  default: "⭐",
};

// Risk level colors (matching frontend)
export const RISK_COLORS = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#22c55e",
} as const;

// Default skill categories
export const SKILL_CATEGORIES = [
  "programming",
  "design",
  "management",
  "marketing",
  "writing",
  "data_science",
  "soft_skills",
  "other",
] as const;

