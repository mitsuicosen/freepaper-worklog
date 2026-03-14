import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Article, WorkflowStatus } from '../../types';
import { WORKFLOW_STATUS_LABELS } from '../../types';
import { ArticleCard } from './ArticleCard';

interface Props {
  status: WorkflowStatus;
  articles: Article[];
  onAddClick: () => void;
  onEditArticle?: (article: Article) => void;
}

export function KanbanColumn({ status, articles, onAddClick, onEditArticle }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[200px] flex-1 rounded-lg transition-colors ${
        isOver ? 'bg-ink-700/50' : 'bg-ink-800/50'
      }`}
    >
      <div className="px-3 py-2 border-b border-ink-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-200">{WORKFLOW_STATUS_LABELS[status]}</h3>
          <span className="text-xs text-ink-400 bg-ink-700 px-2 py-0.5 rounded-full">
            {articles.length}
          </span>
        </div>
      </div>
      <div className="p-2 flex-1 space-y-2 min-h-[100px]">
        <SortableContext items={articles.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} onEdit={onEditArticle} />
          ))}
        </SortableContext>
        {status === 'planning' && (
          <button
            onClick={onAddClick}
            className="w-full py-2 text-sm text-ink-400 hover:text-paper-100 hover:bg-ink-700 rounded border border-dashed border-ink-600 transition-colors"
          >
            + 追加
          </button>
        )}
      </div>
    </div>
  );
}
