export interface Issue {
  id: string;
  number: number;
  title?: string;
  publishDate: string;
  deadline: string;
  status: 'planning' | 'in-progress' | 'completed';
  createdAt: string;
}

export interface Article {
  id: string;
  issueId: string;
  title: string;
  category?: string;
  status: WorkflowStatus;
  assignee?: string;
  createdAt: string;
}

export type WorkflowStatus =
  | 'planning'
  | 'interview'
  | 'writing'
  | 'proofreading'
  | 'completed';

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  planning: '企画',
  interview: '取材',
  writing: '執筆',
  proofreading: '校正',
  completed: '校了',
};

export interface WorkLog {
  id: string;
  articleId?: string;
  issueId?: string;
  taskCategory: TaskCategory;
  taskName: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  isInterrupted: boolean;
  aiUsed: boolean;
  aiTools?: string[];
  aiTimeSavedMinutes?: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  complexity: 'simple' | 'moderate' | 'complex';
  memo?: string;
}

export type TaskCategory =
  | 'planning'
  | 'research'
  | 'interview'
  | 'writing'
  | 'editing'
  | 'proofreading'
  | 'design-direction'
  | 'photo-selection'
  | 'coordination'
  | 'admin'
  | 'interruption';

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  planning: '企画・会議',
  research: 'リサーチ・情報収集',
  interview: '取材・インタビュー',
  writing: '執筆・原稿作成',
  editing: '編集・リライト',
  proofreading: '校正・校閲',
  'design-direction': 'デザイン指示・確認',
  'photo-selection': '写真選定・トリミング',
  coordination: '連絡・調整',
  admin: '管理・雑務',
  interruption: '差し込み業務',
};

export type TabId = 'board' | 'timer' | 'analytics' | 'settings';
