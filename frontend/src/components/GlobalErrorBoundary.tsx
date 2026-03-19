import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
          <div className="max-w-xl w-full bg-secondary/20 border border-destructive/20 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">An unexpected error occurred in the application.</p>
            <details className="whitespace-pre-wrap bg-background/50 rounded-lg p-4 border border-border/50">
              <summary className="font-semibold cursor-pointer mb-2 text-primary">View Error Details</summary>
              <div className="overflow-auto text-sm font-mono text-muted-foreground mt-2">
                <strong>{this.state.error?.toString()}</strong>
                <br />
                {this.state.errorInfo?.componentStack}
              </div>
            </details>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
