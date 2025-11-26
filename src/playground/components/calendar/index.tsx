import { useState } from "react";
import Calendar28 from "@/registry/calendar-28";
import { Calendar } from "@/registry/ui/calendar";

export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-hw-text mb-2">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Calendar component examples with different use cases.
        </p>
      </div>

      <div className="space-y-8">
        <div className="border rounded-lg p-6 bg-card">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Basic Calendar</h2>
              <p className="text-sm text-muted-foreground mb-4">
                A standalone calendar component for selecting a single date.
              </p>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Date Picker with Input</h2>
              <p className="text-sm text-muted-foreground mb-4">
                A date picker that combines an input field with a calendar popover. Users can type dates or use the calendar button to select a date.
              </p>
            </div>
            <Calendar28 />
          </div>
        </div>
      </div>
    </div>
  );
}

