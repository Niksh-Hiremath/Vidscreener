# OpenRouter AI Presets Documentation

This document outlines the 4 AI presets used by VidScreener to handle multimodal video analysis, evaluation, and interaction via OpenRouter.

## 1. Preset Definitions

### P1: Baseline (Extraction & Compliance)
*   **Target Endpoints:** `/api/ai/transcribe`, `/api/ai/flags`, `/api/ai/segment`
*   **Model:** [google/gemini-3.1-flash-lite-preview](https://openrouter.ai/models/google/gemini-3.1-flash-lite-preview)
*   **Role:** Extracts raw data and metadata from the video to reduce context costs for downstream steps.
*   **Parameters:**
    *   **Temperature:** `0.1` (Minimize hallucination in transcription)
    *   **Top P:** `0.95`
    *   **Top K:** `40`
    *   **Max Tokens:** `4096`
*   **Input:** Video File + Supporting PDFs + System Prompt.
*   **Output:** Structured JSON containing transcript, quality flags (audio/video), and semantic segments.

### P2: Review (Multi-Criteria Analysis)
*   **Target Endpoints:** `/api/ai/evaluate/:videoId`
*   **Model:** [google/gemini-3.1-pro-preview](https://openrouter.ai/models/google/gemini-3.1-pro-preview)
*   **Role:** Deep reasoning over video content against a specific rubric.
*   **Parameters:**
    *   **Temperature:** `0.3` (Balanced for reasoning and evidence extraction)
    *   **Top P:** `0.9`
    *   **Top K:** `40`
    *   **Max Tokens:** `8192`
*   **Input:** Video File + P1 Context (Transcript/Flags) + Project Rubric + System Prompt.
*   **Output:** Score (1-5), reasoning, timestamped citations, and a comprehensive summary document.

### P3: AI Chat (Video Intelligence)
*   **Target Endpoints:** `/api/ai/chat`
*   **Model:** [google/gemini-3.1-flash-lite-preview](https://openrouter.ai/models/google/gemini-3.1-flash-lite-preview)
*   **Role:** Real-time conversational assistant for evaluators.
*   **Parameters:**
    *   **Temperature:** `0.7` (More natural conversation)
    *   **Top P:** `0.90`
    *   **Top K:** `40`
    *   **Max Tokens:** `2048`
*   **Input:** User Question + P1 Context + P2 Context.
*   **Output:** Concise natural language answers with specific video timestamps.

### P4: LLM-Judge (Quality Assurance)
*   **Target:** Internal Quality Gate for `/api/ai/evaluate`
*   **Model:** [qwen/qwen3.6-plus](https://openrouter.ai/models/qwen/qwen3.6-plus)
*   **Role:** Independent auditor to verify Gemini's scores and ensure grounding.
*   **Parameters:**
    *   **Temperature:** `0.0` (Strictly deterministic)
    *   **Top P:** `1.0`
    *   **Top K:** `1`
    *   **Max Tokens:** `1024`
*   **Input:** Full Context (Transcript, Rubric, Gemini's Review).
*   **Output:** Validation Report (Pass/Fail) with critique of Gemini's reasoning.

---

## 2. Cost Analysis (Estimated)

*Based on 5-minute video (~90k multimodal tokens) and 5k context tokens.*

| Preset | Cost Per Video ($) | Cost for 500 Videos ($) | Tradeoffs |
| :--- | :--- | :--- | :--- |
| **Baseline** | ~$0.024 | ~$12.00 | High speed, low reasoning depth. |
| **Review** | ~$0.208 | ~$104.00 | Frontier reasoning, tiered pricing >200k tokens. |
| **AI Chat** | ~$0.002 (per q) | ~$1.00 (avg) | Instant response, context-efficient. |
| **LLM-Judge**| ~$0.035 | ~$17.50 | Cross-model validation. |
| **TOTAL** | **~$0.269** | **~$134.50** | **Comprehensive analysis & QA.** |

---

## 3. Data Privacy & Security

To ensure VidScreener data is **never** used for training, the following OpenRouter configurations must be enforced:

1.  **Request Headers:** Include `HTTP-Referer` and `X-Title` for proper identification.
2.  **Provider Opt-Out:**
    *   Toggle **OFF**: "Allow providers that may train on inputs" in OpenRouter settings.
    *   Toggle **OFF**: "OpenRouter Use of Inputs/Outputs" (No 1% discount).
    *   Enable **Zero Data Retention (ZDR)**: For sensitive reviews, use providers like Google (via Vertex AI) which adhere to enterprise privacy terms.
3.  **Local Storage:** All transcripts and reviews should be stored in the local D1/Postgres database; only transient data is sent to OpenRouter.

## 4. Input/Output Specifications

| Endpoint | Input Data | Output Structure |
| :--- | :--- | :--- |
| `/api/ai/transcribe` | `video_stream`, `language_hint` | `{ transcript: [{ start, end, text }] }` |
| `/api/ai/flags` | `video_stream`, `baseline_prompt` | `{ flags: [{ category, severity, message }] }` |
| `/api/ai/evaluate` | `video_stream`, `rubric_id`, `p1_context` | `{ scores: { criteria: score }, reasoning: string, evidence: [] }` |
| `/api/ai/chat` | `user_query`, `p1_p2_context` | `{ answer: string, sources: [{ timestamp, snippet }] }` |
