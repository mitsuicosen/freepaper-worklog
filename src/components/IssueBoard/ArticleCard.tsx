import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Article } from '../../types';
import { useWorkLogStore } from '../../stores/workLogStore';
import { formatMinutes } from '../../utils/timeUtils';

interface Props {
  article: Article;
  onEdit?: (article: Article) => void;
}

export function ArticleCard({ article, onEdit }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id, data: { type: 'article', article } });

  const logs = useWorkLogStore((s) => s.logs);
  const articleLogs = logs.filter((l) => l.articleId === article.id);
  const totalMinutes = articleLogs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit?.(article)}
      className="bg-ink-700 border border-ink-600 rounded p-3 cursor-grab active:cursor-grabbing hover:border-ink-400 transition-colors group"
    >
      <h4 className="text-sm font-medium text-paper-100 leading-tight">{article.title}</h4>
      {article.category && (
        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-ink-600 text-ink-200 rounded">
          {article.category}
        </span>
      )}
      <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
        <span>{totalMinutes > 0 ? formatMinutes(totalMinutes) : '0h記録'}</span>
        {article.assignee && <span>{article.assignee}</span>}
      </div>
    </div>
  );
}
