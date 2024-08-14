export async function sleep(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
  
  export type Logger = (
    payloadDescription: string,
    iteration: number,
    maxIterations: number,
    sleepTimeMs: number,
    e: any
  ) => void;
  
  function defaultLogger(
    payloadDescription: string,
    iteration: number,
    maxIterations: number,
    sleepTimeMs: number,
    e: any
  ): void {
    const message = `Retrying "${payloadDescription}" attempt ${iteration}/${maxIterations} sleeping ${sleepTimeMs}ms: "${e}"`;
    const output = iteration === maxIterations ? console.error : console.warn;
    output(message);
  }
  
  export default async function catcherRetryer<Raw, Result>(
    payload: () => Promise<Raw>,
    shouldRetryError: (err: any) => boolean,
    prepareResponseOrThrow: (resp: Raw) => Result | never,
    maxRetries: number,
    minSleepMs: number,
    payloadDescription = '',
    logger: Logger = defaultLogger
  ): Promise<Result> {
    for (let retryCounter = 1; retryCounter <= maxRetries; retryCounter++) {
      const sleepTime = retryCounter * minSleepMs;
      try {
        const rawResp: Raw = await payload();
        return prepareResponseOrThrow(rawResp);
      } catch (e) {
        if (shouldRetryError(e)) {
          if (retryCounter === maxRetries) {
            throw e;
          }
  
          logger(payloadDescription, retryCounter, maxRetries, sleepTime, e);
          await sleep(sleepTime);
        }
      }
    }
  
    throw Error('This should never happen in catcherRetryer');
  }
  