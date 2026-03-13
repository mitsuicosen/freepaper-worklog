import { useState } from 'react';
import type { TabId } from './types';
import { IssueBoard } from './components/IssueBoard/IssueBoard';
import { Timer } from './components/Timer/Timer';
import { Analytics } from './components/Analytics/Analytics';
import { useWorkLogStore } from './stores/workLogStore';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'board', label: '号管理', icon: '\uD83D\uDCF0' },
  { id: 'timer', label: 'タイマー', icon: '\u23F1\uFE0F' },
  { id: 'analytics', label: '分析', icon: '\uD83D\uDCCA' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('board');
  const activeTimer = useWorkLogStore((s) => s.activeTimer);

  return (
    <div className="h-screen flex flex-col bg-ink-900 text-paper-100">
      {/* Top nav */}
      <header className="bg-ink-800 border-b border-ink-700 px-4">
        <div className="flex items-center justify-between h-12">
          <h1 className="text-sm font-bold tracking-wide text-paper-200">
            FreePaper WorkLog
          </h1>
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2 text-sm rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-ink-700 text-paper-100'
                    : 'text-ink-400 hover:text-paper-200 hover:bg-ink-700/50'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {tab.id === 'timer' && activeTimer && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0">
        {activeTab === 'board' && <IssueBoard />}
        {activeTab === 'timer' && <Timer />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
}
