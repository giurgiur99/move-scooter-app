import Exception from "./Exception";

class DuplicateFoundError extends Exception {
  propertyName: string;

  constructor(propertyName: string) {
    super(403, `${propertyName} already present in database.`);
    this.propertyName = propertyName;
  }
}

export default DuplicateFoundError;
