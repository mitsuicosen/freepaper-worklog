import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useIssueStore } from '../../stores/issueStore';
import type { WorkflowStatus } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  issueId: string;
  initialStatus?: WorkflowStatus;
}

const ARTICLE_CATEGORIES = ['グルメ', 'イベント', '観光', 'インタビュー', 'コラム', 'お知らせ', 'その他'];

export function CreateArticleModal({ open, onClose, issueId, initialStatus = 'planning' }: Props) {
  const addArticle = useIssueStore((s) => s.addArticle);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [assignee, setAssignee] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addArticle({
      issueId,
      title,
      category: category || undefined,
      status: initialStatus,
      assignee: assignee || undefined,
    });
    setTitle('');
    setCategory('');
    setAssignee('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="記事を追加">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-ink-300 mb-1">記事タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
            placeholder="例: 春のグルメ特集"
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
            <option value="">選択してください</option>
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
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-ink-300 hover:text-paper-100">
            キャンセル
          </button>
          <button type="submit" className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded">
            追加
          </button>
        </div>
      </form>
    </Modal>
  );
}
