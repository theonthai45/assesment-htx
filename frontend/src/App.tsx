import { SearchBar } from "@/components/SearchBar"
import { TranscriptionList } from "@/components/TranscriptionList"
import { UploadForm } from "@/components/UploadForm"
import { useTranscriptions } from "@/hooks/useTranscriptions"

export function App() {
  const { transcriptions, loading, error, refresh } = useTranscriptions()

  return (
    <div className="min-h-svh bg-muted/30 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4">
        <header className="text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Audio Transcriber
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload audio, search past files, and browse every stored
            transcription in one place.
          </p>
        </header>

        <UploadForm onUploadSuccess={refresh} />
        <SearchBar />
        <TranscriptionList
          transcriptions={transcriptions}
          loading={loading}
          error={error}
          refresh={refresh}
        />
      </div>
    </div>
  )
}

export default App
