import { useCallback, useEffect, useState } from "react"

import type { Transcription } from "@/types"

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

function parseTranscriptions(data: unknown): Transcription[] {
  if (!Array.isArray(data)) {
    throw new Error("Invalid transcriptions response")
  }
  return data.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Invalid transcription item at index ${index}`)
    }
    const rec = item as Record<string, unknown>
    if (
      typeof rec.id !== "number" ||
      typeof rec.filename !== "string" ||
      typeof rec.transcription !== "string" ||
      typeof rec.created_at !== "string"
    ) {
      throw new Error(`Invalid transcription fields at index ${index}`)
    }
    return {
      id: rec.id,
      filename: rec.filename,
      transcription: rec.transcription,
      created_at: rec.created_at,
    }
  })
}

export function useTranscriptions(): {
  transcriptions: Transcription[]
  loading: boolean
  error: string | null
  refresh: () => void
} {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BASE_URL}/transcriptions`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data: unknown = await response.json()
      setTranscriptions(parseTranscriptions(data))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load transcriptions"
      setError(message)
      setTranscriptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const refresh = useCallback(() => {
    void load()
  }, [load])

  return { transcriptions, loading, error, refresh }
}
