import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useIssueStore } from '../../stores/issueStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateIssueModal({ open, onClose }: Props) {
  const addIssue = useIssueStore((s) => s.addIssue);
  const issues = useIssueStore((s) => s.issues);
  const nextNumber = issues.length > 0 ? Math.max(...issues.map((i) => i.number)) + 1 : 1;

  const [number, setNumber] = useState(nextNumber);
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIssue({
      number,
      title: title || undefined,
      publishDate: new Date(publishDate).toISOString(),
      deadline: new Date(deadline).toISOString(),
      status: 'planning',
    });
    setTitle('');
    setPublishDate('');
    setDeadline('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="新しい号を作成">
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
            placeholder="例: 春の特集号"
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
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-ink-300 hover:text-paper-100">
            キャンセル
          </button>
          <button type="submit" className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded">
            作成
          </button>
        </div>
      </form>
    </Modal>
  );
}
