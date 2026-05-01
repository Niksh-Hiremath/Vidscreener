const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_NAME = "gemini-3.1-flash-lite-preview";
const API_VERSION = "v1beta";

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  videoData?: {
    uri: string;
  };
}

export interface GeminiGenerateContentRequest {
  contents: Array<{
    parts: GeminiContentPart[];
    role?: string;
  }>;
  systemInstruction?: {
    parts: GeminiContentPart[];
  };
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}

export interface GeminiCandidate {
  content: {
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    role?: string;
  };
  finishReason?: string;
  safetyRatings?: Array<{ category: string; probability: string }>;
}

export interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    safetyRatings?: Array<{ category: string; probability: string }>;
  };
}

export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: GeminiGenerateContentResponse
  ) {
    super(message);
    this.name = "GeminiAPIError";
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildVideoUri(r2Key: string, env: Env): string {
  const accountId = (env as Record<string, string | undefined>).CLOUDFLARE_ACCOUNT_ID || "";
  return `https://pub-${accountId}.${(env as Record<string, string | undefined>).R2_PUBLIC_DOMAIN || "r2.dev"}/${r2Key}`;
}

export async function generateContentWithVideo(
  videoR2Key: string,
  prompt: string,
  systemInstruction: string,
  env: Env,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<string> {
  const apiKey = (env as Record<string, string | undefined>).GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment");

  const videoUri = buildVideoUri(videoR2Key, env);

  const requestBody: GeminiGenerateContentRequest = {
    contents: [
      {
        parts: [
          {
            videoData: { uri: videoUri },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
      responseMimeType: "text/plain",
    },
  };

  const url = `${GEMINI_BASE_URL}/${MODEL_NAME}:generateContent?key=${apiKey}`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 280_000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new GeminiAPIError(
          `Gemini API error: ${response.status} ${response.statusText} — ${text}`,
          response.status
        );
      }

      const data: GeminiGenerateContentResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        if (data.promptFeedback?.safetyRatings?.length) {
          throw new GeminiAPIError(
            "Content blocked by safety filters",
            400,
            data
          );
        }
        throw new GeminiAPIError("No candidates in Gemini response", 500, data);
      }

      const candidate = data.candidates[0];
      const parts = candidate.content?.parts ?? [];
      const textParts = parts
        .map((p) => p.text ?? "")
        .filter(Boolean)
        .join("");

      if (!textParts && candidate.finishReason === "MAX_TOKENS") {
        throw new GeminiAPIError("Response truncated — maxOutputTokens exceeded", 400);
      }

      return textParts;
    } catch (err) {
      lastError = err as Error;
      if (err instanceof GeminiAPIError) {
        if (err.status === 400 || err.status === 401 || err.status === 403) {
          throw err;
        }
      }
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("Gemini request failed after 3 attempts");
}

export async function generateContent(
  prompt: string,
  systemInstruction: string,
  env: Env,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  } = {}
): Promise<string> {
  const apiKey = (env as Record<string, string | undefined>).GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment");

  const requestBody: GeminiGenerateContentRequest = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
      responseMimeType: options.responseMimeType ?? "text/plain",
    },
  };

  const url = `${GEMINI_BASE_URL}/${MODEL_NAME}:generateContent?key=${apiKey}`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 280_000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new GeminiAPIError(
          `Gemini API error: ${response.status} ${response.statusText} — ${text}`,
          response.status
        );
      }

      const data: GeminiGenerateContentResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        if (data.promptFeedback?.safetyRatings?.length) {
          throw new GeminiAPIError("Content blocked by safety filters", 400, data);
        }
        throw new GeminiAPIError("No candidates in Gemini response", 500, data);
      }

      const candidate = data.candidates[0];
      const parts = candidate.content?.parts ?? [];
      const textParts = parts
        .map((p) => p.text ?? "")
        .filter(Boolean)
        .join("");

      return textParts;
    } catch (err) {
      lastError = err as Error;
      if (err instanceof GeminiAPIError) {
        if (err.status === 400 || err.status === 401 || err.status === 403) {
          throw err;
        }
      }
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("Gemini request failed after 3 attempts");
}