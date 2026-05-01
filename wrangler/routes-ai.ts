// AI route handlers for VidScreener
// P1: Video Analysis, P2: Rubric Scoring, P3: Chat Assistant
// Uses gemini-3.1-flash-lite-preview via Google AI Studio API

import { getCorsHeaders } from "./utils/cors";
import * as schema from "../db/schema";
import { and, eq } from "drizzle-orm";
import { getUserWithRole } from "./utils/user";
import { generateContentWithVideo, generateContent } from "./utils/ai";

// Prompt files — imported as static strings
import videoAnalysisPrompt from "./prompts/video-analysis.md?raw";
import rubricScoringPrompt from "./prompts/rubric-scoring.md?raw";
import chatAssistantPrompt from "./prompts/chat-assistant.md?raw";

interface AiReviewJson {
  overallScore: number;
  criterionScores: Array<{
    criterionId: string;
    criterionTitle: string;
    maxRating: number;
    rating: number;
    justification: string;
    keyEvidenceTimestamp: string;
    improvementNote?: string;
  }>;
  flags: Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: string | null;
  }>;
  confidenceSegments: Array<{
    start: string;
    end: string;
    label: string;
  }>;
  model: string;
  analyzedAt: string;
  videoAnalysisSignal?: Record<string, unknown>;
}

function json(data: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireEvaluatorOrAdmin(
  req: Request,
  env: Env,
  db: any
): Promise<{ user: any; evaluator: any } | Response> {
  const user = await getUserWithRole(req, env, db);
  if (!user) {
    return json({ error: "Unauthorized" }, 403, {});
  }

  const evaluatorRows = await db
    .select()
    .from(schema.evaluators)
    .where(
      user.organizationId
        ? eq(schema.evaluators.organizationId, user.organizationId)
        : undefined
    )
    .limit(1);

  const isAdminOrEvaluator =
    user.role === "admin" || user.role === "superadmin" || evaluatorRows.length > 0;

  if (!isAdminOrEvaluator) {
    return json({ error: "Forbidden: evaluator or admin role required" }, 403, {});
  }

  return { user, evaluator: evaluatorRows[0] || null };
}

function parseAiReviewFromText(text: string): AiReviewJson | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as AiReviewJson;
    }
  } catch {
    // Fall through to null return
  }
  return null;
}

export async function handleAiAnalyzeVideo(
  req: Request,
  env: Env,
  db: any
): Promise<Response> {
  const corsHeaders = getCorsHeaders(req, env);

  const auth = await requireEvaluatorOrAdmin(req, env, db);
  if (auth instanceof Response) return auth;
  const { user } = auth;

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.videoAttachmentId) {
      return json({ error: "videoAttachmentId is required" }, 400, corsHeaders);
    }

    const videoAttachmentId = Number(body.videoAttachmentId);
    if (isNaN(videoAttachmentId)) {
      return json({ error: "videoAttachmentId must be a number" }, 400, corsHeaders);
    }

    // Load video attachment
    const attachmentRows = await db
      .select()
      .from(schema.projectFormSubmissionAttachments)
      .where(eq(schema.projectFormSubmissionAttachments.id, videoAttachmentId));

    const attachment = attachmentRows[0];
    if (!attachment) {
      return json({ error: "Video attachment not found" }, 404, corsHeaders);
    }

    if (attachment.attachmentType !== "video") {
      return json({ error: "Attachment is not a video" }, 400, corsHeaders);
    }

    // Load submission + project for context
    const submissionRows = await db
      .select()
      .from(schema.projectFormSubmissions)
      .where(eq(schema.projectFormSubmissions.id, attachment.submissionId));

    const submission = submissionRows[0];
    if (!submission) {
      return json({ error: "Submission not found" }, 404, corsHeaders);
    }

    const projectRows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, submission.projectId));

    const project = projectRows[0];
    if (!project) {
      return json({ error: "Project not found" }, 404, corsHeaders);
    }

    // Load rubrics for this project
    const rubricRows = await db
      .select()
      .from(schema.projectRubrics)
      .where(eq(schema.projectRubrics.projectId, project.id))
      .orderBy(schema.projectRubrics.sortOrder);

    // Load form fields for project metadata
    const formRows = await db
      .select()
      .from(schema.projectForms)
      .where(eq(schema.projectForms.projectId, project.id));

    const formFields = formRows[0]?.fieldsJson
      ? JSON.parse(formRows[0].fieldsJson)
      : [];

    // Build project context string
    const projectContext = `
Project: ${project.name}
Organization: ${user.organizationId}
Theme: ${formFields.find((f: any) => f.label?.toLowerCase().includes("theme"))?.value || "Not specified"}
Team: ${formFields.find((f: any) => f.label?.toLowerCase().includes("team"))?.value || "Not specified"}
Form submission fields: ${JSON.stringify(formFields)}
`.trim();

    // Step 1: Run P1 — Video Analysis with video URL
    let videoAnalysisText: string;
    try {
      videoAnalysisText = await generateContentWithVideo(
        attachment.r2Key,
        `${videoAnalysisPrompt}\n\n## Project Context\n${projectContext}`,
        "You are an expert evaluation analyst for youth innovation competitions.",
        env,
        { temperature: 0.2, maxOutputTokens: 8192 }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Video analysis failed";
      return json({ error: `P1 Video Analysis failed: ${message}` }, 502, corsHeaders);
    }

    // Parse P1 output
    const p1Match = videoAnalysisText.match(/\{[\s\S]*\}/);
    const p1Output = p1Match ? JSON.parse(p1Match[0]) : null;

    // Step 2: Run P2 — Rubric Scoring (text-only, uses P1 output)
    const rubricContext = rubricRows
      .map(
        (r: any) =>
          `- ${r.title} (max ${r.weight}): ${r.description || "No description"}`
      )
      .join("\n") || "Default YCL 2026 rubric used";

    let rubricScoringText: string;
    try {
      rubricScoringText = await generateContent(
        `## Video Analysis Output (from P1)\n${videoAnalysisText}\n\n## Rubric Criteria for this Project\n${rubricContext}\n\n## Project Context\n${projectContext}`,
        `${rubricScoringPrompt}\n\nIMPORTANT: Score each criterion honestly based on the evidence in the video analysis. Do not inflate scores for missing content.`,
        env,
        { temperature: 0.2, maxOutputTokens: 8192 }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rubric scoring failed";
      return json({ error: `P2 Rubric Scoring failed: ${message}` }, 502, corsHeaders);
    }

    // Parse P2 output for overall score
    let overallScore = 0;
    try {
      const p2Match = rubricScoringText.match(/\{[\s\S]*\}/);
      if (p2Match) {
        const p2Output = JSON.parse(p2Match[0]);
        overallScore = p2Output.overallScore ?? 0;
      }
    } catch {
      // Try to extract a number from the text
      const scoreMatch = rubricScoringText.match(/overallScore["\s:]+(\d+)/);
      if (scoreMatch) overallScore = Number(scoreMatch[1]);
    }

    const analyzedAt = new Date().toISOString();

    // Build aiReviewJson
    const aiReviewJson: AiReviewJson = {
      overallScore,
      criterionScores: [],
      flags: (p1Output as any)?.flags ?? [],
      confidenceSegments: (p1Output as any)?.keyMoments?.map((m: any) => ({
        start: m.start,
        end: m.end,
        label: m.label,
      })) ?? [],
      model: "gemini-3.1-flash-lite-preview",
      analyzedAt,
      videoAnalysisSignal: p1Output,
    };

    // Try to parse criterion scores from P2 output
    try {
      const p2Match = rubricScoringText.match(/\{[\s\S]*\}/);
      if (p2Match) {
        const p2Output = JSON.parse(p2Match[0]);
        if (Array.isArray(p2Output.criterionScores)) {
          aiReviewJson.criterionScores = p2Output.criterionScores;
        }
      }
    } catch {
      // Use empty criterion scores if parsing fails
    }

    // Find or create project video review record
    let reviewRows = await db
      .select()
      .from(schema.projectVideoReviews)
      .where(
        eq(schema.projectVideoReviews.videoAttachmentId, videoAttachmentId)
      );

    let reviewId: number;

    if (reviewRows.length === 0) {
      // Create new review record
      const evaluatorRows = await db
        .select()
        .from(schema.evaluators)
        .where(
          user.organizationId
            ? eq(schema.evaluators.organizationId, user.organizationId)
            : eq(schema.evaluators.id, 0)
        )
        .limit(1);

      const evaluatorId = evaluatorRows[0]?.id ?? 0;

      const insertResult = await db
        .insert(schema.projectVideoReviews)
        .values({
          videoAttachmentId: videoAttachmentId,
          projectId: project.id,
          evaluatorId: evaluatorId,
          rubricBreakdownJson: "[]",
          aiReviewJson: JSON.stringify(aiReviewJson),
        })
        .returning();

      reviewId = insertResult[0].id;
    } else {
      // Update existing review
      reviewId = reviewRows[0].id;
      await db
        .update(schema.projectVideoReviews)
        .set({
          aiReviewJson: JSON.stringify(aiReviewJson),
          updatedAt: analyzedAt,
        })
        .where(eq(schema.projectVideoReviews.id, reviewId));
    }

    return json(
      {
        success: true,
        reviewId,
        overallScore,
        confidenceScore: (p1Output as any)?.confidenceScore ?? null,
        analyzedAt,
        message: "AI analysis complete",
      },
      200,
      corsHeaders
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleAiChat(
  req: Request,
  env: Env,
  db: any
): Promise<Response> {
  const corsHeaders = getCorsHeaders(req, env);

  const auth = await requireEvaluatorOrAdmin(req, env, db);
  if (auth instanceof Response) return auth;
  const { user } = auth;

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.videoAttachmentId || !body.question) {
      return json(
        { error: "videoAttachmentId and question are required" },
        400,
        corsHeaders
      );
    }

    const videoAttachmentId = Number(body.videoAttachmentId);
    const question = String(body.question).slice(0, 1000); // Sanitize length

    if (isNaN(videoAttachmentId)) {
      return json({ error: "videoAttachmentId must be a number" }, 400, corsHeaders);
    }

    // Load video attachment
    const attachmentRows = await db
      .select()
      .from(schema.projectFormSubmissionAttachments)
      .where(eq(schema.projectFormSubmissionAttachments.id, videoAttachmentId));

    const attachment = attachmentRows[0];
    if (!attachment) {
      return json({ error: "Video attachment not found" }, 404, corsHeaders);
    }

    // Load existing AI review
    const reviewRows = await db
      .select()
      .from(schema.projectVideoReviews)
      .where(
        eq(schema.projectVideoReviews.videoAttachmentId, videoAttachmentId)
      );

    const existingReview = reviewRows[0];
    if (!existingReview || !existingReview.aiReviewJson) {
      return json(
        { error: "No AI analysis found for this video. Run /api/ai/analyze first." },
        404,
        corsHeaders
      );
    }

    const aiReview: AiReviewJson = JSON.parse(existingReview.aiReviewJson);

    // Load project metadata
    const submissionRows = await db
      .select()
      .from(schema.projectFormSubmissions)
      .where(eq(schema.projectFormSubmissions.id, attachment.submissionId));

    const submission = submissionRows[0];
    const projectRows = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, submission?.projectId));

    const project = projectRows[0];

    const formRows = await db
      .select()
      .from(schema.projectForms)
      .where(eq(schema.projectForms.projectId, project?.id));

    const formFields = formRows[0]?.fieldsJson
      ? JSON.parse(formRows[0].fieldsJson)
      : [];

    const projectContext = `
Project: ${project?.name || "Unknown"}
Team/Submitter: ${formFields.find((f: any) => f.label?.toLowerCase().includes("team"))?.value || "Not specified"}
Theme: ${formFields.find((f: any) => f.label?.toLowerCase().includes("theme"))?.value || "Not specified"}
    `.trim();

    const analysisContext = JSON.stringify(aiReview.videoAnalysisSignal ?? {});
    const scoringContext = JSON.stringify({
      overallScore: aiReview.overallScore,
      criterionScores: aiReview.criterionScores,
      model: aiReview.model,
      analyzedAt: aiReview.analyzedAt,
    });

    let responseText: string;
    try {
      responseText = await generateContent(
        `## Project Context\n${projectContext}\n\n## P1 Video Analysis\n${analysisContext}\n\n## P2 Rubric Scoring\n${scoringContext}\n\n## Evaluator Question\n${question}`,
        `${chatAssistantPrompt}\n\nIMPORTANT: Always cite specific timestamps from the P1 analysis when answering. Keep responses under 800 words.`,
        env,
        { temperature: 0.4, maxOutputTokens: 2048 }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Chat request failed";
      return json({ error: `P3 Chat failed: ${message}` }, 502, corsHeaders);
    }

    return json(
      {
        answer: responseText,
        videoAttachmentId,
        question,
        hasAiReview: true,
        overallScore: aiReview.overallScore,
      },
      200,
      corsHeaders
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ error: message }, 500, corsHeaders);
  }
}

export async function handleAiStatus(
  req: Request,
  env: Env,
  db: any,
  videoId: number
): Promise<Response> {
  const corsHeaders = getCorsHeaders(req, env);

  const user = await getUserWithRole(req, env, db);
  if (!user) {
    return json({ error: "Unauthorized" }, 403, corsHeaders);
  }

  try {
    const videoAttachmentId = videoId;

    const reviewRows = await db
      .select()
      .from(schema.projectVideoReviews)
      .where(
        eq(schema.projectVideoReviews.videoAttachmentId, videoAttachmentId)
      );

    if (reviewRows.length === 0 || !reviewRows[0].aiReviewJson) {
      return json(
        {
          hasAiReview: false,
          cachedReview: null,
        },
        200,
        corsHeaders
      );
    }

    const aiReview: AiReviewJson = JSON.parse(reviewRows[0].aiReviewJson);

    return json(
      {
        hasAiReview: true,
        cachedReview: {
          overallScore: aiReview.overallScore,
          model: aiReview.model,
          analyzedAt: aiReview.analyzedAt,
          criterionCount: aiReview.criterionScores.length,
          flagCount: aiReview.flags.length,
        },
      },
      200,
      corsHeaders
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ error: message }, 500, corsHeaders);
  }
}