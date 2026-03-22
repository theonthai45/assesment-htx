import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SearchBar } from "@/components/SearchBar"

function SearchBarWrapper({
  onDebouncedChange = vi.fn(),
  debounceMs = 350,
  totalCount = 10,
  filteredCount = 10,
}: {
  onDebouncedChange?: (value: string) => void
  debounceMs?: number
  totalCount?: number
  filteredCount?: number
}) {
  const [value, setValue] = React.useState("")
  return (
    <SearchBar
      value={value}
      onChange={setValue}
      onDebouncedChange={onDebouncedChange}
      debounceMs={debounceMs}
      totalCount={totalCount}
      filteredCount={filteredCount}
    />
  )
}

describe("SearchBar", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("it should update the input value when the user types", async () => {
    const user = userEvent.setup()
    render(<SearchBarWrapper />)

    const input = screen.getByLabelText(
      "Search by filename"
    ) as HTMLInputElement
    await user.type(input, "audio1")

    expect(input.value).toBe("audio1")
  })

  it("it should call the debounced callback when the user stops typing", async () => {
    vi.useFakeTimers()
    const onDebouncedChange = vi.fn()

    render(
      <SearchBarWrapper onDebouncedChange={onDebouncedChange} debounceMs={300} />
    )

    const input = screen.getByLabelText("Search by filename")
    fireEvent.change(input, { target: { value: "audio1" } })
    vi.advanceTimersByTime(300)

    expect(onDebouncedChange).toHaveBeenCalled()
    expect(onDebouncedChange).toHaveBeenLastCalledWith("audio1")
  })

  it("it should show total count text when the input is empty", () => {
    render(
      <SearchBar
        value=""
        onChange={vi.fn()}
        onDebouncedChange={vi.fn()}
        totalCount={12}
        filteredCount={12}
      />
    )

    expect(screen.getByText("Showing all 12 transcriptions")).toBeInTheDocument()
  })

  it("it should show filtered count text when the search input has a value", () => {
    render(
      <SearchBar
        value="sample"
        onChange={vi.fn()}
        onDebouncedChange={vi.fn()}
        totalCount={10}
        filteredCount={3}
      />
    )

    expect(
      screen.getByText("Showing 3 of 10 transcriptions")
    ).toBeInTheDocument()
  })
})
