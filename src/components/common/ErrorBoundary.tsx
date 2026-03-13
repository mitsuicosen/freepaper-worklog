import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-ink-900 text-paper-100 p-4">
          <div className="bg-ink-800 border border-accent-600 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-bold text-accent-400 mb-2">エラーが発生しました</h2>
            <p className="text-sm text-ink-300 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded transition-colors"
            >
              ページをリロード
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
