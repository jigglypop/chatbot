// useSSE.ts
import { useState, useCallback } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { IUseSSE } from './type'

export function useSSE(): IUseSSE {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<Error|null>(null)

  const send = useCallback(async (url: string, init: RequestInit, onMessage: (chunk: string) => void) => {
    setIsLoading(true)
    setError(null)

    try {
      await fetchEventSource(url, {
          ...init,
        onopen(res) {
            if (!res.ok) throw new Error(`HTTP status ${res.status}`)
        },
        onmessage(ev) {
            if (JSON.parse(ev.data)?.data === '[DONE]') {
                setIsLoading(false)
            } else {
            let parsed: any
            try {
                parsed = JSON.parse(ev.data)
            } catch {
                parsed = { data: ev.data }
            }
            if (parsed.data) {
                onMessage(parsed.data)
            }
            if (parsed.error) {
            throw new Error(parsed.error)
            }
  }
},
        onerror(err) {
          setError(err as Error)
          setIsLoading(false)
          // 재시도 하지 않으려면 throw
          throw err
        },
      })
    } catch (e) {
      setError(e as Error)
      setIsLoading(false)
    }
  }, [])

  return { send, isLoading, error, data: '' }
}
