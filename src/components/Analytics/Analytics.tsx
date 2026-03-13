import { useMemo } from 'react';
import { useWorkLogStore } from '../../stores/workLogStore';
import { formatMinutes, getStartOfWeek } from '../../utils/timeUtils';
import {
  getCategoryStats,
  getAiComparison,
  getAiReplacementCandidates,
  getInterruptionStats,
  getTotalAiSavedMinutes,
  getAiUsageRate,
} from '../../utils/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b', '#a855f7'];

export function Analytics() {
  const logs = useWorkLogStore((s) => s.logs);

  const weekStart = useMemo(() => getStartOfWeek(), []);
  const weekLogs = useMemo(
    () => logs.filter((l) => new Date(l.startTime).getTime() >= weekStart.getTime()),
    [logs, weekStart]
  );

  const totalMinutes = useMemo(
    () => weekLogs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0),
    [weekLogs]
  );
  const aiRate = useMemo(() => getAiUsageRate(weekLogs), [weekLogs]);
  const aiSaved = useMemo(() => getTotalAiSavedMinutes(weekLogs), [weekLogs]);
  const categoryStats = useMemo(() => getCategoryStats(weekLogs), [weekLogs]);
  const aiComparison = useMemo(() => getAiComparison(logs), [logs]);
  const candidates = useMemo(() => getAiReplacementCandidates(logs), [logs]);
  const intStats = useMemo(() => getInterruptionStats(weekLogs), [weekLogs]);

  const topCategory = useMemo(
    () =>
      categoryStats.length > 0
        ? `${categoryStats[0].label}(${Math.round(
            (categoryStats[0].totalMinutes / Math.max(totalMinutes, 1)) * 100
          )}%)`
        : '-',
    [categoryStats, totalMinutes]
  );

  const barData = useMemo(
    () =>
      categoryStats.map((s) => ({
        name: s.label.length > 6 ? s.label.substring(0, 6) + '...' : s.label,
        fullName: s.label,
        AI使用: Math.round((s.aiMinutes / 60) * 10) / 10,
        AI未使用: Math.round((s.nonAiMinutes / 60) * 10) / 10,
      })),
    [categoryStats]
  );

  const pieData = useMemo(
    () =>
      categoryStats.map((s) => ({
        name: s.label,
        value: s.totalMinutes,
      })),
    [categoryStats]
  );

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <h2 className="text-lg font-semibold text-paper-100">分析ダッシュボード</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="今週の工数" value={formatMinutes(totalMinutes)} />
          <SummaryCard label="AI使用率" value={`${aiRate}%`} />
          <SummaryCard label="AI節約時間" value={formatMinutes(aiSaved)} />
          <SummaryCard label="最多カテゴリ" value={topCategory} small />
        </div>

        {/* Category charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-ink-300 mb-4">カテゴリ別工数（時間）</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2b324a" />
                  <XAxis dataKey="name" tick={{ fill: '#8d96b4', fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fill: '#8d96b4', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c2133', border: '1px solid #3a4361', borderRadius: '8px' }}
                    labelStyle={{ color: '#fdf9f3' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="AI未使用" stackId="a" fill="#4a5578" />
                  <Bar dataKey="AI使用" stackId="a" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
          <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-ink-300 mb-4">カテゴリ別割合</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c2133', border: '1px solid #3a4361', borderRadius: '8px' }}
                    formatter={(value) => formatMinutes(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* AI comparison table */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-300 mb-4">AI導入効果比較</h3>
          {aiComparison.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-700">
                    <th className="text-left p-2 text-ink-300">業務カテゴリ</th>
                    <th className="text-right p-2 text-ink-300">AI前平均</th>
                    <th className="text-right p-2 text-ink-300">AI後平均</th>
                    <th className="text-right p-2 text-ink-300">短縮率</th>
                  </tr>
                </thead>
                <tbody>
                  {aiComparison.map((row) => (
                    <tr key={row.category} className="border-b border-ink-800">
                      <td className="p-2 text-paper-100">{row.category}</td>
                      <td className="p-2 text-right text-ink-300">{row.avgWithoutAi}分</td>
                      <td className="p-2 text-right text-ink-300">{row.avgWithAi}分</td>
                      <td className={`p-2 text-right font-medium ${row.reductionPercent > 0 ? 'text-green-400' : 'text-ink-300'}`}>
                        {row.reductionPercent > 0 ? `-${row.reductionPercent}%` : `+${Math.abs(row.reductionPercent)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-ink-500">AI使用/未使用両方のデータが必要です</p>
          )}
        </div>

        {/* Interruption stats */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-300 mb-4">差し込み業務分析（今週）</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{intStats.count}</div>
              <div className="text-xs text-ink-400 mt-1">発生件数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{formatMinutes(intStats.totalMinutes)}</div>
              <div className="text-xs text-ink-400 mt-1">合計時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{intStats.percentage}%</div>
              <div className="text-xs text-ink-400 mt-1">全体比</div>
            </div>
          </div>
        </div>

        {/* AI replacement candidates */}
        <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-ink-300 mb-4">AI置き換え候補</h3>
          {candidates.length > 0 ? (
            <div className="space-y-3">
              {candidates.map((c, i) => (
                <div key={c.category} className="flex items-center gap-3 p-3 bg-ink-700/50 rounded">
                  <span className="text-lg font-bold text-accent-400 w-8">{i + 1}位</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-paper-100">{c.category}</div>
                    <div className="text-xs text-ink-400">週平均 {c.weeklyHours}h</div>
                  </div>
                  <span className="text-xs text-ink-300">{c.reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">データが蓄積されると候補が表示されます</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-lg p-4">
      <div className="text-xs text-ink-400 mb-1">{label}</div>
      <div className={`font-bold text-paper-100 ${small ? 'text-sm' : 'text-xl'}`}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return <div className="flex items-center justify-center h-[280px] text-sm text-ink-500">データがありません</div>;
}
