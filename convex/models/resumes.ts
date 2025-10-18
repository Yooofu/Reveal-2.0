/**
 * Resume Model
 * 
 * Handles resume data and parsing logic.
 */

import { Doc } from "../_generated/dataModel";

export type Resume = Doc<"resumes">;

/**
 * Resume processing status
 */
export enum ResumeStatus {
  UPLOADED = "uploaded",
  PARSING = "parsing",
  PARSED = "parsed",
  ANALYZING = "analyzing",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Get resume file extension
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Validate file type
 */
export function isValidResumeFile(fileName: string): boolean {
  const validExtensions = ["pdf", "doc", "docx"];
  const ext = getFileExtension(fileName);
  return validExtensions.includes(ext);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

