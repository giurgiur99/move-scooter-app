import Exception from "./Exception";

class MissingParam extends Exception {
  propertyName: string;

  constructor(propertyName: string) {
    super(404, `${propertyName} is missing, please check again!.`);
    this.propertyName = propertyName;
  }
}

export default MissingParam;
