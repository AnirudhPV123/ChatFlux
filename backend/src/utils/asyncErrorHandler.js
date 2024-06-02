const asyncErrorHandler = (requestHandler) => (req, res, next) =>
  Promise.resolve(requestHandler(req, res, next)).catch(next);

export { asyncErrorHandler };
