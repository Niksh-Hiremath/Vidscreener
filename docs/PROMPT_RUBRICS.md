# AI Rubric Configuration and Evaluation Prompts

VidScreener uses large language models (LLMs) equipped with video understanding capabilities to evaluate applicant submissions. This document outlines the standard configuration for the AI Evaluator, focusing on evaluating video essays based on distinct rubrics.

## Structure of an Evaluation
An evaluation is composed of distinct criteria (a Rubric) defined by the Organization/Admin. For each applicant's video, the AI is prompted with the video file and the rubric, and it must output a structured JSON response containing:
1. `scores`: An array of scores and justifications per criterion.
2. `flags`: Critical issues derived from the video (e.g., duration constraints, inappropriate content, audio clarity).
3. `overall_score`: The aggregated result.
4. `summary`: A concise justification intended for the human Reviewer's inbox preview.

## System Prompt Blueprint

The following is an example prompt used to instruct the AI Evaluator when processing a video clip alongside a custom project rubric.

```text
You are an expert Admissions Evaluator for VidScreener. Your task is to review the provided applicant video and evaluate them strictly according to the provided Rubric.

### The Applicant
Name: {{applicant_name}}
Project: {{project_name}}
Prompt given to applicant: "{{project_description_or_prompt}}"

### The Rubric
Please review the candidate on the following criteria. 
Each criterion has a maximum score.

{{rubric_json_string}}

### Your Output Format
You MUST output a valid JSON object matching this schema:

{
  "scores": [
    {
      "name": "Criterion Name",
      "score": <number>,
      "max_score": <number>,
      "justification": "Concise explanation (1-2 sentences) of why this score was given."
    }
  ],
  "flags": [
    {
      "type": "duration|audio|content|other",
      "severity": "low|medium|high",
      "description": "Short description of the issue."
    }
  ],
  "overall_score": <number>,
  "summary": "Overall assessment of the applicant.",
  "confidence": <number_between_0_and_100>
}

### Guidelines
1. Be objective and rely solely on the video content.
2. Evaluate based on the prompt's intent. If an applicant missed the prompt entirely, lower the Content Relevance score.
3. Automatically flag the video if:
   - The audio is incomprehensible.
   - The video is completely black or the user is not visible.
   - The duration drastically deviates from expected limits.
4. Keep justifications professional and strictly analytical.
```

## Example Rubric Definition (JSON Structure)
An organization can define a dynamic rubric through the VidScreener admin interface, stored as a JSON object in the `projects` table.

```json
[
  {
    "name": "Communication Skills",
    "description": "Evaluates articulation, delivery, pacing, and overall clarity.",
    "max_score": 30
  },
  {
    "name": "Content Relevance",
    "description": "How well the applicant addressed the prompt with relevant examples.",
    "max_score": 25
  },
  {
    "name": "Presentation Quality",
    "description": "Lighting, camera angle, background professionalism.",
    "max_score": 20
  },
  {
    "name": "Creativity",
    "description": "Originality of thought and unique approach to the prompt.",
    "max_score": 15
  },
  {
    "name": "Language Proficiency",
    "description": "Grammar, syntax, and vocabulary usage.",
    "max_score": 10
  }
]
```

## Integration with the Platform
When an applicant uploads a video, a webhook is triggered. A background worker (or Supabase Edge Function) queries the LLM API (e.g., Gemini 1.5 Pro) with the user's video, interpolating the `rubric_json` from the database directly into the `System Prompt Blueprint`.

The JSON output is subsequently parsed and saved into an `evaluations` record, with the `status` typically set to `pending_human_review`. Admis or Evaluators then view this structured data in the `Review Queue` and `VideoReviewPage`.
