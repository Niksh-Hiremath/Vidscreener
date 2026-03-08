# AI Rubric Configuration and Evaluation Prompts

VidScreener uses large language models (LLMs) with multimodal capabilities to evaluate video submissions. Evaluations are driven by dynamic rubrics configured by organization administrators.

## Structure of an Evaluation

An evaluation is composed of distinct criteria (a **Rubric**) stored across the `rubrics` and `rubric_criteria` tables. 

### The Evaluation Output
For each applicant's video, the AI generates a structured assessment:
1. **Criteria Scores**: Individual points awarded for each rubric item (e.g., 25/30 for Articulation).
2. **Justifications**: Quantitative evidence from the video supporting each score.
3. **Flags**: Automated detection of issues like poor audio, non-compliance with prompts, or duration limit violations.
4. **Overall Score**: An aggregated percentage or weighted sum.

## Data Model & Normalized Rubrics

Previously stored as single JSON blobs, rubrics are now fully normalized to allow for better analytics and historical tracking.

### `rubric_criteria`
Each project has a rubric containing multiple criteria:
- **Name**: e.g., "Problem Solving Approach".
- **Description**: Guidance for the AI (e.g., "Look for structured thinking and use of the STAR method").
- **Max Points**: The ceiling for this specific item.
- **Weight**: Relative importance (default 1.0).

## Evaluation Pipeline

1. **Trigger**: A video transitions to `uploaded` status in the `videos` table.
2. **Context Assembly**: The system fetches the project `description`, the `submission_responses` (candidate profile), and the full `rubric_criteria` list.
3. **Multimodal Prompting**: The AI model (e.g., Gemini 1.5 Pro) is prompted with the raw video bytes and the assembled context.
4. **Parsing**: The structured JSON response is parsed into the `ai_evaluations` and `ai_criteria_scores` tables.
5. **Human Review**: The record becomes visible in the Evaluator's queue, where they can see the AI's breakdown side-by-side with the video playback.
