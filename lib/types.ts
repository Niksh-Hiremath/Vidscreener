// Shared TypeScript types and interfaces for VidScreener

export interface Video {
  id: string;
  applicantName: string;
  applicantId: string;
  projectId: string;
  projectName: string;
  duration: string; // e.g., "3:24"
  uploadDate: string;
  aiScore: number;
  status: 'pending' | 'approved' | 'flagged' | 'override';
  assignedTo?: string;
  criticalFlags?: CriticalFlag[];
  thumbnailUrl?: string;
}

export interface CriticalFlag {
  type: 'time_limit' | 'audio_missing' | 'language' | 'quality' | 'relevance';
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  videoCount: number;
  evaluatorCount: number;
  completionPercentage: number;
  status: 'active' | 'archived';
  rubric?: Rubric;
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number; // percentage
}

export interface AIEvaluation {
  videoId: string;
  overallScore: number;
  confidence: number; // percentage
  justification: string;
  criteriaScores: {
    criterionId: string;
    score: number;
    maxScore: number;
    justification: string;
  }[];
}

export interface Evaluator {
  id: string;
  name: string;
  email: string;
  projectIds: string[];
  videosReviewed: number;
  averageReviewTime: string; // e.g., "8.5 mins"
  status: 'active' | 'inactive';
}

export interface MetricData {
  label: string;
  value: string | number;
  change?: string; // e.g., "+12%"
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface Activity {
  id: string;
  type: 'upload' | 'review' | 'evaluation' | 'assignment';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}
