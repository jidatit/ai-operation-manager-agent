export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ReconnectRequiredError extends AppError {
  constructor(provider: string) {
    super(401, `${provider} connection requires reauthorization`, 'RECONNECT_REQUIRED', {
      provider,
    });
    this.name = 'ReconnectRequiredError';
  }
}
