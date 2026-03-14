import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useIssueStore } from '../../stores/issueStore';
import type { Issue } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  issue: Issue | null;
}

export function EditIssueModal({ open, onClose, issue }: Props) {
  const updateIssue = useIssueStore((s) => s.updateIssue);
  const deleteIssue = useIssueStore((s) => s.deleteIssue);

  const [number, setNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (issue) {
      setNumber(issue.number);
      setTitle(issue.title ?? '');
      setPublishDate(issue.publishDate.slice(0, 10));
      setDeadline(issue.deadline.slice(0, 10));
    }
  }, [issue]);

  if (!issue) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateIssue(issue.id, {
      number,
      title: title || undefined,
      publishDate: new Date(publishDate).toISOString(),
      deadline: new Date(deadline).toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('この号と紐づく全記事を削除しますか？')) {
      deleteIssue(issue.id);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="号を編集">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-ink-300 mb-1">号数</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-ink-300 mb-1">特集タイトル（任意）</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-ink-300 mb-1">発行日</label>
          <input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-ink-300 mb-1">校了締め切り</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-paper-100 focus:border-accent-500 focus:outline-none"
            required
          />
        </div>
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-red-400 hover:text-red-300 text-sm"
          >
            この号を削除
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
