/**
 * Error Boundary Component
 * 
 * Catches React errors and displays a fallback UI.
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px] bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 text-center max-w-md">
            An unexpected error occurred while rendering this component. 
            The error has been logged for review.
          </p>
          {this.state.error && (
            <details className="mb-4 text-xs text-zinc-500 max-w-md">
              <summary className="cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
                Show error details
              </summary>
              <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
