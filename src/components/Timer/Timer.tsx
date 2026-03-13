import { useState, useEffect, useMemo } from 'react';
import { useWorkLogStore } from '../../stores/workLogStore';
import { useIssueStore } from '../../stores/issueStore';
import { TASK_CATEGORY_LABELS, type TaskCategory } from '../../types';
import { formatDuration, formatTime, formatMinutes } from '../../utils/timeUtils';

const TASK_CATEGORIES = Object.entries(TASK_CATEGORY_LABELS) as [TaskCategory, string][];

export function Timer() {
  // Store state
  const { activeTimer, startTimer, stopTimer, cancelTimer, logs } = useWorkLogStore((s) => ({
    activeTimer: s.activeTimer,
    startTimer: s.startTimer,
    stopTimer: s.stopTimer,
    cancelTimer: s.cancelTimer,
    logs: s.logs,
  }));

  const { issues, articles } = useIssueStore((s) => ({
    issues: s.issues,
    articles: s.articles,
  }));

  // Local state
  const [elapsed, setElapsed] = useState(0);
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('writing');
  const [taskName, setTaskName] = useState('');
  const [issueId, setIssueId] = useState('');
  const [articleId, setArticleId] = useState('');

  // Memoized computations
  const filteredArticles = useMemo(
    () => (issueId ? articles.filter((a) => a.issueId === issueId) : []),
    [issueId, articles]
  );

  const todayLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    return logs.filter((l) => new Date(l.startTime).getTime() >= todayMs);
  }, [logs]);

  // Timer effect
  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      return;
    }

    const startMs = new Date(activeTimer.startTime).getTime();
    const update = () => {
      const diff = Math.floor((Date.now() - startMs) / 1000);
      setElapsed(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTimer?.startTime]);

  // Handlers
  const handleStart = () => {
    startTimer({
      issueId: issueId || undefined,
      articleId: articleId || undefined,
      taskCategory,
      taskName: taskName || TASK_CATEGORY_LABELS[taskCategory],
      isInterrupted: false,
    });
  };

  const handleStop = () => {
    stopTimer({});
    setTaskName('');
    setIssueId('');
    setArticleId('');
  };

  const handleQuickStart = () => {
    startTimer({
      taskCategory: 'interruption',
      taskName: '差し込み業務',
      isInterrupted: true,
    });
  };

  return (
    <div className="h-full overflow-auto bg-ink-900">
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        {/* Quick interrupt button */}
        {!activeTimer && (
          <button
            onClick={handleQuickStart}
            className="w-full py-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/40 text-yellow-300 rounded-lg font-medium transition-colors"
          >
            ⚡ 差し込み業務を記録
          </button>
        )}

        {/* Timer card */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
          <h2 className="text-center text-ink-300 text-sm mb-6">作業タイマー</h2>

          {/* Timer display */}
          <div className="text-center text-6xl font-mono text-paper-100 tracking-wider mb-6">
            {formatDuration(elapsed)}
          </div>

          {/* Config section - only show when not running */}
          {!activeTimer && (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ink-400 mb-1">号</label>
                  <select
                    value={issueId}
                    onChange={(e) => {
                      setIssueId(e.target.value);
                      setArticleId('');
                    }}
                    className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
                  >
                    <option value="">なし</option>
                    {issues.map((i) => (
                      <option key={i.id} value={i.id}>
                        第{i.number}号
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1">記事</label>
                  <select
                    value={articleId}
                    onChange={(e) => setArticleId(e.target.value)}
                    disabled={!issueId}
                    className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">なし</option>
                    {filteredArticles.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-ink-400 mb-1">業務</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
                >
                  {TASK_CATEGORIES.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder={TASK_CATEGORY_LABELS[taskCategory]}
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            {!activeTimer ? (
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                開始
              </button>
            ) : (
              <>
                <button
                  onClick={handleStop}
                  className="px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium"
                >
                  停止
                </button>
                <button
                  onClick={cancelTimer}
                  className="px-6 py-3 bg-ink-700 hover:bg-ink-600 text-ink-300 rounded-lg"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>

        {/* Today's logs */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-300 mb-3">今日の作業</h3>
          {todayLogs.length === 0 ? (
            <p className="text-sm text-ink-500">記録なし</p>
          ) : (
            <div className="space-y-2">
              {[...todayLogs].reverse().map((log) => (
                <div key={log.id} className="flex justify-between text-xs text-ink-300 py-1 border-b border-ink-700 last:border-0">
                  <span>{formatTime(log.startTime)}</span>
                  <span>{TASK_CATEGORY_LABELS[log.taskCategory]}</span>
                  <span>{log.durationMinutes ? formatMinutes(log.durationMinutes) : '記録中'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
