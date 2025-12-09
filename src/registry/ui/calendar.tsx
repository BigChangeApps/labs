import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker"

import { cn } from "@/registry/lib/utils"
import { Button } from "@/registry/ui/button"

function CalendarPreviousButton({
  onClick,
  disabled,
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const ref = React.useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" && ref.current) {
      e.preventDefault()
      ref.current.click()
    }
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("size-(--cell-size)", className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  )
}

function CalendarNextButton({
  onClick,
  disabled,
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const ref = React.useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" && ref.current) {
      e.preventDefault()
      ref.current.click()
    }
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("size-(--cell-size)", className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  )
}

function CalendarRoot({
  className,
  rootRef,
  ...props
}: React.ComponentProps<"div"> & { rootRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="calendar"
      ref={rootRef}
      className={cn(className)}
      {...props}
    />
  )
}

function CalendarChevron({
  className,
  orientation,
  ...props
}: React.ComponentProps<"svg"> & { orientation?: "left" | "right" | "down" | "up" }) {
  if (orientation === "left") {
    return (
      <ChevronLeftIcon className={cn("size-4", className)} {...props} />
    )
  }

  if (orientation === "right") {
    return (
      <ChevronRightIcon
        className={cn("size-4", className)}
        {...props}
      />
    )
  }

  if (orientation === "up") {
    return (
      <ChevronDownIcon className={cn("size-4 rotate-180", className)} {...props} />
    )
  }

  return (
    <ChevronDownIcon className={cn("size-4", className)} {...props} />
  )
}

function CalendarWeekNumber({
  children,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td {...props}>
      <div className="flex size-(--cell-size) items-center justify-center text-center">
        {children}
      </div>
    </td>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  const memoizedComponents = React.useMemo(
    () => ({
      Root: CalendarRoot,
      Chevron: CalendarChevron,
      PreviousMonthButton: CalendarPreviousButton,
      NextMonthButton: CalendarNextButton,
      DayButton: CalendarDayButton,
      WeekNumber: CalendarWeekNumber,
      ...components,
    }),
    [components]
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
        className={cn(
          "bg-hw-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-hw-focus border border-hw-border shadow-input has-focus:ring-hw-focus/30 has-focus:ring-4 rounded-input",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-hw-surface inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-hw-text-secondary [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-hw-text-secondary rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-hw-text-secondary",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-hw-surface-subtle",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-hw-surface-subtle", defaultClassNames.range_end),
        today: cn(
          "bg-hw-surface-subtle text-hw-text rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-hw-text-secondary aria-selected:text-hw-text-secondary",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-hw-text-secondary opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={memoizedComponents}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Ensure Enter key triggers date selection (Space already works via default button behavior)
    if (e.key === "Enter" && ref.current) {
      e.preventDefault()
      // Use the button's native click() method to trigger all click handlers
      ref.current.click()
    }
    // Call the original onKeyDown handler if provided
    onKeyDown?.(e)
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-hw-brand data-[selected-single=true]:text-hw-brand-foreground data-[range-middle=true]:bg-hw-surface-subtle data-[range-middle=true]:text-hw-text data-[range-start=true]:bg-hw-brand data-[range-start=true]:text-hw-brand-foreground data-[range-end=true]:bg-hw-brand data-[range-end=true]:text-hw-brand-foreground group-data-[focused=true]/day:border-hw-focus group-data-[focused=true]/day:ring-hw-focus/30 dark:hover:text-hw-text flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-4 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
