import { useCallback, useState, type ChangeEvent, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Transcription } from "@/types"

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

function parseTranscriptions(data: unknown): Transcription[] {
  if (!Array.isArray(data)) {
    throw new Error("Invalid search response")
  }
  return data.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Invalid search item at index ${index}`)
    }
    const rec = item as Record<string, unknown>
    if (
      typeof rec.id !== "number" ||
      typeof rec.filename !== "string" ||
      typeof rec.transcription !== "string" ||
      typeof rec.created_at !== "string"
    ) {
      throw new Error(`Invalid search fields at index ${index}`)
    }
    return {
      id: rec.id,
      filename: rec.filename,
      transcription: rec.transcription,
      created_at: rec.created_at,
    }
  })
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

export function SearchBar() {
  const [inputValue, setInputValue] = useState("")
  const [results, setResults] = useState<Transcription[] | null>(null)
  const [lastQuery, setLastQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const runSearch = useCallback(async () => {
    const q = inputValue.trim()
    if (!q) {
      setResults(null)
      setSearched(false)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)
    setLastQuery(q)

    try {
      const params = new URLSearchParams({ filename: q })
      const response = await fetch(`${BASE_URL}/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`)
      }
      const data: unknown = await response.json()
      setResults(parseTranscriptions(data))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Search request failed"
      setError(message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [inputValue])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      if (value === "") {
        setResults(null)
        setSearched(false)
        setError(null)
        setLoading(false)
      }
    },
    []
  )

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      void runSearch()
    },
    [runSearch]
  )

  const showPanel = inputValue.trim().length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Transcriptions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search by filename..."
            value={inputValue}
            onChange={handleInputChange}
            className="sm:flex-1"
            aria-label="Search by filename"
          />
          <Button type="submit">Search</Button>
        </form>

        {showPanel && (
          <div className="flex flex-col gap-2">
            {loading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Transcription</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[0, 1, 2].map((key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && error && (
              <p className="text-sm text-muted-foreground">{error}</p>
            )}

            {!loading &&
              !error &&
              searched &&
              results &&
              results.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No results found for {lastQuery}
                </p>
              )}

            {!loading && !error && results && results.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Transcription</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-[140px] truncate font-medium">
                        {row.filename}
                      </TableCell>
                      <TableCell className="max-w-md whitespace-normal break-words">
                        {row.transcription}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCreatedAt(row.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
