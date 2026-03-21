import { useCallback, useMemo, useState } from "react"
import { FileAudio, LayoutDashboard } from "lucide-react"

import { SearchBar } from "@/components/SearchBar"
import { TranscriptionList } from "@/components/TranscriptionList"
import { UploadForm } from "@/components/UploadForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranscriptions } from "@/hooks/useTranscriptions"

export function App() {
  const { transcriptions, loading, error, refresh } = useTranscriptions()
  const [searchValue, setSearchValue] = useState("")
  const [query, setQuery] = useState("")

  const filteredTranscriptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return transcriptions
    return transcriptions.filter((item) =>
      item.filename.toLowerCase().includes(normalized)
    )
  }, [query, transcriptions])

  const handleDebouncedSearch = useCallback((value: string) => {
    setQuery(value)
  }, [])

  return (
    <div className="min-h-svh bg-muted/30 p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LayoutDashboard className="size-4" />
                HTX Assessment Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                <FileAudio className="size-4" />
                Audio Transcriber
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  Audio Transcriber
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload audio, search historical files, and expand any
                transcription row to play back the original audio.
              </p>
            </CardHeader>
          </Card>

          <UploadForm onUploadSuccess={refresh} />
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onDebouncedChange={handleDebouncedSearch}
            totalCount={transcriptions.length}
            filteredCount={filteredTranscriptions.length}
          />
          <TranscriptionList
            transcriptions={filteredTranscriptions}
            loading={loading}
            error={error}
            refresh={refresh}
          />
        </main>
      </div>
    </div>
  )
}

export default App
