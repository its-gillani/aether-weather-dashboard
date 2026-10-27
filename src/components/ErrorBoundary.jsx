import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Aether UI Crash caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white/10 border border-rose-500/30 backdrop-blur-2xl shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Meteorological Stream Interrupted
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              A telemetry rendering error occurred. The application state can be safely restored.
            </p>
            {this.state.error && (
              <pre className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
