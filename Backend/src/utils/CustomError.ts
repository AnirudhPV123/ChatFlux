class CustomError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: any[];
  public data: any | null;
  public status: string;
  public message: string;

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors: any[] = [],
    stack = '',
  ) {
    super(message); // Call the parent constructor with the message
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.data = null; // Assuming this is intended to be null by default
    this.status = statusCode >= 400 && statusCode < 500 ? 'failed' : 'error';

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default CustomError;
