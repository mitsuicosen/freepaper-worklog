import { useIssueStore } from '../../stores/issueStore';
import { WORKFLOW_STATUS_LABELS, type WorkflowStatus } from '../../types';

const STATUSES: WorkflowStatus[] = ['planning', 'interview', 'writing', 'proofreading', 'completed'];

export function CrossIssueView() {
  const issues = useIssueStore((s) => s.issues);
  const articles = useIssueStore((s) => s.articles);

  const activeIssues = issues.filter((i) => i.status !== 'completed').sort((a, b) => a.number - b.number);

  if (activeIssues.length === 0) {
    return (
      <div className="text-center text-ink-400 py-12">
        号を作成すると工程横断ビューが表示されます
      </div>
    );
  }

  const maxCount = Math.max(
    1,
    ...activeIssues.flatMap((issue) =>
      STATUSES.map((s) => articles.filter((a) => a.issueId === issue.id && a.status === s).length)
    )
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-sm text-ink-300 p-3 border-b border-ink-700 w-24">工程</th>
            {activeIssues.map((issue) => (
              <th key={issue.id} className="text-left text-sm text-ink-300 p-3 border-b border-ink-700">
                第{issue.number}号
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STATUSES.map((status) => (
            <tr key={status} className="border-b border-ink-800">
              <td className="p-3 text-sm text-ink-200 font-medium">{WORKFLOW_STATUS_LABELS[status]}</td>
              {activeIssues.map((issue) => {
                const count = articles.filter((a) => a.issueId === issue.id && a.status === status).length;
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <td key={issue.id} className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-5 bg-ink-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-accent-600/60 rounded transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-400 w-6 text-right">{count}件</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
