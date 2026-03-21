import { Fragment, useCallback, useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export interface TranscriptionListProps {
  transcriptions: Transcription[]
  loading: boolean
  error: string | null
  refresh: () => void
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

export function TranscriptionList({
  transcriptions,
  loading,
  error,
  refresh,
}: TranscriptionListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [audioLoadErrors, setAudioLoadErrors] = useState<Record<number, boolean>>(
    {}
  )

  const toggleExpanded = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const markAudioError = useCallback((id: number) => {
    setAudioLoadErrors((prev) => ({ ...prev, [id]: true }))
  }, [])

  const audioSources = useMemo(() => {
    return Object.fromEntries(
      transcriptions.map((row) => [
        row.id,
        `${BASE_URL}/audio_files/${encodeURIComponent(row.filename)}`,
      ])
    ) as Record<number, string>
  }, [transcriptions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transcriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
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
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        )}

        {!loading && !error && transcriptions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No transcriptions yet. Upload an audio file to get started.
          </p>
        )}

        {!loading && !error && transcriptions.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Transcription</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcriptions.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => toggleExpanded(row.id)}
                    aria-expanded={expandedId === row.id}
                  >
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
                  {expandedId === row.id && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={3}>
                        <div className="space-y-2 py-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Audio playback
                          </p>
                          <audio
                            controls
                            className="w-full"
                            src={audioSources[row.id]}
                            onError={() => markAudioError(row.id)}
                          />
                          {audioLoadErrors[row.id] && (
                            <p className="text-xs text-muted-foreground">
                              Unable to load audio for this transcription.
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
