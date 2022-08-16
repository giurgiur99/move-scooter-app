class Exception extends Error {
  message: string | "Server err";
  status: number | 500;
  constructor(status?: number, message?: string) {
    super(message);
    this.message = message;
    this.status = status;
  }
}

export default Exception;
