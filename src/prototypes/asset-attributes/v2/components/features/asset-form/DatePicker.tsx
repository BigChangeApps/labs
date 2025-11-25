"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/registry/ui/button"
import { Calendar } from "@/registry/ui/calendar"
import { Input } from "@/registry/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = "Select date" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse the value string (YYYY-MM-DD) to a Date object
  const dateFromValue = React.useMemo(() => {
    if (!value) return undefined
    const parsed = new Date(value)
    return isValidDate(parsed) ? parsed : undefined
  }, [value])

  const [date, setDate] = React.useState<Date | undefined>(dateFromValue)
  const [month, setMonth] = React.useState<Date | undefined>(dateFromValue)
  const [displayValue, setDisplayValue] = React.useState(formatDate(dateFromValue))

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (dateFromValue) {
      setDate(dateFromValue)
      setMonth(dateFromValue)
      setDisplayValue(formatDate(dateFromValue))
    }
  }, [dateFromValue])

  return (
    <div className="relative flex gap-2">
      <Input
        value={displayValue}
        placeholder={placeholder}
        className="h-9 bg-background pr-10"
        onChange={(e) => {
          const inputValue = e.target.value
          setDisplayValue(inputValue)

          // Try to parse the input as a date
          const parsed = new Date(inputValue)
          if (isValidDate(parsed)) {
            setDate(parsed)
            setMonth(parsed)
            // Convert to YYYY-MM-DD format for form
            const isoDate = parsed.toISOString().split('T')[0]
            onChange?.(isoDate)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(selectedDate) => {
              setDate(selectedDate)
              setDisplayValue(formatDate(selectedDate))
              setOpen(false)

              // Convert to YYYY-MM-DD format for form
              if (selectedDate) {
                const isoDate = selectedDate.toISOString().split('T')[0]
                onChange?.(isoDate)
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
