import { showToast } from '../components/Toast';

/**
 * Utility functions for consistent error handling across the application
 */

export interface ErrorHandlerOptions {
  showToast?: boolean;
  context?: string;
  defaultMessage?: string;
}

/**
 * Handle API errors with consistent logging and user notifications
 * @param error - The error object or message
 * @param options - Configuration options for error handling
 */
export function handleError(error: any, options: ErrorHandlerOptions = {}): void {
  const {
    showToast: shouldShowToast = true,
    context = '',
    defaultMessage = 'An unexpected error occurred'
  } = options;

  // Log the error for debugging
  const logMessage = context ? `Error in ${context}:` : 'Error:';
  console.error(logMessage, error);

  // Determine the error message to show to the user
  let userMessage = defaultMessage;
  
  if (error?.message) {
    userMessage = error.message;
  } else if (typeof error === 'string') {
    userMessage = error;
  }

  // Show toast notification if enabled
  if (shouldShowToast) {
    showToast(userMessage, 'error');
  }
}

/**
 * Handle async operations with automatic error handling
 * @param asyncFn - The async function to execute
 * @param options - Error handling options
 * @returns Promise that resolves to the result or undefined if error occurred
 */
export async function handleAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<T | undefined> {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, options);
    return undefined;
  }
}

/**
 * Handle form submission errors with specific formatting
 * @param error - The error from form submission
 * @param formName - Name of the form for context
 */
export function handleFormError(error: any, formName: string = 'form'): void {
  handleError(error, {
    context: `${formName} submission`,
    defaultMessage: `Failed to submit ${formName}. Please try again.`
  });
}

/**
 * Handle network/API errors with appropriate user-friendly messages
 * @param error - The network error
 * @param operation - Description of the operation that failed
 */
export function handleNetworkError(error: any, operation: string = 'operation'): void {
  let userMessage = `Failed to ${operation}`;

  // Check for common network error patterns
  if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
    userMessage = 'Connection failed. Please check your internet connection and try again.';
  } else if (error?.message?.includes('401')) {
    userMessage = 'Session expired. Please log in again.';
  } else if (error?.message?.includes('403')) {
    userMessage = 'You do not have permission to perform this action.';
  } else if (error?.message?.includes('404')) {
    userMessage = 'The requested resource was not found.';
  } else if (error?.message?.includes('500')) {
    userMessage = 'Server error. Please try again later.';
  }

  handleError(error, {
    context: operation,
    defaultMessage: userMessage
  });
}

/**
 * Show success message with consistent styling
 * @param message - Success message to display
 * @param duration - How long to show the message (optional)
 */
export function showSuccess(message: string, duration?: number): void {
  showToast(message, 'success', duration);
}

/**
 * Show warning message with consistent styling
 * @param message - Warning message to display
 * @param duration - How long to show the message (optional)
 */
export function showWarning(message: string, duration?: number): void {
  showToast(message, 'warning', duration);
}

/**
 * Show info message with consistent styling
 * @param message - Info message to display
 * @param duration - How long to show the message (optional)
 */
export function showInfo(message: string, duration?: number): void {
  showToast(message, 'info', duration);
} 