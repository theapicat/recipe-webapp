export interface HttpResponse<T> {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  body?: T;
  timestamp?: string;
}
