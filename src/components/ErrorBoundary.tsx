import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 text-stone-900">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-900">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Something went wrong
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                An unexpected hiccup occurred while rendering this page. You can refresh or return to the main store.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
