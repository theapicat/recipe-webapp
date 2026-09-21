export interface HttpResponse<T = undefined> {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  body?: T;
  timestamp?: string;
}
