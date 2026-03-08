// Constants and configuration for VidScreener

export const SIDEBAR_ITEMS_ADMIN = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'Projects', href: '/admin/projects', icon: 'FolderKanban' },
  { id: 'videos', label: 'Videos', href: '/admin/videos', icon: 'Video' },
  { id: 'evaluators', label: 'Evaluators', href: '/admin/evaluators', icon: 'Users' },
  { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  { id: 'settings', label: 'Settings', href: '/admin/settings', icon: 'Settings' },
];

export const SIDEBAR_ITEMS_EVALUATOR = [
  { id: 'dashboard', label: 'Dashboard', href: '/evaluator/dashboard', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'My Projects', href: '/evaluator/projects', icon: 'FolderKanban' },
  { id: 'queue', label: 'Review Queue', href: '/evaluator/queue', icon: 'ListChecks' },
  { id: 'history', label: 'History', href: '/evaluator/history', icon: 'History' },
  { id: 'settings', label: 'Settings', href: '/evaluator/settings', icon: 'Settings' },
];

export const SIDEBAR_ITEMS_SUBMITTER = [
  { id: 'dashboard', label: 'Dashboard', href: '/submit/dashboard', icon: 'LayoutDashboard' },
  { id: 'submissions', label: 'View Submissions', href: '/submit/submissions', icon: 'ListChecks' },
  { id: 'new-submission', label: 'New Submission', href: '/submit/new', icon: 'FolderKanban' },
  { id: 'settings', label: 'Settings', href: '/submit/settings', icon: 'Settings' },
];

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  flagged: 'bg-red-100 text-red-800',
  override: 'bg-blue-100 text-blue-800',
};

export const SAMPLE_VIDEOS = [
  {
    id: 'vid-001',
    applicantName: 'John Smith',
    applicantId: 'APP-2026-1234',
    projectId: 'proj-001',
    projectName: 'Spring 2026 Admissions',
    duration: '4:32',
    uploadDate: '2026-02-02',
    aiScore: 82,
    status: 'pending' as const,
    assignedTo: 'Michael Chen',
  },
  {
    id: 'vid-002',
    applicantName: 'Sarah Johnson',
    applicantId: 'APP-2026-1235',
    projectId: 'proj-001',
    projectName: 'Spring 2026 Admissions',
    duration: '3:15',
    uploadDate: '2026-02-02',
    aiScore: 76,
    status: 'approved' as const,
    assignedTo: 'Michael Chen',
  },
  {
    id: 'vid-003',
    applicantName: 'David Lee',
    applicantId: 'APP-2026-1236',
    projectId: 'proj-001',
    projectName: 'Spring 2026 Admissions',
    duration: '5:48',
    uploadDate: '2026-02-03',
    aiScore: 68,
    status: 'flagged' as const,
    assignedTo: 'Michael Chen',
    criticalFlags: [{
      type: 'time_limit' as const,
      severity: 'medium' as const,
      message: 'Video exceeds time limit (5:48 vs 5:00 max)',
    }],
  },
];

export const SAMPLE_PROJECTS = [
  {
    id: 'proj-001',
    name: 'Spring 2026 Admissions',
    description: 'Video submissions for Spring 2026 semester admissions',
    createdDate: '2026-01-15',
    videoCount: 856,
    evaluatorCount: 12,
    completionPercentage: 65,
    status: 'active' as const,
  },
  {
    id: 'proj-002',
    name: 'MBA Program 2026',
    description: 'Executive MBA program video interviews',
    createdDate: '2026-01-20',
    videoCount: 234,
    evaluatorCount: 5,
    completionPercentage: 42,
    status: 'active' as const,
  },
];
