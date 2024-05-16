export class AuthRequiredError extends Error {
  constructor(message = "Something went wrong!!!") {
    super(message);
    this.name = "AuthRequiredError";
  }
}
