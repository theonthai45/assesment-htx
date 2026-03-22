import { useEffect, type ChangeEvent } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onDebouncedChange: (value: string) => void
  debounceMs?: number
  totalCount: number
  filteredCount: number
}

export function SearchBar({
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 350,
  totalCount,
  filteredCount,
}: SearchBarProps) {
  useEffect(() => {
    // This is to debounce the search so that it doesn't fire off too many requests
    const timeout = window.setTimeout(() => {
      onDebouncedChange(value.trim())
    }, debounceMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [debounceMs, onDebouncedChange, value])
  // Make sure that there is a query and it is not just empty spaces
  const hasQuery = value.trim().length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Transcriptions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          placeholder="Search by filename..."
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          aria-label="Search by filename"
        />
        <p className="text-xs text-muted-foreground">
          {hasQuery
            ? `Showing ${filteredCount} of ${totalCount} transcriptions`
            : `Showing all ${totalCount} transcriptions`}
        </p>
      </CardContent>
    </Card>
  )
}
