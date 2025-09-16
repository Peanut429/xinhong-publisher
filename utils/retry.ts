export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  return fn().catch((error) => {
    if (maxRetries > 0) {
      return retry(fn, maxRetries - 1);
    }
    throw error;
  });
}
