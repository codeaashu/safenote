import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8 lg:p-12 flex items-center justify-center">
      <Card className="border border-red-700/50 bg-red-900/20 backdrop-blur-xl shadow-2xl max-w-md w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <CardTitle className="text-2xl font-bold text-red-400">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-slate-300 mb-4">
              An unexpected error occurred. This might be due to a temporary issue.
            </p>
            
            {error?.message && (
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600/30 mb-4">
                <p className="text-xs text-slate-400 font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleReload}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Reload Page
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="w-full bg-gray-900/50 text-white border-slate-600/50 hover:bg-gray-800/50"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Go to Home
            </Button>
            
            <Button
              variant="ghost"
              onClick={resetError}
              className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              Try Again
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-500">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundary;