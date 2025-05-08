export interface IUseSSE {
  send: (
    url: string,
    init: RequestInit,
    onMessage: (chunk: string) => void
  ) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  data: string;
}