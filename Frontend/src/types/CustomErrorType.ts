interface CustomError extends Error {
  response?: {
    data?: {
      message: string;
    };
  };
}

export default CustomError;
