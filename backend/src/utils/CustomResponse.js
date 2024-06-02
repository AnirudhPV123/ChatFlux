class CustomResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.status = statusCode < 400 && "Passed"
  }
}

export { CustomResponse };
