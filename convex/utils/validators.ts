/**
 * Validation Utilities
 */

import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "./constants";

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  fileName: string,
  fileSize: number
): { valid: boolean; error?: string } {
  // Check file extension
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_FILE_TYPES.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
    };
  }

  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validate skill name
 */
export function isValidSkillName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

/**
 * Validate risk score
 */
export function isValidRiskScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

