import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { UploadForm } from "@/components/UploadForm"

describe("UploadForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("it should render a file input when the component mounts", () => {
    render(<UploadForm onUploadSuccess={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    expect(input).not.toBeNull()
    expect(input).toBeInstanceOf(HTMLInputElement)
  })

  it("it should display the filename when the user selects a file", async () => {
    const user = userEvent.setup()
    render(<UploadForm onUploadSuccess={vi.fn()} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(["x"], "clip.mp3", { type: "audio/mpeg" })

    await user.upload(input, file)

    expect(screen.getByText("clip.mp3")).toBeInTheDocument()
  })

  it("it should show a success badge after a successful upload", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          filename: "clip.mp3",
          transcription: "hello from test",
        }),
      })
    )

    render(<UploadForm onUploadSuccess={vi.fn()} />)

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const file = new File(["x"], "clip.mp3", { type: "audio/mpeg" })
    await user.upload(input, file)

    expect(
      await screen.findByText("hello from test", {}, { timeout: 3000 })
    ).toBeInTheDocument()

    const listItem = screen.getByText("clip.mp3").closest("li")
    expect(listItem).not.toBeNull()
    expect(within(listItem as HTMLElement).getByText("success")).toBeInTheDocument()
  })
})
