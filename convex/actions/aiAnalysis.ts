"use node";

/**
 * AI Analysis Action
 * 
 * Handles AI-powered skill extraction and risk analysis using OpenAI.
 * This uses the MCP (Model Context Protocol) architecture.
 */

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Internal Action: Analyze resume and extract skills
 * 
 * This action will:
 * 1. Get resume from database
 * 2. Get file content from storage
 * 3. Extract text from file
 * 4. Call OpenAI to extract skills
 * 5. Calculate risk scores for each skill
 * 6. Store results in database
 */
export const analyzeResume = internalAction({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      console.log(`Starting analysis for resume: ${args.resumeId}`);
      
      // Update status to parsing
      await ctx.runMutation(internal.controllers.resumeController.updateResumeStatus, {
        resumeId: args.resumeId,
        status: "parsing",
      });

      // Get resume from database
      const resume: any = await ctx.runQuery(internal.controllers.resumeController.getResumeByIdInternal, {
        resumeId: args.resumeId,
      });

      if (!resume) {
        throw new Error("Resume not found");
      }

      // Get file from storage
      const fileUrl = await ctx.storage.getUrl(resume.storageId);
      if (!fileUrl) {
        throw new Error("File not found in storage");
      }

      // Download file content
      console.log(`Fetching file from storage: ${resume.fileName}`);
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log(`Downloaded ${arrayBuffer.byteLength} bytes`);
      
      const buffer = Buffer.from(arrayBuffer);

      // Extract text from file
      let extractedText: string;
      
      console.log(`Parsing ${resume.fileType} file: ${resume.fileName}`);
      
      if (resume.fileType === 'pdf') {
        extractedText = await extractTextFromPDF(buffer);
      } else if (resume.fileType === 'docx' || resume.fileType === 'doc') {
        extractedText = await extractTextFromDOCX(buffer);
      } else {
        throw new Error(`Unsupported file type: ${resume.fileType}`);
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No text could be extracted from the file. The file may be empty or corrupted.");
      }
      
      console.log(`Successfully extracted ${extractedText.length} characters from resume`);

      // Update status with parsed text
      await ctx.runMutation(internal.controllers.resumeController.updateResumeStatus, {
        resumeId: args.resumeId,
        status: "analyzing",
        parsedText: extractedText,
      });

      // Extract skills using OpenAI
      const skillsResult: any = await ctx.runAction(internal.actions.aiAnalysis.extractSkillsFromText, {
        text: extractedText,
        resumeId: args.resumeId,
      });

      // Calculate overall analysis metrics
      const totalSkills: number = skillsResult.skills.length;
      const highRiskCount = skillsResult.skills.filter((s: any) => s.riskLevel === 'high').length;
      const mediumRiskCount = skillsResult.skills.filter((s: any) => s.riskLevel === 'medium').length;
      const lowRiskCount = skillsResult.skills.filter((s: any) => s.riskLevel === 'low').length;
      const averageRiskScore: number = totalSkills > 0 
        ? skillsResult.skills.reduce((sum: number, s: any) => sum + s.riskScore, 0) / totalSkills
        : 0;

      let overallRiskLevel = 'low';
      if (averageRiskScore >= 70) overallRiskLevel = 'high';
      else if (averageRiskScore >= 40) overallRiskLevel = 'medium';

      // Create analysis record
      const analysisId: any = await ctx.runMutation(internal.controllers.analysisController.createAnalysis, {
        userId: resume.userId,
        resumeId: args.resumeId,
        averageRiskScore,
        overallRiskLevel,
        totalSkills,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        recommendations: skillsResult.recommendations || [],
        safeSkills: skillsResult.skills.filter((s: any) => s.riskLevel === 'low').map((s: any) => s.skillName),
        atRiskSkills: skillsResult.skills.filter((s: any) => s.riskLevel === 'high').map((s: any) => s.skillName),
        defendStrategies: skillsResult.overallPathways?.defend || [],
        augmentStrategies: skillsResult.overallPathways?.augment || [],
        pivotStrategies: skillsResult.overallPathways?.pivot || [],
        aiModelVersion: 'gpt-4o',
      });

      // Update resume status to completed
      await ctx.runMutation(internal.controllers.resumeController.updateResumeStatus, {
        resumeId: args.resumeId,
        status: "completed",
      });

      // Schedule AI tools database update check
      // The update controller will determine if we need immediate update (new skills)
      // or just wait for weekly refresh based on last update time
      // Note: Individual skills already trigger Exa searches via findOrCreateSkill
      await ctx.scheduler.runAfter(
        5000, // Wait 5 seconds to ensure all skills and Exa searches are initiated
        internal.controllers.aiToolsUpdateController.scheduleAIToolsUpdate,
        {
          userId: resume.userId,
          newSkillsDetected: totalSkills > 0, // If skills extracted, check for updates
          newSkillCount: totalSkills,
        }
      );

      console.log(`Analysis completed for resume: ${args.resumeId}`);
      console.log(`📊 Extracted ${totalSkills} skills, scheduled AI tools update check`);
      
      return {
        success: true,
        analysisId,
        totalSkills,
        averageRiskScore,
      };

    } catch (error: any) {
      console.error(`Analysis failed for resume ${args.resumeId}:`, error);
      
      // Update status to failed
      await ctx.runMutation(internal.controllers.resumeController.updateResumeStatus, {
        resumeId: args.resumeId,
        status: "failed",
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Internal Action: Extract skills from text using OpenAI
 */
export const extractSkillsFromText = internalAction({
  args: {
    text: v.string(),
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Import OpenAI (using require for Node.js runtime)
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey });

    // Get resume details for context
    const resume = await ctx.runQuery(internal.controllers.resumeController.getResumeByIdInternal, {
      resumeId: args.resumeId,
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    console.log("Extracting skills from resume using OpenAI GPT-4o-mini (fast mode)...");

    // Create the prompt for skill extraction with high confidence threshold
    const prompt = `You are an expert career analyst. Analyze this resume and extract skills that the candidate demonstrates or mentions.

Resume Text:
${args.text}

CRITICAL REQUIREMENTS - TARGET 10-15 SKILLS:
- TARGET: Extract 10-15 skills (combination of hard and soft skills) when the resume has sufficient content
- Include BOTH technical skills AND soft skills (leadership, communication, problem-solving, time management, teamwork, adaptability)
- Technical skills: Programming languages, tools, frameworks, databases, methodologies, platforms
- Soft skills: Demonstrated abilities like teamwork, leadership, time management, communication, problem-solving, critical thinking
- Be generous with skill extraction - if a skill is mentioned, implied by job responsibilities, or reasonably demonstrated, INCLUDE IT
- Look at job titles, responsibilities, projects, education - all indicate skills
- Set confidence >= 0.7 for clearly stated skills, 0.5-0.69 for reasonably inferred skills, 0.4-0.49 for implied skills
- However, if the resume is minimal or blank, extract only the skills you can reasonably identify (even if fewer than 10)
- DO NOT fabricate skills that aren't present or reasonably inferable from the resume

Return a JSON object with this structure:
{
  "skills": [
    {
      "skillName": "Name of the skill",
      "category": "programming|design|management|communication|technical|creative|analytical|other",
      "riskScore": <number 0-100, where 100 = highest risk of AI replacement>,
      "riskLevel": "low|medium|high",
      "confidence": <number 0-1, your confidence that the candidate ACTUALLY possesses this skill>,
      "reasoning": "Brief explanation of why this skill has this risk level",
      "pathways": {
        "defend": [
          "Specific defend strategy 1 for THIS skill",
          "Specific defend strategy 2 for THIS skill",
          "Specific defend strategy 3 for THIS skill",
          "Specific defend strategy 4 for THIS skill"
        ],
        "augment": [
          "Specific augment strategy 1 for THIS skill",
          "Specific augment strategy 2 for THIS skill",
          "Specific augment strategy 3 for THIS skill",
          "Specific augment strategy 4 for THIS skill"
        ],
        "pivot": [
          "Specific pivot strategy 1 for THIS skill",
          "Specific pivot strategy 2 for THIS skill",
          "Specific pivot strategy 3 for THIS skill",
          "Specific pivot strategy 4 for THIS skill"
        ]
      }
    }
  ],
  "recommendations": [
    "General actionable recommendation 1",
    "General actionable recommendation 2",
    "General actionable recommendation 3"
  ],
  "overallPathways": {
    "defend": [
      "General defend strategy 1 across all skills",
      "General defend strategy 2 across all skills",
      "General defend strategy 3 across all skills"
    ],
    "augment": [
      "General augment strategy 1 across all skills",
      "General augment strategy 2 across all skills",
      "General augment strategy 3 across all skills"
    ],
    "pivot": [
      "General pivot strategy 1 across all skills",
      "General pivot strategy 2 across all skills",
      "General pivot strategy 3 across all skills"
    ]
  }
}

Guidelines for Confidence Scoring:
- 0.9-1.0: Skill mentioned multiple times with specific examples and years of experience
- 0.7-0.89: Skill clearly mentioned with context or in a project
- 0.5-0.69: Skill mentioned or reasonably demonstrated through job description
- 0.4-0.49: Skill implied by job title, responsibilities, or related experience
- YOU MUST include at least 10-15 skills total, balancing technical and soft skills
- If the resume is short, be MORE generous with skill inference to reach the minimum

Risk Assessment Guidelines:
- Risk levels: low (0-39), medium (40-69), high (70-100)
- Repetitive, data-processing, and routine tasks = higher risk
- Creative, strategic, interpersonal, and complex decision-making = lower risk
- Provide 3-5 general actionable recommendations for career development

AI Augmentation Pathways Guidelines:
Generate 4 HIGHLY PERSONALIZED and DISTINCT strategies FOR EACH SKILL. Each skill should have its OWN unique pathways:

DEFEND Pathway - Double down and specialize in THIS SPECIFIC SKILL:
Focus on making THIS SKILL irreplaceable:
- How to master advanced aspects of THIS SKILL that AI cannot replicate
- Complex scenarios where THIS SKILL requires human expertise
- Interpersonal/creative applications of THIS SKILL
- Edge cases and nuanced situations for THIS SKILL
Example for Python: "Master Python performance optimization and system architecture that requires years of debugging experience"
Example for Leadership: "Develop advanced conflict resolution and emotional intelligence in high-stakes leadership situations"

AUGMENT Pathway - Use AI to amplify THIS SPECIFIC SKILL:
Focus on AI tools that enhance THIS EXACT SKILL:
- Name specific AI tools that can enhance THIS SKILL (e.g., GitHub Copilot for coding, Midjourney for design)
- How to automate repetitive parts of THIS SKILL
- Prompt engineering techniques for THIS SKILL domain
- Workflow combining THIS SKILL with AI capabilities
Example for Python: "Use GitHub Copilot + Cursor for boilerplate code while focusing on architecture and optimization"
Example for Writing: "Use Claude/ChatGPT for first drafts and research, focus your expertise on editing and strategic messaging"

PIVOT Pathway - Leverage THIS SKILL for safer career paths:
Focus on how THIS SPECIFIC SKILL transfers to lower-risk roles:
- Adjacent roles where THIS SKILL is valuable but AI risk is lower
- Emerging careers that need THIS SKILL but are human-centric
- Management/leadership roles leveraging THIS SKILL
- Unique combinations of THIS SKILL with other domains
Example for Python: "Transition from Python developer to Python AI Product Manager or Developer Advocate"
Example for Design: "Move from graphic design to UX strategy or design leadership where decisions require human judgment"

CRITICAL: Generate UNIQUE strategies for EACH SKILL! Python strategies should be COMPLETELY different from leadership strategies!`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Faster and cheaper model
        messages: [
          {
            role: "system",
            content: "You are an expert career analyst specializing in AI impact assessment. TARGET: Extract 10-15 skills from resumes with sufficient content. Include both technical skills (programming, tools, frameworks) AND soft skills (communication, leadership, problem-solving). Be generous with skill inference. CRITICAL: For EACH SKILL, generate unique pathways (defend, augment, pivot) with 4 specific strategies each. Each skill must have its OWN personalized strategies - Python strategies must be different from Design strategies. Be creative and specific. Always return valid JSON. If the resume is minimal or blank, extract only reasonably identifiable skills (don't fabricate)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7, // Higher for more creative skill extraction and distinct per-skill pathway strategies
        max_tokens: 8000, // Much larger to accommodate pathways for 10-15 skills (4 strategies × 3 pathways × 15 skills = ~180 strategies)
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const result = JSON.parse(content);
      
      // Log raw extraction results
      console.log(`🔍 OpenAI extracted ${result.skills?.length || 0} skills from resume`);
      
      // Check if we got any skills at all
      if (!result.skills || result.skills.length === 0) {
        throw new Error("No skills could be identified in this resume. Please ensure your resume contains information about your experience, education, skills, or projects.");
      }
      
      // Use all skills returned by OpenAI (no filtering by confidence threshold)
      const highConfidenceSkills = result.skills;
      
      // Provide helpful feedback based on skill count
      if (highConfidenceSkills.length < 5) {
        console.warn(`⚠️ Only ${highConfidenceSkills.length} skills found. The resume may have limited content.`);
      } else if (highConfidenceSkills.length < 10) {
        console.log(`📊 Extracted ${highConfidenceSkills.length} skills (below target of 10-15, but acceptable for minimal resumes)`);
      } else {
        console.log(`✅ Successfully extracted ${highConfidenceSkills.length} skills (target: 10-15)`);
      }
      
      // Store each skill in the database - do this efficiently
      // Note: Skills are processed sequentially because each creates triggers Exa search
      // We accept this for now, but Exa searches run in background
      for (const skill of highConfidenceSkills) {
        // Find or create skill in master catalog
        let skillId = await ctx.runMutation(internal.controllers.skillController.findOrCreateSkill, {
          skillName: skill.skillName,
          category: skill.category,
        });

        // Create user skill record with skill-specific pathways
        await ctx.runMutation(internal.controllers.skillController.createUserSkill, {
          userId: resume.userId,
          resumeId: args.resumeId,
          skillId,
          skillName: skill.skillName,
          category: skill.category,
          riskScore: skill.riskScore,
          riskLevel: skill.riskLevel,
          confidence: skill.confidence,
          defendStrategies: skill.pathways?.defend || [],
          augmentStrategies: skill.pathways?.augment || [],
          pivotStrategies: skill.pathways?.pivot || [],
        });
      }
      
      console.log(`✅ Stored ${highConfidenceSkills.length} skills in database`);

      return {
        skills: highConfidenceSkills,
        recommendations: result.recommendations || [],
        overallPathways: result.overallPathways || {
          defend: [],
          augment: [],
          pivot: []
        },
      };

    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to extract skills: ${error.message}`);
    }
  },
});

/**
 * Action: Calculate AI risk score for a skill using OpenAI
 */
export const calculateRiskScore = action({
  args: {
    skillName: v.string(),
    skillCategory: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Import OpenAI (using require for Node.js runtime)
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey });

    console.log(`Calculating risk score for: ${args.skillName}`);

    const prompt = `Assess the risk of AI automation for this professional skill:

Skill: ${args.skillName}
Category: ${args.skillCategory}

Provide a risk assessment in JSON format:
{
  "riskScore": <number 0-100>,
  "riskLevel": "low|medium|high",
  "confidence": <number 0-1>,
  "reasoning": "Detailed explanation of the risk assessment",
  "recommendations": ["Suggestion 1", "Suggestion 2"]
}

Consider factors like:
- How repetitive or routine is this skill?
- Does it involve complex human judgment?
- Requires creativity or emotional intelligence?
- Level of human interaction needed?
- Current AI capabilities in this area?`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI impact analyst. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      return JSON.parse(content);

    } catch (error: any) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to calculate risk: ${error.message}`);
    }
  },
});

/**
 * Helper: Extract text from PDF buffer
 * Using pdf-parse with custom render to avoid file system issues
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse');
    
    console.log(`Parsing PDF (${buffer.length} bytes)...`);
    
    // Ensure we have a proper Buffer
    if (!Buffer.isBuffer(buffer)) {
      buffer = Buffer.from(buffer);
    }
    
    // Parse with custom render function to avoid file system access
    const data = await pdfParse(buffer, {
      // Custom page rendering to extract text
      pagerender: async (pageData: any) => {
        try {
          const textContent = await pageData.getTextContent();
          let pageText = '';
          for (const item of textContent.items) {
            pageText += item.str + ' ';
          }
          return pageText;
        } catch (err) {
          console.warn('Page render warning:', err);
          return '';
        }
      },
      // Limit pages for performance
      max: 0 // 0 means no limit
    });
    
    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error("No text extracted from PDF - the PDF may be empty or contain only images");
    }
    
    console.log(`Successfully extracted ${data.text.length} characters from PDF`);
    return data.text.trim();
    
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    
    // Check for specific error types
    if (error.code === 'ENOENT' || error.message?.includes('test/data')) {
      // This is the file system error - pdf-parse is broken in this environment
      throw new Error("PDF parsing library incompatible with serverless environment. Please convert your PDF to DOCX or use a different file.");
    } else if (error.message?.includes('encrypted') || error.message?.includes('password')) {
      throw new Error("PDF is password-protected. Please upload an unencrypted PDF.");
    } else if (error.message?.includes('Invalid')) {
      throw new Error("Invalid or corrupted PDF file. Please try a different file.");
    } else {
      throw new Error(`Failed to parse PDF: ${error.message || 'Unknown error'}. Try converting to DOCX format instead.`);
    }
  }
}

/**
 * Helper: Extract text from DOCX buffer
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = require('mammoth');
    
    // Ensure buffer is a proper Buffer object
    const docxBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    
    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer: docxBuffer });
    
    if (!result || !result.value) {
      throw new Error("No text extracted from DOCX");
    }
    
    console.log(`Extracted ${result.value.length} characters from DOCX`);
    return result.value;
  } catch (error: any) {
    console.error("DOCX parsing error:", error);
    throw new Error(`Failed to parse DOCX: ${error.message || 'Unknown error'}. Please ensure the file is a valid Word document.`);
  }
}

