import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React render error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black text-white font-poppins flex items-center justify-center p-6 selection:bg-orange-500 selection:text-white">
          <div className="max-w-md w-full bg-[#121212] border border-gray-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/10">
              <FiAlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                We encountered an unexpected interface issue while loading this page. Your cart and account information remain completely safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <FiRefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1A1A1A] hover:bg-[#222] text-gray-300 hover:text-white border border-gray-800 rounded-xl text-xs font-semibold transition"
              >
                <FiHome className="w-4 h-4" /> Return Home
              </button>
            </div>

            {Boolean(import.meta.env.DEV) && this.state.error && (
              <details className="mt-4 text-left p-3 bg-black/60 border border-gray-800/80 rounded-xl text-[11px] text-gray-500 font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-300 font-semibold mb-1">
                  Technical Details (Debug)
                </summary>
                <p className="text-rose-400 font-bold">{this.state.error.toString()}</p>
                <pre className="mt-2 text-[10px] text-gray-500 whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
