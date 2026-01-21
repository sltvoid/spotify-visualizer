import { Component, type ReactNode, type ReactElement } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the
 * child component tree, logs those errors, and displays a fallback UI.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="card max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred while loading this section.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-secondary flex items-center gap-2"
                aria-label="Try again"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="btn-primary"
                aria-label="Reload page"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error display component for inline errors within sections.
 */
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps): ReactElement {
  return (
    <div
      className="text-center p-6 rounded-xl bg-red-500/10 border border-red-500/20"
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="text-red-400 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary text-sm"
          aria-label="Retry loading data"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
