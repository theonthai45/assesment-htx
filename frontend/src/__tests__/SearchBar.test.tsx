import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SearchBar } from "@/components/SearchBar"

describe("SearchBar", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("it should update the input value when the user types", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByLabelText("Search by filename")
    await user.type(input, "audio1")

    expect(input).toHaveValue("audio1")
  })

  it("it should call fetch with the correct URL when the search form is submitted", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<SearchBar />)

    const input = screen.getByLabelText("Search by filename")
    await user.type(input, "audio1")
    await user.click(screen.getByRole("button", { name: "Search" }))

    expect(fetchMock).toHaveBeenCalled()
    const url = String(fetchMock.mock.calls[0]?.[0] ?? "")
    expect(url).toContain("search?filename=")
    expect(url).toContain("audio1")
  })

  it("it should display results in a table when the search returns matches", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 9,
            filename: "found.mp3",
            transcription: "match",
            created_at: "2025-03-01T12:00:00",
          },
        ],
      })
    )

    render(<SearchBar />)

    const input = screen.getByLabelText("Search by filename")
    await user.type(input, "found")
    await user.click(screen.getByRole("button", { name: "Search" }))

    expect(await screen.findByText("found.mp3")).toBeInTheDocument()
    expect(screen.getByText("match")).toBeInTheDocument()
  })
})
