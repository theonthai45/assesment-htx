import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

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

const singleRow: Transcription[] = [mockTranscriptions[0]!]

describe("TranscriptionList", () => {
  it("it should render table headers when transcriptions are provided", () => {
    render(
      <TranscriptionList
        transcriptions={mockTranscriptions}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByText("File Name")).toBeInTheDocument()
    expect(screen.getByText("Transcription")).toBeInTheDocument()
    expect(screen.getByText("Created At")).toBeInTheDocument()
  })

  it("it should render each transcription row when transcriptions are provided", () => {
    render(
      <TranscriptionList
        transcriptions={mockTranscriptions}
        loading={false}
        error={null}
      />
    )

    expect(screen.getByText("audio1.mp3")).toBeInTheDocument()
    expect(screen.getByText("audio2.wav")).toBeInTheDocument()
  })

  it("it should show empty state when the transcriptions array is empty", () => {
    render(
      <TranscriptionList transcriptions={[]} loading={false} error={null} />
    )

    expect(
      screen.getByText(
        "No transcriptions yet. Upload an audio file to get started."
      )
    ).toBeInTheDocument()
  })

  it("it should show the audio playback section when a row is expanded", async () => {
    const user = userEvent.setup()
    render(
      <TranscriptionList
        transcriptions={singleRow}
        loading={false}
        error={null}
      />
    )

    await user.click(screen.getByText("audio1.mp3"))

    expect(screen.getByText("Audio playback")).toBeInTheDocument()
    const audio = document.querySelector("audio")
    expect(audio).not.toBeNull()
  })

  it("it should set the audio source to the API audio path for that file name", async () => {
    const user = userEvent.setup()
    render(
      <TranscriptionList
        transcriptions={singleRow}
        loading={false}
        error={null}
      />
    )

    await user.click(screen.getByText("audio1.mp3"))

    const audio = document.querySelector("audio")
    expect(audio).not.toBeNull()
    const src = audio?.getAttribute("src") ?? ""
    expect(src).toContain("/audio_files/")
    expect(src).toContain("audio1.mp3")
  })
})
