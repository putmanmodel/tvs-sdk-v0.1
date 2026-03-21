export class TVSError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TVSError";
    this.code = code;
  }
}

export class ParseError extends TVSError {
  constructor(message: string) {
    super("TVS_PARSE_ERROR", message);
    this.name = "ParseError";
  }
}

export class ValidationError extends TVSError {
  constructor(message: string) {
    super("TVS_VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class TransitionError extends TVSError {
  constructor(message: string) {
    super("TVS_TRANSITION_ERROR", message);
    this.name = "TransitionError";
  }
}
