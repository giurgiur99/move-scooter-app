import Exception from "./Exception";

class NotFoundError extends Exception {
  propertyName: string;

  constructor(propertyName: string) {
    super(404, `${propertyName} not found.`);
    this.propertyName = propertyName;
  }
}

export default NotFoundError;
