export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
