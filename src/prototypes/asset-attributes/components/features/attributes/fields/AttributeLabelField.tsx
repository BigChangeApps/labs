import { Label } from "@/registry/ui/label";
import { Input } from "@/registry/ui/input";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface AttributeLabelFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Utility functions for text case handling
function toSentenceCase(text: string): string {
  if (!text) return text;
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function hasExcessiveCaps(text: string): boolean {
  if (!text || text.length < 2) return false;

  // Remove spaces and get only letters
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return false;

  const uppercaseCount = letters.replace(/[^A-Z]/g, '').length;
  const uppercasePercentage = uppercaseCount / letters.length;

  // Consider it excessive if more than 80% uppercase and not a short acronym
  return uppercasePercentage > 0.8 && letters.length > 4;
}

export function AttributeLabelField({
  value,
  onChange,
  disabled = false,
}: AttributeLabelFieldProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setShowWarning(hasExcessiveCaps(newValue));
  };

  const handleBlur = () => {
    if (value && value !== toSentenceCase(value)) {
      onChange(toSentenceCase(value));
      setShowWarning(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="label">Attribute Label</Label>
      <Input
        id="label"
        placeholder="e.g., Purchase price"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
      />
      {showWarning && (
        <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Sentence case makes attributes easier to read for all users. Use block capitals for acronyms only when necessary.
          </p>
        </div>
      )}
    </div>
  );
}

