export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch((error) => {
    if (maxRetries === 0) {
      throw error;
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        retry(fn, maxRetries - 1, delay)
          .then(resolve)
          .catch(reject);
      }, delay);
    });
  });
}
