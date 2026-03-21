export interface Transcription {
  id: number
  filename: string
  transcription: string
  created_at: string
}

export interface TranscribeResponse {
  filename: string
  transcription: string
}

export type UploadStatus = "idle" | "uploading" | "success" | "error"

export interface FileUploadState {
  file: File
  status: UploadStatus
  result?: TranscribeResponse
  error?: string
}
