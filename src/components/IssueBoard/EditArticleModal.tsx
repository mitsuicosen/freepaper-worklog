import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useIssueStore } from '../../stores/issueStore';
import type { Article } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  article: Article | null;
}

const ARTICLE_CATEGORIES = ['グルメ', 'イベント', '観光', 'インタビュー', 'コラム', 'お知らせ', 'その他'];

export function EditArticleModal({ open, onClose, article }: Props) {
  const updateArticle = useIssueStore((s) => s.updateArticle);
  const deleteArticle = useIssueStore((s) => s.deleteArticle);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setCategory(article.category ?? '');
      setAssignee(article.assignee ?? '');
    }
  }, [article]);

  if (!article) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateArticle(article.id, {
      title,
      category: category || undefined,
      assignee: assignee || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('この記事を削除しますか？')) {
      deleteArticle(article.id);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="記事を編集">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-ink-300 mb-1">記事タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-ink-300 mb-1">ジャンル</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
          >
            <option value="">なし</option>
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-ink-300 mb-1">担当者（任意）</label>
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-red-400 hover:text-red-300 text-sm"
          >
            削除
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-ink-300 hover:text-paper-100">
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded">
              保存
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
