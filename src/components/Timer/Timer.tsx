import { useState, useEffect, useMemo } from 'react';
import { useWorkLogStore } from '../../stores/workLogStore';
import { useIssueStore } from '../../stores/issueStore';
import { TASK_CATEGORY_LABELS, type TaskCategory } from '../../types';
import { formatDuration, formatTime, formatMinutes } from '../../utils/timeUtils';

const TASK_CATEGORIES = Object.entries(TASK_CATEGORY_LABELS) as [TaskCategory, string][];
const AI_TOOLS = ['Claude', 'ChatGPT', 'Gemini', 'Copilot'];

export function Timer() {
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

  const todayLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    return logs.filter((l) => new Date(l.startTime).getTime() >= todayMs);
  }, [logs]);

  const [elapsed, setElapsed] = useState(0);
  const [issueId, setIssueId] = useState('');
  const [articleId, setArticleId] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('writing');
  const [taskName, setTaskName] = useState('');
  const [isInterrupted, setIsInterrupted] = useState(false);

  // AI fields
  const [aiUsed, setAiUsed] = useState(false);
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [aiTimeSaved, setAiTimeSaved] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [memo, setMemo] = useState('');

  const filteredArticles = articles.filter((a) => a.issueId === issueId);

  // Timer tick
  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      return;
    }
    const startTime = new Date(activeTimer.startTime).getTime();
    const update = () => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTimer?.startTime]);

  const handleStart = () => {
    startTimer({
      issueId: issueId || undefined,
      articleId: articleId || undefined,
      taskCategory,
      taskName: taskName || TASK_CATEGORY_LABELS[taskCategory],
      isInterrupted,
    });
  };

  const handleQuickInterrupt = () => {
    startTimer({
      taskCategory: 'interruption',
      taskName: '差し込み業務',
      isInterrupted: true,
    });
  };

  const handleStop = () => {
    stopTimer({
      aiUsed,
      aiTools: aiUsed && aiTools.length > 0 ? aiTools : undefined,
      aiTimeSavedMinutes: aiUsed && aiTimeSaved ? Number(aiTimeSaved) : undefined,
      difficulty,
      complexity,
      memo: memo || undefined,
    });
    // Reset form
    setAiUsed(false);
    setAiTools([]);
    setAiTimeSaved('');
    setDifficulty(3);
    setComplexity('moderate');
    setMemo('');
  };

  const toggleAiTool = (tool: string) => {
    setAiTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Quick interrupt button */}
        {!activeTimer && (
          <button
            onClick={handleQuickInterrupt}
            className="w-full py-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/40 text-yellow-300 rounded-lg text-sm font-medium transition-colors"
          >
            &#9889; 差し込み業務を記録
          </button>
        )}

        {/* Timer display */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-6">
          <h2 className="text-center text-ink-300 text-sm mb-4">作業タイマー</h2>

          {/* Assignment */}
          {!activeTimer && (
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ink-400 mb-1">紐付け号</label>
                  <select
                    value={issueId}
                    onChange={(e) => { setIssueId(e.target.value); setArticleId(''); }}
                    className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
                  >
                    <option value="">なし</option>
                    {issues.map((i) => (
                      <option key={i.id} value={i.id}>第{i.number}号</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1">紐付け記事</label>
                  <select
                    value={articleId}
                    onChange={(e) => setArticleId(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
                    disabled={!issueId}
                  >
                    <option value="">なし</option>
                    {filteredArticles.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">業務カテゴリ</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
                >
                  {TASK_CATEGORIES.map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">作業名</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder={TASK_CATEGORY_LABELS[taskCategory]}
                  className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInterrupted}
                  onChange={(e) => setIsInterrupted(e.target.checked)}
                  className="rounded border-ink-600"
                />
                差し込み業務
              </label>
            </div>
          )}

          {/* Active timer info */}
          {activeTimer && (
            <div className="mb-4 text-center text-sm text-ink-300">
              <span>{TASK_CATEGORY_LABELS[activeTimer.taskCategory]}</span>
              {activeTimer.taskName !== TASK_CATEGORY_LABELS[activeTimer.taskCategory] && (
                <span className="ml-2 text-ink-400">- {activeTimer.taskName}</span>
              )}
            </div>
          )}

          {/* Timer */}
          <div className="text-center text-5xl font-mono text-paper-100 tracking-wider py-4">
            {formatDuration(elapsed)}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-4">
            {!activeTimer ? (
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                開始
              </button>
            ) : (
              <>
                <button
                  onClick={handleStop}
                  className="px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-medium transition-colors"
                >
                  停止
                </button>
                <button
                  onClick={cancelTimer}
                  className="px-6 py-3 bg-ink-700 hover:bg-ink-600 text-ink-300 rounded-lg text-sm transition-colors"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        </div>

        {/* AI & metadata section (shown when timer is running or after stopping) */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-medium text-ink-300 border-b border-ink-700 pb-2">AI使用情報（任意）</h3>

          <label className="flex items-center gap-2 text-sm text-paper-100 cursor-pointer">
            <input
              type="checkbox"
              checked={aiUsed}
              onChange={(e) => setAiUsed(e.target.checked)}
              className="rounded border-ink-600"
            />
            AIを使用した
          </label>

          {aiUsed && (
            <div className="space-y-3 pl-6">
              <div>
                <label className="block text-xs text-ink-400 mb-1">使用ツール</label>
                <div className="flex flex-wrap gap-2">
                  {AI_TOOLS.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => toggleAiTool(tool)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        aiTools.includes(tool)
                          ? 'bg-accent-600/30 border-accent-500 text-accent-300'
                          : 'bg-ink-700 border-ink-600 text-ink-300 hover:border-ink-400'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1">短縮できた時間（推定）</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={aiTimeSaved}
                    onChange={(e) => setAiTimeSaved(e.target.value)}
                    className="w-24 bg-ink-900 border border-ink-600 rounded px-3 py-1.5 text-sm text-paper-100 focus:border-accent-500 focus:outline-none"
                    min="0"
                  />
                  <span className="text-sm text-ink-400">分</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink-400 mb-2">難易度</label>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      difficulty === d
                        ? 'bg-accent-600 text-white'
                        : 'bg-ink-700 text-ink-400 hover:bg-ink-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-2">複雑さ</label>
              <div className="flex gap-1">
                {[
                  { value: 'simple' as const, label: 'シンプル' },
                  { value: 'moderate' as const, label: '中程度' },
                  { value: 'complex' as const, label: '複雑' },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setComplexity(c.value)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${
                      complexity === c.value
                        ? 'bg-accent-600 text-white'
                        : 'bg-ink-700 text-ink-400 hover:bg-ink-600'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-ink-400 mb-1">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-paper-100 focus:border-accent-500 focus:outline-none resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Today's logs */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-5">
          <h3 className="text-sm font-medium text-ink-300 border-b border-ink-700 pb-2 mb-3">
            今日の作業ログ
          </h3>
          {todayLogs.length === 0 ? (
            <p className="text-sm text-ink-500">まだ記録がありません</p>
          ) : (
            <div className="space-y-2">
              {[...todayLogs].reverse().map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-ink-800 last:border-0">
                  <span className="text-ink-400 w-12 shrink-0">{formatTime(log.startTime)}</span>
                  <span className="text-paper-100 flex-1 truncate">
                    {TASK_CATEGORY_LABELS[log.taskCategory]}
                    {log.taskName !== TASK_CATEGORY_LABELS[log.taskCategory] && ` - ${log.taskName}`}
                  </span>
                  <span className="text-ink-300 shrink-0">
                    {log.durationMinutes ? formatMinutes(log.durationMinutes) : '進行中...'}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {log.aiUsed && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">AI</span>
                    )}
                    {log.isInterrupted && (
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded">差込</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
