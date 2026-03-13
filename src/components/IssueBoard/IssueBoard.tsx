import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useIssueStore } from '../../stores/issueStore';
import type { Article, WorkflowStatus } from '../../types';
import { formatDate, getDeadlineBgColor, daysUntil } from '../../utils/timeUtils';
import { KanbanColumn } from './KanbanColumn';
import { CrossIssueView } from './CrossIssueView';
import { CreateIssueModal } from './CreateIssueModal';
import { CreateArticleModal } from './CreateArticleModal';
import { ArticleCard } from './ArticleCard';

const STATUSES: WorkflowStatus[] = ['planning', 'interview', 'writing', 'proofreading', 'completed'];

export function IssueBoard() {
  const issues = useIssueStore((s) => s.issues);
  const articles = useIssueStore((s) => s.articles);
  const selectedIssueId = useIssueStore((s) => s.selectedIssueId);
  const selectIssue = useIssueStore((s) => s.selectIssue);
  const moveArticle = useIssueStore((s) => s.moveArticle);

  const [viewMode, setViewMode] = useState<'kanban' | 'cross'>('kanban');
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [draggedArticle, setDraggedArticle] = useState<Article | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);
  const sortedIssues = [...issues].sort((a, b) => a.number - b.number);

  const handleDragStart = (event: DragStartEvent) => {
    const article = event.active.data.current?.article as Article | undefined;
    if (article) setDraggedArticle(article);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedArticle(null);
    const { active, over } = event;
    if (!over) return;

    const articleId = active.id as string;
    const targetStatus = over.id as WorkflowStatus;
    if (STATUSES.includes(targetStatus)) {
      moveArticle(articleId, targetStatus);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {sortedIssues.map((issue) => {
            const days = daysUntil(issue.deadline);
            const isSelected = issue.id === selectedIssueId;
            return (
              <button
                key={issue.id}
                onClick={() => selectIssue(issue.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-accent-600 text-white'
                    : 'bg-ink-700 text-ink-300 hover:text-paper-100 hover:bg-ink-600'
                }`}
              >
                第{issue.number}号
                {days <= 7 && (
                  <span className={`ml-1 text-xs ${days <= 3 ? 'text-red-300' : 'text-yellow-300'}`}>
                    {days <= 0 ? '(期限超過)' : `(残${days}日)`}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setShowCreateIssue(true)}
            className="px-3 py-1.5 rounded text-sm text-ink-400 hover:text-paper-100 hover:bg-ink-700 border border-dashed border-ink-600"
          >
            + 新しい号
          </button>
        </div>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'kanban' | 'cross')}
          className="bg-ink-700 border border-ink-600 text-ink-200 text-sm rounded px-3 py-1.5 focus:outline-none"
        >
          <option value="kanban">かんばんボード</option>
          <option value="cross">工程横断ビュー</option>
        </select>
      </div>

      {/* Issue info bar */}
      {selectedIssue && viewMode === 'kanban' && (
        <div className={`px-4 py-2 border-b border-ink-700 flex items-center gap-4 text-sm ${getDeadlineBgColor(selectedIssue.deadline)}`}>
          <span className="text-ink-200">
            発行: {formatDate(selectedIssue.publishDate)} / 締切: {formatDate(selectedIssue.deadline)}
          </span>
          {selectedIssue.title && <span className="text-ink-300">- {selectedIssue.title}</span>}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'cross' ? (
          <CrossIssueView />
        ) : selectedIssue ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 h-full min-h-0">
              {STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  articles={articles.filter(
                    (a) => a.issueId === selectedIssueId && a.status === status
                  )}
                  onAddClick={() => setShowCreateArticle(true)}
                />
              ))}
            </div>
            <DragOverlay>
              {draggedArticle && <ArticleCard article={draggedArticle} />}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-ink-400">
            <p className="text-lg mb-4">号を作成して始めましょう</p>
            <button
              onClick={() => setShowCreateIssue(true)}
              className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded"
            >
              + 新しい号を作成
            </button>
          </div>
        )}
      </div>

      <CreateIssueModal open={showCreateIssue} onClose={() => setShowCreateIssue(false)} />
      {selectedIssueId && (
        <CreateArticleModal
          open={showCreateArticle}
          onClose={() => setShowCreateArticle(false)}
          issueId={selectedIssueId}
        />
      )}
    </div>
  );
}
