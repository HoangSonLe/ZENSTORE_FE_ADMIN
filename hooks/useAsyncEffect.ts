import { useEffect } from 'react';

type Callback = () => Promise<any>;

type CatchError = (error: any) => void;

type Deps = readonly any[];

export const useAsyncEffect = (asyncEffect: Callback, dependencies: Deps = [], catchError?: CatchError) => {
  useEffect(() => {
    const executeAsyncEffect = async () => {
      try {
        const cleanup = await asyncEffect();

        if (cleanup && typeof cleanup === 'function') {
          return cleanup;
        }
      } catch (error) {
        catchError?.(error);
      }
    };

    const cleanup: any = executeAsyncEffect();

    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => {
          if (typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      } else if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, dependencies);
};
