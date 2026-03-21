import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FileUploadState, TranscribeResponse } from "@/types"

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export interface UploadFormProps {
  onUploadSuccess: () => void
}

function parseTranscribeResponse(data: unknown): TranscribeResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid transcribe response")
  }
  const rec = data as Record<string, unknown>
  if (
    typeof rec.filename !== "string" ||
    typeof rec.transcription !== "string"
  ) {
    throw new Error("Invalid transcribe response fields")
  }
  return { filename: rec.filename, transcription: rec.transcription }
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileUploadState[]>([])

  const openPicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const transcribeFiles = useCallback(
    async (selectedFiles: FileUploadState[]) => {
      if (!selectedFiles.length) return

      const nextStates = [...selectedFiles]
      let allSucceeded = true

      for (let i = 0; i < nextStates.length; i++) {
        const entry = nextStates[i]
        if (!entry) continue

        nextStates[i] = { ...entry, status: "uploading" }
        setFiles([...nextStates])

        try {
          const formData = new FormData()
          formData.append("file", entry.file)

          const response = await fetch(`${BASE_URL}/transcribe`, {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Upload failed with status ${response.status}`)
          }

          const data: unknown = await response.json()
          const result = parseTranscribeResponse(data)

          nextStates[i] = {
            ...entry,
            status: "success",
            result,
          }
        } catch (err) {
          allSucceeded = false
          const message =
            err instanceof Error ? err.message : "Transcription failed"
          nextStates[i] = {
            ...entry,
            status: "error",
            error: message,
          }
        }

        setFiles([...nextStates])
      }

      if (allSucceeded && nextStates.every((f) => f.status === "success")) {
        onUploadSuccess()
      }
    },
    [onUploadSuccess]
  )

  const onFilesSelected = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return
      const next: FileUploadState[] = Array.from(list).map((file) => ({
        file,
        status: "idle" as const,
      }))
      setFiles(next)
      void transcribeFiles(next)
    },
    [transcribeFiles]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onFilesSelected(e.target.files)
      e.target.value = ""
    },
    [onFilesSelected]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      onFilesSelected(e.dataTransfer.files)
    },
    [onFilesSelected]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Audio</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div
          role="presentation"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 px-6 py-10 text-center transition-colors hover:bg-muted/50"
          onClick={openPicker}
        >
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              openPicker()
            }}
          >
            Choose files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4"
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {files.length > 0 && (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-3">
              {files.map((item) => (
                <li
                  key={`${item.file.name}-${item.file.size}-${item.file.lastModified}`}
                  className="rounded-lg border border-border/60 bg-card/50 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.file.name}</span>
                    {item.status === "idle" && (
                      <Badge variant="secondary">idle</Badge>
                    )}
                    {item.status === "uploading" && (
                      <Badge variant="outline">uploading</Badge>
                    )}
                    {item.status === "success" && (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        success
                      </Badge>
                    )}
                    {item.status === "error" && (
                      <Badge variant="destructive">error</Badge>
                    )}
                  </div>
                  {item.status === "success" && item.result && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.result.transcription}
                    </p>
                  )}
                  {item.status === "error" && item.error && (
                    <p className="mt-2 text-sm text-destructive">{item.error}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
