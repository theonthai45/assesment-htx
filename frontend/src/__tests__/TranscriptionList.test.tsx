import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TranscriptionList } from "@/components/TranscriptionList"
import type { Transcription } from "@/types"

const mockTranscriptions: Transcription[] = [
  {
    id: 1,
    filename: "audio1.mp3",
    transcription: "Hello world",
    created_at: "2025-01-01T10:00:00",
  },
  {
    id: 2,
    filename: "audio2.wav",
    transcription: "Testing one two",
    created_at: "2025-01-02T11:00:00",
  },
]

describe("TranscriptionList", () => {
  it("it should render table headers when transcriptions are provided", () => {
    render(
      <TranscriptionList
        transcriptions={mockTranscriptions}
        loading={false}
        error={null}
        refresh={vi.fn()}
      />
    )

    expect(screen.getByText("Filename")).toBeInTheDocument()
    expect(screen.getByText("Transcription")).toBeInTheDocument()
    expect(screen.getByText("Created At")).toBeInTheDocument()
  })

  it("it should render each transcription row when transcriptions are provided", () => {
    render(
      <TranscriptionList
        transcriptions={mockTranscriptions}
        loading={false}
        error={null}
        refresh={vi.fn()}
      />
    )

    expect(screen.getByText("audio1.mp3")).toBeInTheDocument()
    expect(screen.getByText("audio2.wav")).toBeInTheDocument()
  })

  it("it should show empty state when the transcriptions array is empty", () => {
    render(
      <TranscriptionList
        transcriptions={[]}
        loading={false}
        error={null}
        refresh={vi.fn()}
      />
    )

    expect(
      screen.getByText(
        "No transcriptions yet. Upload an audio file to get started."
      )
    ).toBeInTheDocument()
  })
})
