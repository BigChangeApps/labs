import { useState, useRef, useEffect } from "react";
import { Pencil, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/registry/lib/utils";
import { Input } from "@/registry/ui/input";
import { Calendar } from "@/registry/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/ui/popover";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: "text" | "date" | "textarea";
  className?: string;
  displayClassName?: string;
}

export function EditableField({
  value,
  onChange,
  label,
  placeholder = "Click to edit...",
  type = "text",
  className,
  displayClassName,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (type !== "date") {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Date picker
  if (type === "date") {
    const dateValue = value ? new Date(value) : undefined;
    const displayDate = dateValue
      ? format(dateValue, "dd MMM yyyy")
      : placeholder;

    return (
      <div className={cn("group", className)}>
        {label && (
          <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] block mb-1">
            {label}
          </span>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md transition-all text-left w-full",
                "hover:bg-[rgba(8,109,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(8,109,255,0.2)]",
                displayClassName
              )}
            >
              <span
                className={cn(
                  "text-sm tracking-[-0.14px]",
                  value ? "text-[#0B2642]" : "text-[#73777D]"
                )}
              >
                {displayDate}
              </span>
              <CalendarIcon className="h-4 w-4 text-[#73777D] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => {
                if (date) {
                  onChange(format(date, "yyyy-MM-dd"));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Textarea
  if (type === "textarea") {
    if (isEditing) {
      return (
        <div className={cn("", className)}>
          {label && (
            <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] block mb-1">
              {label}
            </span>
          )}
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleCancel();
            }}
            className="w-full min-h-[80px] px-2 py-1.5 text-sm text-[#0B2642] bg-white rounded-md border border-[#086DFF] shadow-[0_0_0_2px_rgba(8,109,255,0.2)] resize-none focus:outline-none"
            placeholder={placeholder}
          />
        </div>
      );
    }

    return (
      <div
        className={cn("group cursor-pointer", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleStartEdit}
      >
        {label && (
          <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] block mb-1">
            {label}
          </span>
        )}
        <div
          className={cn(
            "flex items-start gap-2 px-2 py-1.5 rounded-md transition-all min-h-[60px]",
            "hover:bg-[rgba(8,109,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(8,109,255,0.2)]",
            displayClassName
          )}
        >
          <span
            className={cn(
              "text-sm tracking-[-0.14px] whitespace-pre-wrap flex-1",
              value ? "text-[#0B2642]" : "text-[#73777D]"
            )}
          >
            {value || placeholder}
          </span>
          <Pencil
            className={cn(
              "h-3.5 w-3.5 text-[#73777D] shrink-0 mt-0.5 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>
    );
  }

  // Text input
  if (isEditing) {
    return (
      <div className={cn("", className)}>
        {label && (
          <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] block mb-1">
            {label}
          </span>
        )}
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-8"
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("group cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartEdit}
    >
      {label && (
        <span className="text-xs font-medium text-[#73777D] tracking-[-0.12px] block mb-1">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded-md transition-all",
          "hover:bg-[rgba(8,109,255,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(8,109,255,0.2)]",
          displayClassName
        )}
      >
        <span
          className={cn(
            "text-sm tracking-[-0.14px]",
            value ? "text-[#0B2642]" : "text-[#73777D]"
          )}
        >
          {value || placeholder}
        </span>
        <Pencil
          className={cn(
            "h-3.5 w-3.5 text-[#73777D] shrink-0 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  );
}

