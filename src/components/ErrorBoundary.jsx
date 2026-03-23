import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center
                      bg-slate-950 text-center p-8">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-white/60 text-sm mb-2 max-w-md">
          An unexpected error occurred. This has been logged.
        </p>
        <p className="text-white/30 text-xs font-mono mb-8 max-w-lg break-all">
          {this.state.error?.message}
        </p>
        <button
          type="button"
          onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
          className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold
                     px-6 py-3 rounded-xl transition-colors"
        >
          Reload App
        </button>
      </div>
    );
  }
}
