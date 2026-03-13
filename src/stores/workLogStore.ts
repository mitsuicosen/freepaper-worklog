import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkLog, TaskCategory } from '../types';
import { generateId } from '../utils/timeUtils';

interface ActiveTimer {
  startTime: string;
  issueId?: string;
  articleId?: string;
  taskCategory: TaskCategory;
  taskName: string;
  isInterrupted: boolean;
}

interface WorkLogState {
  logs: WorkLog[];
  activeTimer: ActiveTimer | null;

  startTimer: (data: Omit<ActiveTimer, 'startTime'>) => void;
  stopTimer: (extra?: Partial<WorkLog>) => void;
  cancelTimer: () => void;
  updateActiveTimer: (data: Partial<ActiveTimer>) => void;

  addManualLog: (data: Omit<WorkLog, 'id'>) => void;
  updateLog: (id: string, data: Partial<WorkLog>) => void;
  deleteLog: (id: string) => void;

  getLogsByIssue: (issueId: string) => WorkLog[];
  getLogsByArticle: (articleId: string) => WorkLog[];
  getTodayLogs: () => WorkLog[];
  getLogsByDateRange: (start: Date, end: Date) => WorkLog[];
}

export const useWorkLogStore = create<WorkLogState>()(
  persist(
    (set, get) => ({
      logs: [],
      activeTimer: null,

      startTimer: (data) => {
        set({
          activeTimer: {
            ...data,
            startTime: new Date().toISOString(),
          },
        });
      },

      stopTimer: (extra) => {
        const { activeTimer } = get();
        if (!activeTimer) return;

        const endTime = new Date().toISOString();
        const startMs = new Date(activeTimer.startTime).getTime();
        const endMs = new Date(endTime).getTime();
        const durationMinutes = Math.round((endMs - startMs) / 60000);

        const log: WorkLog = {
          id: generateId(),
          articleId: activeTimer.articleId,
          issueId: activeTimer.issueId,
          taskCategory: activeTimer.taskCategory,
          taskName: activeTimer.taskName,
          startTime: activeTimer.startTime,
          endTime,
          durationMinutes,
          isInterrupted: activeTimer.isInterrupted,
          aiUsed: false,
          difficulty: 3,
          complexity: 'moderate',
          ...extra,
        };

        set((s) => ({
          logs: [...s.logs, log],
          activeTimer: null,
        }));
      },

      cancelTimer: () => set({ activeTimer: null }),

      updateActiveTimer: (data) => {
        set((s) => {
          if (!s.activeTimer) return s;
          return { activeTimer: { ...s.activeTimer, ...data } };
        });
      },

      addManualLog: (data) => {
        const log: WorkLog = { ...data, id: generateId() };
        set((s) => ({ logs: [...s.logs, log] }));
      },

      updateLog: (id, data) => {
        set((s) => ({
          logs: s.logs.map((l) => (l.id === id ? { ...l, ...data } : l)),
        }));
      },

      deleteLog: (id) => {
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
      },

      getLogsByIssue: (issueId) => get().logs.filter((l) => l.issueId === issueId),

      getLogsByArticle: (articleId) => get().logs.filter((l) => l.articleId === articleId),

      getTodayLogs: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMs = today.getTime();
        return get().logs.filter((l) => new Date(l.startTime).getTime() >= todayMs);
      },

      getLogsByDateRange: (start, end) => {
        const startMs = start.getTime();
        const endMs = end.getTime();
        return get().logs.filter((l) => {
          const t = new Date(l.startTime).getTime();
          return t >= startMs && t <= endMs;
        });
      },
    }),
    { name: 'freepaper-worklogs' }
  )
);
