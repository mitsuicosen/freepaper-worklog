import type { WorkLog, TaskCategory } from '../types';
import { TASK_CATEGORY_LABELS } from '../types';

export interface CategoryStats {
  category: TaskCategory;
  label: string;
  totalMinutes: number;
  aiMinutes: number;
  nonAiMinutes: number;
  count: number;
  avgDifficulty: number;
}

export interface AiComparisonRow {
  category: string;
  avgWithoutAi: number;
  avgWithAi: number;
  reductionPercent: number;
}

export interface WeeklyInterruptionData {
  week: string;
  count: number;
  totalMinutes: number;
}

export function getCategoryStats(logs: WorkLog[]): CategoryStats[] {
  const map = new Map<TaskCategory, { total: number; ai: number; nonAi: number; count: number; diffSum: number }>();

  for (const log of logs) {
    const dur = log.durationMinutes ?? 0;
    const existing = map.get(log.taskCategory) ?? { total: 0, ai: 0, nonAi: 0, count: 0, diffSum: 0 };
    existing.total += dur;
    if (log.aiUsed) {
      existing.ai += dur;
    } else {
      existing.nonAi += dur;
    }
    existing.count += 1;
    existing.diffSum += log.difficulty;
    map.set(log.taskCategory, existing);
  }

  return Array.from(map.entries()).map(([cat, stats]) => ({
    category: cat,
    label: TASK_CATEGORY_LABELS[cat],
    totalMinutes: stats.total,
    aiMinutes: stats.ai,
    nonAiMinutes: stats.nonAi,
    count: stats.count,
    avgDifficulty: stats.count > 0 ? stats.diffSum / stats.count : 0,
  })).sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function getAiComparison(logs: WorkLog[]): AiComparisonRow[] {
  const map = new Map<TaskCategory, { aiTimes: number[]; nonAiTimes: number[] }>();

  for (const log of logs) {
    if (!log.durationMinutes) continue;
    const existing = map.get(log.taskCategory) ?? { aiTimes: [], nonAiTimes: [] };
    if (log.aiUsed) {
      existing.aiTimes.push(log.durationMinutes);
    } else {
      existing.nonAiTimes.push(log.durationMinutes);
    }
    map.set(log.taskCategory, existing);
  }

  const rows: AiComparisonRow[] = [];
  for (const [cat, data] of map.entries()) {
    if (data.aiTimes.length === 0 || data.nonAiTimes.length === 0) continue;
    const avgAi = data.aiTimes.reduce((s, v) => s + v, 0) / data.aiTimes.length;
    const avgNonAi = data.nonAiTimes.reduce((s, v) => s + v, 0) / data.nonAiTimes.length;
    const reduction = avgNonAi > 0 ? ((avgNonAi - avgAi) / avgNonAi) * 100 : 0;
    rows.push({
      category: TASK_CATEGORY_LABELS[cat],
      avgWithoutAi: Math.round(avgNonAi),
      avgWithAi: Math.round(avgAi),
      reductionPercent: Math.round(reduction),
    });
  }
  return rows.sort((a, b) => b.reductionPercent - a.reductionPercent);
}

export function getAiReplacementCandidates(logs: WorkLog[]): Array<{ category: string; weeklyHours: number; reason: string }> {
  const stats = getCategoryStats(logs);
  return stats
    .filter(s => s.avgDifficulty <= 3 && s.count >= 2)
    .map(s => ({
      category: s.label,
      weeklyHours: Math.round((s.totalMinutes / 60) * 10) / 10,
      reason: s.avgDifficulty <= 2
        ? 'AI化でほぼ自動化可能'
        : 'テンプレートAIで効率化',
    }))
    .slice(0, 5);
}

export function getInterruptionStats(logs: WorkLog[]): { count: number; totalMinutes: number; percentage: number } {
  const interruptions = logs.filter(l => l.isInterrupted || l.taskCategory === 'interruption');
  const totalMinutes = logs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0);
  const intMinutes = interruptions.reduce((s, l) => s + (l.durationMinutes ?? 0), 0);
  return {
    count: interruptions.length,
    totalMinutes: intMinutes,
    percentage: totalMinutes > 0 ? Math.round((intMinutes / totalMinutes) * 100) : 0,
  };
}

export function getTotalAiSavedMinutes(logs: WorkLog[]): number {
  return logs.reduce((s, l) => s + (l.aiTimeSavedMinutes ?? 0), 0);
}

export function getAiUsageRate(logs: WorkLog[]): number {
  if (logs.length === 0) return 0;
  const aiCount = logs.filter(l => l.aiUsed).length;
  return Math.round((aiCount / logs.length) * 100);
}
