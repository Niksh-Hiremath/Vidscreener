# VidScreener -- Product Description (Comprehensive)

## Overview

VidScreener is an AI-assisted video evaluation platform designed to help
organizations efficiently assess large volumes of video submissions for
admissions, hiring, and program selection (e.g., Plaksha YCL).

It combines multimodal AI with human evaluators to deliver structured,
explainable, and scalable video assessments.

------------------------------------------------------------------------

## Problem Context (Grounded in Real Use Case - YCL)

-   \~500 submissions evaluated by \~5 evaluators over \~1 month
-   Evaluators manually watch full videos + documents
-   Language constraints (English/Hindi)
-   Issues like:
    -   Poor audio/video → rejection
    -   Bias (rural vs urban ideas)
    -   Over-polished scripted answers ("big talk" problem)

------------------------------------------------------------------------

## Core Idea

VidScreener transforms unstructured video data into structured
evaluations using configurable rubrics, enabling faster, more
consistent, and explainable decision-making.

------------------------------------------------------------------------

## Key Capabilities

### 1. AI-Powered Video Evaluation

-   Multimodal LLM processes:
    -   Video
    -   Transcript
    -   Submission metadata
-   Outputs:
    -   Criterion-wise scores
    -   Timestamp-grounded justifications
    -   Flags (audio, compliance)
    -   Overall score

------------------------------------------------------------------------

### 2. Semantic Segmentation & Key Moments

-   AI detects meaningful segments (not fixed time chunks)
-   Enables:
    -   Timeline insights
    -   Key strengths/weaknesses
    -   Clickable graph-based exploration

------------------------------------------------------------------------

### 3. Explainability (Core Principle)

-   Every AI claim is tied to:
    -   Timestamp
    -   Transcript snippet
-   Makes evaluation:
    -   Auditable
    -   Transparent
    -   Contestable

------------------------------------------------------------------------

### 4. AI Chat (Evaluator Assistant)

-   Query-based interaction:
    -   "Summarize video"
    -   "Why low score?"
    -   "What are weaknesses?"
-   Constrained modes to reduce hallucination
-   All responses grounded with timestamps

------------------------------------------------------------------------

### 5. Human-in-the-Loop

-   AI = first-pass evaluator
-   Human:
    -   Reviews
    -   Adjusts scores
    -   Finalizes decision

------------------------------------------------------------------------

### 6. AI vs Human Calibration

-   Per video:
    -   AI score vs final score
-   Org-level analytics:
    -   Deviation trends
    -   Rubric disagreement
    -   Evaluator consistency

------------------------------------------------------------------------

### 7. Confidence Scoring

-   AI assigns confidence to outputs
-   Based on:
    -   Signal strength
    -   Consistency
    -   Input quality

------------------------------------------------------------------------

### 8. Transcription + Smart Processing

-   Audio-first pipeline:
    -   Extract audio → transcribe → analyze
-   Smart frame sampling:
    -   Only analyze key visual moments
-   Balances cost vs accuracy

------------------------------------------------------------------------

### 9. Language Handling

-   Admin-defined allowed languages (e.g., English, Hindi)
-   Flags unsupported languages
-   Supports code-mixed content (future optimization)

------------------------------------------------------------------------

## User Roles

### Submitter

-   Submits video + form
-   Tracks status

### Evaluator

Two types: - Org-bound (internal) - Open (external marketplace)

Capabilities: - Review AI-assisted evaluation - Use AI chat - Access
timeline insights

### Admin

-   Belongs to one organization
-   Org supports multiple admins + one superadmin

Capabilities: - Create projects - Define rubrics - Configure forms -
Assign evaluators - View analytics

------------------------------------------------------------------------

## Evaluator Marketplace

-   Admins can select external evaluators
-   Visibility into:
    -   Past ratings
    -   Experience (#projects/videos)
-   Enables scalable evaluation

------------------------------------------------------------------------

## Workflow

1.  Submitter uploads video
2.  AI processes with rubric + context
3.  Generates structured evaluation
4.  Evaluator reviews and finalizes
5.  Admin monitors analytics

------------------------------------------------------------------------

## Admin Controls

-   Rubric configuration (criteria, weights)
-   Form configuration
-   Language restrictions
-   Evaluator assignment
-   Analytics dashboards

------------------------------------------------------------------------

## Analytics & Insights

### Project Level

-   Submission volume
-   Evaluation progress
-   AI vs human comparison

### Organization Level

-   Evaluator performance
-   Rubric reliability
-   Bias indicators (future)

------------------------------------------------------------------------

## Infrastructure

-   Frontend: Next.js
-   Database: Cloudflare D1
-   Storage: Cloudflare R2
-   AI: Multimodal LLM (prompt-engineered)

------------------------------------------------------------------------

## Design Principles

1.  Explainability-first
2.  Human-in-the-loop
3.  Rubric-driven evaluation
4.  Scalable multi-tenant system
5.  Trust through grounding

------------------------------------------------------------------------

## Key Differentiators

-   Temporal, explainable evaluation
-   AI-human calibration layer
-   Evaluator marketplace
-   Evidence-grounded reasoning
-   Smart video + transcript hybrid analysis

------------------------------------------------------------------------

## Future Directions

-   Bias detection dashboards
-   Evaluator quality scoring
-   Highlight reel generation
-   Advanced calibration metrics
-   ATS integrations

------------------------------------------------------------------------

## Summary

VidScreener is a full-stack evaluation infrastructure that converts
subjective video reviews into structured, explainable, and scalable
decision-making systems using AI + human collaboration.
