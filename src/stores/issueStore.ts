import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Issue, Article, WorkflowStatus } from '../types';
import { generateId } from '../utils/timeUtils';

interface IssueState {
  issues: Issue[];
  articles: Article[];
  selectedIssueId: string | null;

  addIssue: (data: Omit<Issue, 'id' | 'createdAt'>) => void;
  updateIssue: (id: string, data: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  selectIssue: (id: string | null) => void;

  addArticle: (data: Omit<Article, 'id' | 'createdAt'>) => void;
  updateArticle: (id: string, data: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  moveArticle: (id: string, status: WorkflowStatus) => void;

  getArticlesByIssue: (issueId: string) => Article[];
  getArticlesByStatus: (issueId: string, status: WorkflowStatus) => Article[];
}

export const useIssueStore = create<IssueState>()(
  persist(
    (set, get) => ({
      issues: [],
      articles: [],
      selectedIssueId: null,

      addIssue: (data) => {
        const issue: Issue = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ issues: [...s.issues, issue], selectedIssueId: issue.id }));
      },

      updateIssue: (id, data) => {
        set((s) => ({
          issues: s.issues.map((i) => (i.id === id ? { ...i, ...data } : i)),
        }));
      },

      deleteIssue: (id) => {
        set((s) => ({
          issues: s.issues.filter((i) => i.id !== id),
          articles: s.articles.filter((a) => a.issueId !== id),
          selectedIssueId: s.selectedIssueId === id ? (s.issues[0]?.id ?? null) : s.selectedIssueId,
        }));
      },

      selectIssue: (id) => set({ selectedIssueId: id }),

      addArticle: (data) => {
        const article: Article = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ articles: [...s.articles, article] }));
      },

      updateArticle: (id, data) => {
        set((s) => ({
          articles: s.articles.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }));
      },

      deleteArticle: (id) => {
        set((s) => ({ articles: s.articles.filter((a) => a.id !== id) }));
      },

      moveArticle: (id, status) => {
        set((s) => ({
          articles: s.articles.map((a) => (a.id === id ? { ...a, status } : a)),
        }));
      },

      getArticlesByIssue: (issueId) => {
        return get().articles.filter((a) => a.issueId === issueId);
      },

      getArticlesByStatus: (issueId, status) => {
        return get().articles.filter((a) => a.issueId === issueId && a.status === status);
      },
    }),
    {
      name: 'freepaper-issues',
      onRehydrateStorage: () => {
        return () => {
          // Silently handle rehydration errors
        };
      },
    }
  )
);
