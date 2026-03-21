import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transcriptions</CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={() => refresh()}
            aria-label="Refresh transcriptions"
          >
            <RefreshCw className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
