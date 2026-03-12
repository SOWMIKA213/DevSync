import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let technicalDetails = "";

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Permission Denied: You don't have access to ${parsed.operationType} this resource.`;
            technicalDetails = `Path: ${parsed.path || 'Unknown'}`;
          }
        }
      } catch (e) {
        // Not a JSON error message, use default
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-12 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full -mr-16 -mt-16"></div>
            
            <div className="p-6 bg-red-500/10 rounded-full w-fit mx-auto mb-8 border border-red-500/20">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">System Alert</h2>
            <p className="text-zinc-400 mb-2 font-light leading-relaxed">
              {errorMessage}
            </p>
            {technicalDetails && (
              <p className="text-zinc-600 text-xs font-mono mb-8 bg-black/40 p-3 rounded-xl border border-white/5">
                {technicalDetails}
              </p>
            )}
            
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-black py-4 px-8 rounded-2xl transition-all hover:bg-red-50 shadow-xl active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" />
              Restart Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
