/* eslint-disable no-unsafe-finally */
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useApi = <P, R>(req: (params: P) => Promise<R>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<R>();

  const request = async (
    params?: Parameters<typeof req>[0],
    onSuccess?: (data: unknown) => void,
    onError?: (error: unknown) => void,
  ): Promise<R | undefined> => {
    setLoading(true);

    try {
      const response = await req(params as Parameters<typeof req>[0]);

      setData(response);
      setError(null);
      onSuccess?.(response);

      return response;
    } catch (err) {
      console.error('error api', err);
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);

      return undefined;
    }
  };

  return { data, error, loading, request };
};
