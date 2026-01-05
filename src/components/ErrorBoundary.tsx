import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logError } from '@/utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
  constructor(props: Props & { navigate: (path: string) => void }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, { source: 'ErrorBoundary', componentStack: errorInfo.componentStack || '' });
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.props.navigate('/');
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI - Dark mode
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-neutral-800 border-neutral-700 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mb-4 ring-2 ring-red-500/30">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-300 text-center leading-relaxed">
                Don't worry, your data is safe. Let's get you back on track.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs text-neutral-400 bg-[#0a0a0f]/50 p-3 rounded-lg border border-neutral-700">
                  <summary className="cursor-pointer font-medium mb-2 text-neutral-300">
                    🔧 Developer Details
                  </summary>
                  <pre className="whitespace-pre-wrap overflow-auto text-red-300">
                    {this.state.error.toString()}
                    {this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
                  </pre>
                </details>
              )}

              <div className="flex space-x-3 pt-2">
                <Button 
                  onClick={this.handleRetry} 
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white border-0"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide navigation
export default function ErrorBoundary(props: Props) {
  const navigate = useNavigate();
  return <ErrorBoundaryClass {...props} navigate={navigate} />;
}