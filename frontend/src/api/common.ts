// useSSE.ts
import { useState, useCallback } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { IUseSSE } from "./type";

export function useSSE(): IUseSSE {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(
    async (
      url: string,
      init: RequestInit,
      onMessage: (chunk: string) => void
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchEventSource(url, {
          ...init,
          headers: {},
          async onopen(res: Response) {
            if (!res.ok) {
              throw new Error(`HTTP status ${res.status}`);
            }
          },
          onmessage(ev) {
            if (JSON.parse(ev.data)?.token === "[DONE]") {
              setIsLoading(false);
            } else {
              let parsed: {
                token?: string;
                error?: string;
              };
              try {
                parsed = JSON.parse(ev.data);
              } catch {
                parsed = { token: ev.data };
              }
              if (parsed.token) {
                onMessage(parsed.token);
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            }
          },
          onerror(err) {
            setError(err as Error);
            setIsLoading(false);
            throw err;
          },
        });
      } catch (e) {
        setError(e as Error);
        setIsLoading(false);
      }
    },
    []
  );

  return { send, isLoading, error, data: "" };
}
