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
import {
  applyDateMask,
  parseDDMMYYYY,
  formatDDMMYYYY,
  formatDateToISO,
  validateDateInput,
  isValidDate,
} from "../../../lib/date-utils"

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY"
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [month, setMonth] = React.useState<Date | undefined>(undefined)
  const [maskedValue, setMaskedValue] = React.useState("")
  const [hasBlurred, setHasBlurred] = React.useState(false)
  const [inputError, setInputError] = React.useState<string | null>(null)
  const [inputMethod, setInputMethod] = React.useState<'calendar' | 'typing' | 'external'>('external')

  const inputRef = React.useRef<HTMLInputElement>(null)
  const cursorPosRef = React.useRef<number>(0)

  // Sync from form value to display (external changes)
  React.useEffect(() => {
    if (inputMethod === 'typing') return

    if (!value) {
      setMaskedValue('')
      setDate(undefined)
      setMonth(undefined)
      return
    }

    const parsed = new Date(value)
    if (isValidDate(parsed)) {
      setDate(parsed)
      setMonth(parsed)
      setMaskedValue(formatDDMMYYYY(parsed))
      setInputMethod('external')
    }
  }, [value, inputMethod])

  // Restore cursor position after masking
  React.useEffect(() => {
    if (inputRef.current && inputMethod === 'typing') {
      inputRef.current.setSelectionRange(cursorPosRef.current, cursorPosRef.current)
    }
  }, [maskedValue, inputMethod])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMethod('typing')

    const inputValue = e.target.value
    const cursorPos = e.target.selectionStart || 0

    // Apply masking
    const masked = applyDateMask(inputValue)
    setMaskedValue(masked)

    // Calculate new cursor position
    const digitsBeforeCursor = inputValue.slice(0, cursorPos).replace(/\D/g, '').length
    let newCursorPos = digitsBeforeCursor
    if (digitsBeforeCursor > 2) newCursorPos++
    if (digitsBeforeCursor > 4) newCursorPos++
    cursorPosRef.current = newCursorPos

    // Clear errors while typing
    setInputError(null)
  }

  const handleBlur = () => {
    setHasBlurred(true)
    setInputMethod('external')

    const error = validateDateInput(maskedValue)
    setInputError(error)

    if (!error && maskedValue) {
      const parsed = parseDDMMYYYY(maskedValue)
      if (parsed) {
        setDate(parsed)
        setMonth(parsed)
        const isoDate = formatDateToISO(parsed)
        onChange?.(isoDate)
      }
    } else if (!maskedValue) {
      setDate(undefined)
      setMonth(undefined)
      onChange?.('')
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    setInputMethod('calendar')
    setDate(selectedDate)
    setMonth(selectedDate)
    setMaskedValue(formatDDMMYYYY(selectedDate))

    const isoDate = formatDateToISO(selectedDate)
    onChange?.(isoDate)

    setOpen(false)
    setInputError(null)
    setHasBlurred(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex gap-2">
        <Input
          ref={inputRef}
          value={maskedValue}
          placeholder={placeholder}
          className="h-9 bg-background pr-10"
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-invalid={!!inputError}
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
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      {hasBlurred && inputError && (
        <p className="text-sm text-destructive">
          {inputError}
        </p>
      )}
    </div>
  )
}
