import Exception from "./Exception";

class BadInputError extends Exception {
  propertyName: string;

  constructor(propertyName: string) {
    super(403, `${propertyName} bad input, please try again`);
    this.propertyName = propertyName;
  }
}

export default BadInputError;
