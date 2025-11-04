import { useState, useRef, useEffect } from "react";
import { Plus, X, CornerDownLeft } from "lucide-react";
import { Label } from "@/registry/ui/label";
import { Input } from "@/registry/ui/input";
import { Button } from "@/registry/ui/button";
import { Kbd } from "@/registry/ui/kbd";

interface AttributeDropdownOptionsFieldProps {
  options: string[];
  onChange: (options: string[]) => void;
  disabled?: boolean;
}

export function AttributeDropdownOptionsField({
  options,
  onChange,
  disabled = false,
}: AttributeDropdownOptionsFieldProps) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(
    null
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (focusIndex !== null && inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
      setFocusIndex(null);
    }
  }, [focusIndex, options]);

  const handleAddOption = () => {
    const newIndex = options.length;
    onChange([...options, ""]);
    setFocusIndex(newIndex);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      onChange(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Dropdown Options</Label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                onKeyDown={(e) => handleOptionKeyDown(e)}
                onFocus={() => setFocusedInputIndex(index)}
                onBlur={() => setFocusedInputIndex(null)}
                disabled={disabled}
                className="pr-12"
              />
              {focusedInputIndex === index && !disabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Kbd>
                    <CornerDownLeft className="h-3 w-3" />
                  </Kbd>
                </div>
              )}
            </div>
            {options.length > 1 && !disabled && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        )}
      </div>
    </div>
  );
}

