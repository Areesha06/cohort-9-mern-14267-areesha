class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as a "known/expected" error, not a bug

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
